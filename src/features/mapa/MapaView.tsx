import { useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  ZoomControl,
  useMap,
} from 'react-leaflet'
import type { PuntoSeguro, Reporte } from '../../data/types'
import { CENTRO_LIMA, ZOOM_INICIAL } from '../../data/distritos'
import { META_INCIDENTE, META_PUNTO_SEGURO, colorPorIntensidad } from '../../lib/incidentes'
import CapaCalor from './CapaCalor'

// Recentra el mapa cuando cambia el centro objetivo (selector de distrito).
function Controlador({ centro, zoom }: { centro: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(centro, zoom, { duration: 0.6 })
  }, [map, centro, zoom])
  return null
}

interface MapaViewProps {
  reportes: Reporte[]
  puntosSeguros: PuntoSeguro[]
  verRiesgo: boolean
  verSeguros: boolean
  centro: [number, number]
  zoom: number
  onSeleccionarZona: (r: Reporte) => void
}

export default function MapaView({
  reportes,
  puntosSeguros,
  verRiesgo,
  verSeguros,
  centro,
  zoom,
  onSeleccionarZona,
}: MapaViewProps) {
  return (
    <MapContainer
      center={CENTRO_LIMA}
      zoom={ZOOM_INICIAL}
      zoomControl={false}
      className="h-full w-full"
      preferCanvas
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <Controlador centro={centro} zoom={zoom} />

      {/* Zonas de riesgo: mapa de calor + áreas clicables (nunca pin exacto). */}
      {verRiesgo && (
        <>
          <CapaCalor reportes={reportes} />
          {reportes.map((r) => {
            const peso = META_INCIDENTE[r.tipo].peso
            const color = colorPorIntensidad(peso)
            return (
              <Circle
                key={r.id}
                center={[r.lat, r.lng]}
                radius={230}
                pathOptions={{
                  color,
                  weight: 1,
                  fillColor: color,
                  fillOpacity: 0.18,
                }}
                eventHandlers={{ click: () => onSeleccionarZona(r) }}
              />
            )
          })}
        </>
      )}

      {/* Puntos seguros: marcadores verdes. */}
      {verSeguros &&
        puntosSeguros.map((p) => {
          const { label } = META_PUNTO_SEGURO[p.tipo]
          return (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={9}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: '#1FA971',
                fillOpacity: 1,
              }}
            >
              <Popup>
                <div className="text-[13px]">
                  <p className="font-bold text-seguro">{label}</p>
                  <p className="text-tinta">{p.nombre}</p>
                  <p className="text-tinta/55">{p.distrito}</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
    </MapContainer>
  )
}
