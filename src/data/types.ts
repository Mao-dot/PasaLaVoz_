// Tipos de datos del prototipo PasaLaVoz.
// No hay backend: todo vive en memoria durante la sesión.

export type TipoIncidente =
  | 'acoso'
  | 'robo'
  | 'persecucion'
  | 'violencia'
  | 'zona_oscura'
  | 'otro'

export type SubtipoIncidente =
  // Acoso
  | 'acoso_verbal'
  | 'seguimiento_no_deseado'
  | 'tocamientos'
  | 'amenaza_hostigamiento'

  // Robo
  | 'arrebato_celular'
  | 'robo_pertenencias'
  | 'robo_transporte'
  | 'intento_robo'

  // Persecución
  | 'persecucion_pie'
  | 'persecucion_vehiculo'
  | 'vigilancia_sospechosa'
  | 'otra_persecucion'

  // Violencia
  | 'agresion_fisica'
  | 'pelea_via_publica'
  | 'amenaza'
  | 'otra_violencia'

  // Zona oscura
  | 'luminaria_apagada'
  | 'calle_sin_iluminacion'
  | 'ruta_peatonal_oscura'
  | 'otra_zona_oscura'

  // Otros
  | 'actividad_sospechosa'
  | 'vandalismo'
  | 'peligro_via_publica'
  | 'otro_incidente'

export type EstadoReporte = 'recibido' | 'revisado' | 'atendido'

export interface Reporte {
  id: string
  tipo: TipoIncidente

  /**
   * Detalle más específico del incidente.
   * Es opcional para mantener compatibilidad con reportes antiguos y datos semilla.
   */
  subtipo?: SubtipoIncidente

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
