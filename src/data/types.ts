// Tipos de datos del prototipo PasaLaVoz.
// No hay backend: todo vive en memoria durante la sesión.

export type TipoIncidente =
  | 'acoso'
  | 'robo'
  | 'persecucion'
  | 'violencia'
  | 'zona_oscura'
  | 'otro'

export type EstadoReporte = 'recibido' | 'revisado' | 'atendido'

export interface Reporte {
  id: string
  tipo: TipoIncidente
  distrito: string
  /** Coordenada ofuscada (~3 decimales). Nunca es la ubicación exacta. */
  lat: number
  lng: number
  /** Fecha ISO del incidente. */
  fecha: string
  descripcion: string
  anonimo: boolean
  estado: EstadoReporte
  /** Vecinos que confirmaron haber visto lo mismo (validación comunitaria). */
  confirmaciones: number
}

export type TipoPuntoSeguro =
  | 'comisaria'
  | 'serenazgo'
  | 'hospital'
  | 'farmacia24h'
  | 'paradero_seguro'

export interface PuntoSeguro {
  id: string
  nombre: string
  tipo: TipoPuntoSeguro
  distrito: string
  lat: number
  lng: number
}

export interface Contacto {
  id: string
  nombre: string
  telefono: string
  relacion?: string
}

export interface Distrito {
  id: string
  nombre: string
  lat: number
  lng: number
}

/**
 * Zona caliente: polígono trazado siguiendo avenidas reales (estilo Waze).
 * Los reportes que caen dentro "encienden" la zona; sus tramos son las
 * calles que se pintan de color como el tráfico de Waze.
 */
export interface ZonaCaliente {
  id: string
  nombre: string
  distrito: string
  /** Vértices [lat, lng] del polígono, en orden. */
  poligono: [number, number][]
  /** Polylines [lat, lng][] sobre las calles principales de la zona. */
  tramos: [number, number][][]
}
