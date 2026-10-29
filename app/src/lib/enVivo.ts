// Datos en vivo de la fila. El canal público `fila:<barberia_id>` solo trae una señal vacía
// ("la fila cambió"); cada pantalla vuelve a pedir sus datos con sus propios permisos (ADR-007).

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { esquemaFilaPublica, type FilaPublica } from "./fila";
import { supabase } from "./supabase";
import { ACTIVOS, esquemaTurnoPublico, type TurnoPublico } from "./turno";

/** Junta las señales que llegan seguidas (un turno que cambia dispara varias) en una sola recarga. */
const AGRUPAR_MS = 250;
/** Recarga de respaldo mientras la página está visible, por si se pierde una señal. */
const RESPALDO_MS = 60_000;

/**
 * Llama a `alCambiar` cada vez que cambia la fila de la barbería. Escucha el canal solo mientras
 * la página está visible (ahorra conexiones); oculta, consulta cada `sondeoOculta` ms si se pide.
 */
export function useSenalFila(
  barberiaId: string | null,
  alCambiar: () => void,
  sondeoOculta: number | null = null,
) {
  const ultima = useRef(alCambiar);
  useEffect(() => {
    ultima.current = alCambiar;
  });

  useEffect(() => {
    if (!barberiaId) return;
    let canal: RealtimeChannel | null = null;
    let intervalo: number | undefined;
    let espera: number | undefined;

    const avisar = () => {
      window.clearTimeout(espera);
      espera = window.setTimeout(() => ultima.current(), AGRUPAR_MS);
    };
    const conectar = () => {
      if (canal) return;
      canal = supabase
        .channel(`fila:${barberiaId}`, { config: { private: false } })
        .on("broadcast", { event: "cambio" }, avisar)
        // Al conectar (o reconectar) se recarga, por si algo cambió mientras no se escuchaba.
        .subscribe((estado) => {
          if (estado === "SUBSCRIBED") avisar();
        });
    };
    const desconectar = () => {
      if (!canal) return;
      void supabase.removeChannel(canal);
      canal = null;
    };
    const segunVisibilidad = () => {
      window.clearInterval(intervalo);
      intervalo = undefined;
      if (document.visibilityState === "visible") {
        conectar();
        intervalo = window.setInterval(() => ultima.current(), RESPALDO_MS);
      } else {
        desconectar();
        if (sondeoOculta) intervalo = window.setInterval(() => ultima.current(), sondeoOculta);
      }
    };

    segunVisibilidad();
    document.addEventListener("visibilitychange", segunVisibilidad);
    return () => {
      document.removeEventListener("visibilitychange", segunVisibilidad);
      window.clearInterval(intervalo);
      window.clearTimeout(espera);
      desconectar();
    };
  }, [barberiaId, sondeoOculta]);
}

export type EstadoFila =
  | { tipo: "cargando" }
  | { tipo: "no_existe" }
  | { tipo: "error" }
  | { tipo: "lista"; datos: FilaPublica };

/** La fila pública de una barbería, siempre al día. */
export function useFilaPublica(slug: string) {
  const [estado, setEstado] = useState<EstadoFila>({ tipo: "cargando" });
  const ultimaPeticion = useRef(0);

  const recargar = useCallback(async () => {
    const peticion = ++ultimaPeticion.current;
    const { data, error } = await supabase.rpc("fila_publica", { p_slug: slug });
    // Si llegó una respuesta más nueva mientras tanto, esta ya no sirve.
    if (peticion !== ultimaPeticion.current) return;

    if (error) {
      // Con datos en pantalla se conservan; el siguiente aviso o el respaldo vuelve a intentar.
      setEstado((anterior) => (anterior.tipo === "lista" ? anterior : { tipo: "error" }));
      return;
    }
    if (data === null) {
      setEstado({ tipo: "no_existe" });
      return;
    }
    const leido = esquemaFilaPublica.safeParse(data);
    setEstado(leido.success ? { tipo: "lista", datos: leido.data } : { tipo: "error" });
  }, [slug]);

  useEffect(() => {
    setEstado({ tipo: "cargando" });
    void recargar();
  }, [recargar]);

  useSenalFila(estado.tipo === "lista" ? estado.datos.barberia.id : null, recargar);
  return { estado, recargar };
}

export type EstadoTurno =
  | { tipo: "cargando" }
  | { tipo: "no_existe" }
  | { tipo: "error" }
  | { tipo: "listo"; turno: TurnoPublico; fila: FilaPublica | null };

/**
 * Un turno siempre al día. Mientras está activo también trae la fila completa, que da el
 * estimado y el canal de la barbería. Oculta, la página consulta cada 20 s (plan, sección 6).
 */
export function useTurno(codigo: string) {
  const [estado, setEstado] = useState<EstadoTurno>({ tipo: "cargando" });
  const ultimaPeticion = useRef(0);

  const recargar = useCallback(async () => {
    const peticion = ++ultimaPeticion.current;
    const { data, error } = await supabase.rpc("ver_turno", { p_codigo: codigo });
    if (peticion !== ultimaPeticion.current) return;
    if (error) {
      setEstado((anterior) => (anterior.tipo === "listo" ? anterior : { tipo: "error" }));
      return;
    }
    if (data === null) {
      setEstado({ tipo: "no_existe" });
      return;
    }
    const turno = esquemaTurnoPublico.safeParse(data);
    if (!turno.success) {
      setEstado({ tipo: "error" });
      return;
    }

    let fila: FilaPublica | null = null;
    if (ACTIVOS.includes(turno.data.estado)) {
      const respuesta = await supabase.rpc("fila_publica", { p_slug: turno.data.barberia.slug });
      if (peticion !== ultimaPeticion.current) return;
      const leida = esquemaFilaPublica.safeParse(respuesta.data);
      fila = leida.success ? leida.data : null;
    }
    setEstado({ tipo: "listo", turno: turno.data, fila });
  }, [codigo]);

  useEffect(() => {
    setEstado({ tipo: "cargando" });
    void recargar();
  }, [recargar]);

  const activo = estado.tipo === "listo" && ACTIVOS.includes(estado.turno.estado);
  const barberiaId = activo && estado.fila ? estado.fila.barberia.id : null;
  useSenalFila(barberiaId, recargar, 20_000);
  return { estado, recargar };
}
