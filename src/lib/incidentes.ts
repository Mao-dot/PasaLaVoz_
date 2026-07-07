import {
  UserX,
  Wallet,
  Footprints,
  AlertOctagon,
  LightbulbOff,
  MoreHorizontal,
  Building2,
  Shield,
  Cross,
  Pill,
  Bus,
  type LucideIcon,
} from 'lucide-react'
import type {
  EstadoReporte,
  TipoIncidente,
  TipoPuntoSeguro,
} from '../data/types'

export interface MetaIncidente {
  label: string
  Icono: LucideIcon
  /** Peso 0–1 para el mapa de calor y el nivel de riesgo. */
  peso: number
  nivel: 'Bajo' | 'Medio' | 'Alto'
}

// Metadatos por tipo de incidente: etiqueta, ícono y peso de riesgo.
export const META_INCIDENTE: Record<TipoIncidente, MetaIncidente> = {
  acoso: { label: 'Acoso', Icono: UserX, peso: 0.6, nivel: 'Medio' },
  robo: { label: 'Robo', Icono: Wallet, peso: 0.75, nivel: 'Alto' },
  persecucion: { label: 'Persecución', Icono: Footprints, peso: 0.8, nivel: 'Alto' },
  violencia: { label: 'Violencia', Icono: AlertOctagon, peso: 0.95, nivel: 'Alto' },
  zona_oscura: { label: 'Zona oscura', Icono: LightbulbOff, peso: 0.45, nivel: 'Bajo' },
  otro: { label: 'Otro', Icono: MoreHorizontal, peso: 0.5, nivel: 'Medio' },
}

/** Orden estable para mostrar chips de filtro y botones. */
export const TIPOS_INCIDENTE: TipoIncidente[] = [
  'acoso',
  'robo',
  'persecucion',
  'violencia',
  'zona_oscura',
  'otro',
]

// Metadatos de puntos seguros.
export const META_PUNTO_SEGURO: Record<
  TipoPuntoSeguro,
  { label: string; Icono: LucideIcon }
> = {
  comisaria: { label: 'Comisaría', Icono: Building2 },
  serenazgo: { label: 'Serenazgo', Icono: Shield },
  hospital: { label: 'Hospital / clínica', Icono: Cross },
  farmacia24h: { label: 'Farmacia 24 h', Icono: Pill },
  paradero_seguro: { label: 'Paradero seguro', Icono: Bus },
}

// Estados de un reporte (para los chips de la pantalla de Estadísticas).
export const META_ESTADO: Record<
  EstadoReporte,
  { label: string; clases: string }
> = {
  recibido: { label: 'Recibido', clases: 'bg-marca-suave text-marca-oscuro' },
  revisado: { label: 'Revisado', clases: 'bg-amber-100 text-amber-700' },
  atendido: { label: 'Atendido', clases: 'bg-seguro-suave text-seguro' },
}

/**
 * Color en la escala ámbar → rojo según intensidad (0–1).
 * Se usa para círculos de zona de riesgo y para el degradado del mapa de calor.
 */
export function colorPorIntensidad(peso: number): string {
  const t = Math.min(1, Math.max(0, peso))
  const a = { r: 0xf5, g: 0x9e, b: 0x0b } // #F59E0B ámbar
  const b = { r: 0xe2, g: 0x3b, b: 0x3b } // #E23B3B rojo
  const c = (x: number, y: number) => Math.round(x + (y - x) * t)
  const hex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${hex(c(a.r, b.r))}${hex(c(a.g, b.g))}${hex(c(a.b, b.b))}`
}
