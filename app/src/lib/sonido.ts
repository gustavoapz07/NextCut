// Tonos cortos para "te toca" (celular del cliente) y para los anuncios de la TV.
// Los navegadores no dejan sonar nada hasta que la persona toca la página una vez.

type ConAudioViejo = Window & { webkitAudioContext?: typeof AudioContext };

let contexto: AudioContext | null = null;

function crearContexto() {
  const Contexto = window.AudioContext ?? (window as ConAudioViejo).webkitAudioContext;
  return Contexto ? new Contexto() : null;
}

/** Se llama desde un toque (por ejemplo, "Activar sonido"): deja el audio listo para después. */
export function prepararSonido() {
  try {
    contexto ??= crearContexto();
    void contexto?.resume();
    return contexto !== null;
  } catch {
    return false;
  }
}

/** Dos tonos que suben. Si el navegador todavía no deja sonar, no pasa nada. */
export function tocarTonos(frecuencias: readonly number[] = [880, 1175]) {
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  try {
    contexto ??= crearContexto();
    if (!contexto) return;
    void contexto.resume();
    for (const [indice, frecuencia] of frecuencias.entries()) {
      const inicio = contexto.currentTime + indice * 0.35;
      const tono = contexto.createOscillator();
      const volumen = contexto.createGain();
      tono.frequency.value = frecuencia;
      volumen.gain.setValueAtTime(0.0001, inicio);
      volumen.gain.exponentialRampToValueAtTime(0.3, inicio + 0.02);
      volumen.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.3);
      tono.connect(volumen).connect(contexto.destination);
      tono.start(inicio);
      tono.stop(inicio + 0.32);
    }
  } catch {
    // Sin sonido.
  }
}
