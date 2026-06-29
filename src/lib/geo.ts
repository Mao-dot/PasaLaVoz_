// Helpers de privacidad geográfica.
// Regla central de PasaLaVoz: NUNCA mostramos el punto exacto de quien reporta.

/**
 * Redondea una coordenada a ~3 decimales (≈ 100 m), suficiente para mostrar
 * una zona aproximada sin revelar la ubicación exacta.
 */
export function ofuscarCoordenada(valor: number): number {
  return Math.round(valor * 1000) / 1000
}

/** Aplica la ofuscación a un par lat/lng. */
export function ofuscarPunto(lat: number, lng: number): { lat: number; lng: number } {
  return { lat: ofuscarCoordenada(lat), lng: ofuscarCoordenada(lng) }
}

/** Genera un pequeño desplazamiento aleatorio dentro de la zona (para variar el mock). */
export function jitter(valor: number, rango = 0.004): number {
  return valor + (Math.random() - 0.5) * rango
}
