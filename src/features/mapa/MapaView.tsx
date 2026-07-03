import { useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import type { PuntoSeguro, Reporte, TipoIncidente, TipoPuntoSeguro } from '../../data/types'
import { CENTRO_LIMA, ZOOM_INICIAL } from '../../data/distritos'
import { META_INCIDENTE, META_PUNTO_SEGURO, colorPorIntensidad } from '../../lib/incidentes'
import CapaCalor from './CapaCalor'

// Recentra el mapa cuando cambia el centro objetivo (búsqueda / distrito).
function Controlador({ centro, zoom }: { centro: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(centro, zoom, { duration: 0.6 })
  }, [map, centro, zoom])
  return null
}

// ─── Íconos tipo Waze (burbuja con puntita) ───────────────────────
// Se cachean por tipo para no regenerar el HTML en cada render.
const cacheReporte = new Map<TipoIncidente, L.DivIcon>()
function iconoReporte(tipo: TipoIncidente): L.DivIcon {
  const existente = cacheReporte.get(tipo)
  if (existente) return existente
  const { Icono, peso } = META_INCIDENTE[tipo]
  const color = colorPorIntensidad(peso)
  const icono = L.divIcon({
    className: 'marcador-wrap',
    html: `<div class="marcador-reporte" style="--c:${color}">${renderToStaticMarkup(
      <Icono size={16} color="#fff" strokeWidth={2.5} />,
    )}</div>`,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -40],
  })
  cacheReporte.set(tipo, icono)
  return icono
}

const cacheSeguro = new Map<TipoPuntoSeguro, L.DivIcon>()
function iconoSeguro(tipo: TipoPuntoSeguro): L.DivIcon {
  const existente = cacheSeguro.get(tipo)
  if (existente) return existente
  const { Icono } = META_PUNTO_SEGURO[tipo]
  const icono = L.divIcon({
    className: 'marcador-wrap',
    html: `<div class="marcador-seguro">${renderToStaticMarkup(
      <Icono size={14} color="#fff" strokeWidth={2.5} />,
    )}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
  cacheSeguro.set(tipo, icono)
  return icono
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
    >
      {/* Tiles CARTO Voyager: paleta clara y colorida, look tipo Waze. */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <Controlador centro={centro} zoom={zoom} />

      {/* Zonas de riesgo: calor + área difusa + burbuja clicable (nunca pin exacto). */}
      {verRiesgo && (
        <>
          <CapaCalor reportes={reportes} />
          {reportes.map((r) => {
            const peso = META_INCIDENTE[r.tipo].peso
            const color = colorPorIntensidad(peso)
            return (
              <Circle
                key={`zona-${r.id}`}
                center={[r.lat, r.lng]}
                radius={230}
                pathOptions={{
                  color,
                  weight: 1.5,
                  opacity: 0.5,
                  fillColor: color,
                  fillOpacity: 0.12,
                }}
                eventHandlers={{ click: () => onSeleccionarZona(r) }}
              />
            )
          })}
          {reportes.map((r) => (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={iconoReporte(r.tipo)}
              eventHandlers={{ click: () => onSeleccionarZona(r) }}
            />
          ))}
        </>
      )}

      {/* Puntos seguros: pines verdes con ícono según tipo. */}
      {verSeguros &&
        puntosSeguros.map((p) => {
          const { label } = META_PUNTO_SEGURO[p.tipo]
          return (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={iconoSeguro(p.tipo)}>
              <Popup>
                <div className="text-[13px]">
                  <p className="font-bold text-seguro">{label}</p>
                  <p className="text-tinta">{p.nombre}</p>
                  <p className="text-tinta/55">{p.distrito}</p>
                </div>
              </Popup>
            </Marker>
          )
        })}
    </MapContainer>
  )
}
