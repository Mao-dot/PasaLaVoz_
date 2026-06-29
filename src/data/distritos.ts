import type { Distrito } from './types'

// Distritos de Lima usados en el prototipo (centros aproximados).
// Para cambiar la zona inicial del mapa, edita CENTRO_LIMA y ZOOM_INICIAL.
export const distritos: Distrito[] = [
  { id: 'miraflores', nombre: 'Miraflores', lat: -12.1211, lng: -77.0297 },
  { id: 'cercado', nombre: 'Cercado de Lima', lat: -12.0464, lng: -77.0428 },
  { id: 'barranco', nombre: 'Barranco', lat: -12.1465, lng: -77.0206 },
  { id: 'la_victoria', nombre: 'La Victoria', lat: -12.0676, lng: -77.0159 },
]

export const CENTRO_LIMA: [number, number] = [-12.1, -77.035]
export const ZOOM_INICIAL = 13
