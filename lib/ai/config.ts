/* Configuración de los modelos del laboratorio. Vive aparte para que
   la interfaz pueda mostrar datos (p. ej. nº de parámetros) sin cargar
   los motores, que se descargan solo al acercarse al laboratorio. */

export const NET = { freqs: 12, sigma: 2.4, hidden: 24, learningRate: 0.006, batch: 96, seed: 5 } as const;

/** Parámetros entrenables de PixelNet: dos capas ocultas y una salida. */
export function paramCount(freqs: number, hidden: number) {
  const nIn = freqs * 2;
  return hidden * nIn + hidden + hidden * hidden + hidden + hidden + 1;
}

export const AGENT = { cols: 16, rows: 10 } as const;
