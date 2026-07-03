import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import type { Reporte } from '../../data/types'
import { META_INCIDENTE } from '../../lib/incidentes'

// Capa de mapa de calor (leaflet.heat) para las zonas de riesgo.
// Cada reporte aporta intensidad según el peso de su tipo de incidente.
export default function CapaCalor({ reportes }: { reportes: Reporte[] }) {
  const map = useMap()

  useEffect(() => {
    const puntos: [number, number, number][] = reportes.map((r) => [
      r.lat,
      r.lng,
      META_INCIDENTE[r.tipo].peso,
    ])

    // Degradado amarillo → ámbar → rojo, estilo mapa de tráfico de Waze.
    const capa = L.heatLayer(puntos, {
      radius: 42,
      blur: 30,
      maxZoom: 17,
      minOpacity: 0.3,
      gradient: {
        0.15: '#FDE047',
        0.35: '#F59E0B',
        0.6: '#F2772F',
        0.85: '#E23B3B',
        1.0: '#B91C1C',
      },
    })
    capa.addTo(map)

    return () => {
      map.removeLayer(capa)
    }
  }, [map, reportes])

  return null
}
