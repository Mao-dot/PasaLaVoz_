export type ResultadoFechaIncidente =
  | { valida: true; fecha: Date }
  | { valida: false; mensaje: string }

/** Valida una fecha local antes de convertirla al ISO que usa el prototipo. */
export function validarFechaIncidente(
  valor: string,
  ahoraMs = Date.now(),
): ResultadoFechaIncidente {
  if (!valor.trim()) {
    return { valida: false, mensaje: 'Selecciona una fecha y hora válidas.' }
  }

  const fecha = new Date(valor)
  const tiempo = fecha.getTime()

  if (!Number.isFinite(tiempo)) {
    return { valida: false, mensaje: 'Selecciona una fecha y hora válidas.' }
  }

  if (tiempo > ahoraMs) {
    return {
      valida: false,
      mensaje: 'La fecha del incidente no puede estar en el futuro.',
    }
  }

  return { valida: true, fecha }
}
