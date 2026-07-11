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
export function ofuscarPunto(
  lat: number,
  lng: number,
): {
  lat: number
  lng: number
} {
  return {
    lat: ofuscarCoordenada(lat),
    lng: ofuscarCoordenada(lng),
  }
}

/** Genera un pequeño desplazamiento aleatorio dentro de la zona (para variar el mock). */
export function jitter(valor: number, rango = 0.004): number {
  return valor + (Math.random() - 0.5) * rango
}

/** Distancia Haversine en metros entre dos puntos [lat, lng]. */
export function distanciaMetros(
  a: [number, number],
  b: [number, number],
): number {
  const R = 6_371_000
  const rad = (x: number) => (x * Math.PI) / 180

  const dLat = rad(b[0] - a[0])
  const dLng = rad(b[1] - a[1])

  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) *
      Math.cos(rad(b[0])) *
      Math.sin(dLng / 2) ** 2

  return 2 * R * Math.asin(Math.sqrt(s))
}

/** Ray casting: ¿el punto [lat, lng] cae dentro del polígono? */
export function puntoEnPoligono(
  p: [number, number],
  poligono: [number, number][],
): boolean {
  let dentro = false

  for (
    let i = 0, j = poligono.length - 1;
    i < poligono.length;
    j = i++
  ) {
    const [latI, lngI] = poligono[i]
    const [latJ, lngJ] = poligono[j]

    const cruza =
      latI > p[0] !== latJ > p[0] &&
      p[1] <
        ((lngJ - lngI) * (p[0] - latI)) /
          (latJ - latI) +
          lngI

    if (cruza) {
      dentro = !dentro
    }
  }

  return dentro
}

/**
 * Ruta peatonal aproximada entre dos puntos: sigue la manzana
 * en vez de una línea recta. Es un mock, no navegación real.
 */
export function rutaAproximada(
  a: [number, number],
  b: [number, number],
): [number, number][] {
  const esquina1: [number, number] = [
    a[0] + (b[0] - a[0]) * 0.55,
    a[1],
  ]

  const esquina2: [number, number] = [
    esquina1[0],
    b[1],
  ]

  return [a, esquina1, esquina2, b]
}

/** Longitud total en metros de una ruta. */
export function longitudRuta(
  puntos: [number, number][],
): number {
  let total = 0

  for (let i = 1; i < puntos.length; i++) {
    total += distanciaMetros(
      puntos[i - 1],
      puntos[i],
    )
  }

  return total
}

/** Minutos caminando (≈ 78 m/min, paso urbano). */
export function minutosCaminando(
  metros: number,
): number {
  return Math.max(1, Math.round(metros / 78))
}

export interface Coordenada {
  lat: number
  lng: number
}

const RADIO_TIERRA_METROS = 6_371_000

function gradosARadianes(grados: number): number {
  return (grados * Math.PI) / 180
}

function radianesAGrados(radianes: number): number {
  return (radianes * 180) / Math.PI
}

/**
 * Desplaza una coordenada real una distancia aleatoria dentro de un anillo.
 *
 * Por defecto, el punto resultante estará entre 30 y 80 metros
 * de la ubicación original.
 *
 * La coordenada exacta no se almacena en el reporte.
 */
export function ofuscarUbicacion(
  lat: number,
  lng: number,
  radioMinimoMetros = 30,
  radioMaximoMetros = 80,
): Coordenada {
  if (radioMinimoMetros < 0) {
    throw new Error(
      'El radio mínimo no puede ser negativo.',
    )
  }

  if (radioMaximoMetros < radioMinimoMetros) {
    throw new Error(
      'El radio máximo debe ser mayor o igual al radio mínimo.',
    )
  }

  // Distribución uniforme sobre el área del anillo.
  const distancia = Math.sqrt(
    radioMinimoMetros ** 2 +
      Math.random() *
        (
          radioMaximoMetros ** 2 -
          radioMinimoMetros ** 2
        ),
  )

  const rumbo = Math.random() * 2 * Math.PI
  const distanciaAngular =
    distancia / RADIO_TIERRA_METROS

  const latInicial = gradosARadianes(lat)
  const lngInicial = gradosARadianes(lng)

  const latFinal = Math.asin(
    Math.sin(latInicial) *
      Math.cos(distanciaAngular) +
      Math.cos(latInicial) *
        Math.sin(distanciaAngular) *
        Math.cos(rumbo),
  )

  const lngFinal =
    lngInicial +
    Math.atan2(
      Math.sin(rumbo) *
        Math.sin(distanciaAngular) *
        Math.cos(latInicial),
      Math.cos(distanciaAngular) -
        Math.sin(latInicial) *
          Math.sin(latFinal),
    )

  const lngNormalizada =
    ((radianesAGrados(lngFinal) + 540) % 360) -
    180

  return {
    lat: Number(
      radianesAGrados(latFinal).toFixed(5),
    ),
    lng: Number(
      lngNormalizada.toFixed(5),
    ),
  }
}