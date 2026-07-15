/**
 * Bloqueo sincrónico para acciones que no deben ejecutarse dos veces antes de
 * que React alcance a renderizar el estado `disabled` del botón.
 */
export function crearBloqueoAccion() {
  let bloqueado = false

  return {
    intentar(): boolean {
      if (bloqueado) return false
      bloqueado = true
      return true
    },
    liberar(): void {
      bloqueado = false
    },
  }
}

/** Registro sincrónico de claves procesadas una sola vez durante la sesión. */
export function crearRegistroUnico() {
  const claves = new Set<string>()

  return {
    registrar(clave: string): boolean {
      if (claves.has(clave)) return false
      claves.add(clave)
      return true
    },
    contiene(clave: string): boolean {
      return claves.has(clave)
    },
  }
}
