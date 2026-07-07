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

/** Distancia haversine en metros entre dos puntos [lat, lng]. */
export function distanciaMetros(a: [number, number], b: [number, number]): number {
  const R = 6371000
  const rad = (x: number) => (x * Math.PI) / 180
  const dLat = rad(b[0] - a[0])
  const dLng = rad(b[1] - a[1])
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

/** Ray casting: ¿el punto [lat, lng] cae dentro del polígono? */
export function puntoEnPoligono(
  p: [number, number],
  poligono: [number, number][],
): boolean {
  let dentro = false
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [latI, lngI] = poligono[i]
    const [latJ, lngJ] = poligono[j]
    const cruza =
      latI > p[0] !== latJ > p[0] &&
      p[1] < ((lngJ - lngI) * (p[0] - latI)) / (latJ - latI) + lngI
    if (cruza) dentro = !dentro
  }
  return dentro
}

/**
 * Ruta peatonal aproximada entre dos puntos: sigue la manzana (avanza por
 * tu calle y dobla) en vez de una línea recta. Es un mock, no navegación real.
 */
export function rutaAproximada(
  a: [number, number],
  b: [number, number],
): [number, number][] {
  const esquina1: [number, number] = [a[0] + (b[0] - a[0]) * 0.55, a[1]]
  const esquina2: [number, number] = [esquina1[0], b[1]]
  return [a, esquina1, esquina2, b]
}

/** Longitud total en metros de una ruta (suma de sus segmentos). */
export function longitudRuta(puntos: [number, number][]): number {
  let total = 0
  for (let i = 1; i < puntos.length; i++) {
    total += distanciaMetros(puntos[i - 1], puntos[i])
  }
  return total
}

/** Minutos caminando (≈ 78 m/min, paso urbano). */
export function minutosCaminando(metros: number): number {
  return Math.max(1, Math.round(metros / 78))
}
