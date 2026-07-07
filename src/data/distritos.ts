import type { Distrito } from './types'

// Distritos de Lima usados en el prototipo (centros aproximados).
// Para cambiar la zona inicial del mapa, edita CENTRO_LIMA y ZOOM_INICIAL.
export const distritos: Distrito[] = [
  { id: 'miraflores', nombre: 'Miraflores', lat: -12.1211, lng: -77.0297 },
  { id: 'cercado', nombre: 'Cercado de Lima', lat: -12.0464, lng: -77.0428 },
  { id: 'barranco', nombre: 'Barranco', lat: -12.1465, lng: -77.0206 },
  { id: 'la_victoria', nombre: 'La Victoria', lat: -12.0676, lng: -77.0159 },
]

// Centro y zoom de arranque calibrados para que los 3 focos (Cercado,
// Miraflores, Barranco) y sus burbujas entren completos en la pantalla.
export const CENTRO_LIMA: [number, number] = [-12.097, -77.034]
export const ZOOM_INICIAL = 12.5

// Ubicación simulada del usuario (zona de Schell, al sureste de Kennedy).
// El prototipo no usa GPS real: este punto alimenta el "estás aquí",
// el recentrado del mapa y la ruta segura.
export const MI_UBICACION: [number, number] = [-12.1258, -77.0272]
