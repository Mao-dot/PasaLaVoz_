import type { PuntoSeguro } from './types'

// Puntos seguros (mock): comisarías, farmacias 24 h y paraderos seguros.
export const puntosSeguros: PuntoSeguro[] = [
  {
    id: 'p1',
    nombre: 'Comisaría de Miraflores',
    tipo: 'comisaria',
    distrito: 'Miraflores',
    lat: -12.1205,
    lng: -77.0289,
  },
  {
    id: 'p2',
    nombre: 'Farmacia 24 h — Av. Larco',
    tipo: 'farmacia24h',
    distrito: 'Miraflores',
    lat: -12.1238,
    lng: -77.0301,
  },
  {
    id: 'p3',
    nombre: 'Paradero seguro — Parque Kennedy',
    tipo: 'paradero_seguro',
    distrito: 'Miraflores',
    lat: -12.1216,
    lng: -77.0294,
  },
  {
    id: 'p4',
    nombre: 'Comisaría Cercado de Lima',
    tipo: 'comisaria',
    distrito: 'Cercado de Lima',
    lat: -12.0471,
    lng: -77.0421,
  },
  {
    id: 'p5',
    nombre: 'Farmacia 24 h — Av. Abancay',
    tipo: 'farmacia24h',
    distrito: 'Cercado de Lima',
    lat: -12.0509,
    lng: -77.0379,
  },
  {
    id: 'p6',
    nombre: 'Comisaría de Barranco',
    tipo: 'comisaria',
    distrito: 'Barranco',
    lat: -12.1459,
    lng: -77.0218,
  },
]
