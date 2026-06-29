// Helpers de formato de fecha/hora en español (Perú).

/** Devuelve un texto relativo tipo "hace 2 h" / "hace 3 d". */
export function tiempoRelativo(fechaISO: string): string {
  const ms = Date.now() - new Date(fechaISO).getTime()
  const min = Math.round(ms / 60000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const horas = Math.round(min / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.round(horas / 24)
  if (dias < 7) return `hace ${dias} d`
  const semanas = Math.round(dias / 7)
  return `hace ${semanas} sem`
}

/** Fecha y hora legibles, p. ej. "26 jun, 8:45 p. m." */
export function fechaHora(fechaISO: string): string {
  return new Date(fechaISO).toLocaleString('es-PE', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** ¿La fecha está dentro de los últimos 7 días? */
export function enUltimaSemana(fechaISO: string): boolean {
  const ms = Date.now() - new Date(fechaISO).getTime()
  return ms <= 7 * 24 * 3600_000
}
