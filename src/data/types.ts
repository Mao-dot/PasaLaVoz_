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
}

export type TipoPuntoSeguro = 'comisaria' | 'farmacia24h' | 'paradero_seguro'

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
