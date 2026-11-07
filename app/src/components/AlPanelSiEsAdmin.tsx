import { type ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router";
import { soyAdmin } from "@/lib/cuentas";
import { Cargando } from "./Marco";

/**
 * Para las pantallas de "esta cuenta no tiene barbería" o "no tiene silla": si la cuenta es el
 * admin, no es un error, es que entró al panel equivocado. Lo manda al suyo (ADR-018).
 */
export function AlPanelSiEsAdmin({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    let vivo = true;
    void soyAdmin().then((es) => {
      if (vivo) setAdmin(es);
    });
    return () => {
      vivo = false;
    };
  }, []);
  if (admin === null) return <Cargando />;
  if (admin) return <Navigate to="/admin" replace />;
  return children;
}
