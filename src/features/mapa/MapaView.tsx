import { Fragment, useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Marker,
  Polygon,
  Polyline,
  Popup,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import type {
  Distrito,
  PuntoSeguro,
  Reporte,
  TipoIncidente,
  TipoPuntoSeguro,
  ZonaCaliente,
} from '../../data/types'
import { CENTRO_LIMA, MI_UBICACION, ZOOM_INICIAL } from '../../data/distritos'
import { META_INCIDENTE, META_PUNTO_SEGURO, colorPorIntensidad } from '../../lib/incidentes'
import CapaCalor from './CapaCalor'

/** Zoom a partir del cual aparecen los pines individuales (estilo Waze:
 * de lejos solo manchas y burbujas; de cerca, el detalle). */
const ZOOM_PINES = 14

/** Zona caliente con sus reportes ya asignados (lo calcula MapaPage). */
export interface ZonaConReportes {
  zona: ZonaCaliente
  reportes: Reporte[]
  /** Peso máximo de sus reportes (0–1): define el color de la zona. */
  intensidad: number
}

/** Ruta peatonal simulada hacia un punto seguro. */
export interface RutaSegura {
  destino: PuntoSeguro
  puntos: [number, number][]
  metros: number
  minutos: number
}

// Recentra el mapa cuando cambia el centro objetivo y reporta el zoom
// actual al padre (para decidir qué capas se muestran).
function Controlador({
  centro,
  zoom,
  onZoom,
}: {
  centro: [number, number]
  zoom: number
  onZoom: (z: number) => void
}) {
  const map = useMapEvents({
    zoomend: () => onZoom(map.getZoom()),
  })
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

// Burbuja de conteo por distrito (vista lejana). Cache por n + color.
const cacheBurbuja = new Map<string, L.DivIcon>()
function iconoBurbuja(n: number, color: string): L.DivIcon {
  const clave = `${n}|${color}`
  const existente = cacheBurbuja.get(clave)
  if (existente) return existente
  const icono = L.divIcon({
    className: 'marcador-wrap',
    html: `<div class="burbuja-distrito" style="--c:${color}"><b>${n}</b>&nbsp;${
      n === 1 ? 'reporte' : 'reportes'
    }</div>`,
    iconSize: [104, 32],
    iconAnchor: [52, 16],
  })
  cacheBurbuja.set(clave, icono)
  return icono
}

// Punto azul pulsante "estás aquí" (ubicación simulada).
const iconoUsuario = L.divIcon({
  className: 'marcador-wrap',
  html: '<div class="punto-usuario"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

interface MapaViewProps {
  reportes: Reporte[]
  zonas: ZonaConReportes[]
  conteoPorDistrito: { distrito: Distrito; n: number; color: string }[]
  puntosSeguros: PuntoSeguro[]
  verRiesgo: boolean
  verSeguros: boolean
  centro: [number, number]
  zoom: number
  ruta: RutaSegura | null
  onSeleccionarReporte: (r: Reporte) => void
  onSeleccionarZona: (z: ZonaConReportes) => void
  onAcercarDistrito: (d: Distrito) => void
}

export default function MapaView({
  reportes,
  zonas,
  conteoPorDistrito,
  puntosSeguros,
  verRiesgo,
  verSeguros,
  centro,
  zoom,
  ruta,
  onSeleccionarReporte,
  onSeleccionarZona,
  onAcercarDistrito,
}: MapaViewProps) {
  const [zoomActual, setZoomActual] = useState(ZOOM_INICIAL)
  const conPines = zoomActual >= ZOOM_PINES

  return (
    <MapContainer
      center={CENTRO_LIMA}
      zoom={ZOOM_INICIAL}
      zoomSnap={0.5}
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
      <Controlador centro={centro} zoom={zoom} onZoom={setZoomActual} />

      {verRiesgo && (
        <>
          {/* De lejos, el calor da la lectura general; de cerca estorba. */}
          {zoomActual < ZOOM_PINES && <CapaCalor reportes={reportes} />}

          {/* Zonas calientes: polígonos trazados por calles (nunca círculos). */}
          {zonas.map((z) => {
            const color = colorPorIntensidad(z.intensidad)
            return (
              <Polygon
                key={z.zona.id}
                positions={z.zona.poligono}
                pathOptions={{
                  color,
                  weight: 2,
                  opacity: 0.7,
                  fillColor: color,
                  fillOpacity: 0.16,
                  lineJoin: 'round',
                }}
                eventHandlers={{ click: () => onSeleccionarZona(z) }}
              />
            )
          })}

          {/* Tramos de calle pintados, como el tráfico de Waze:
              línea blanca de base + color de la zona encima. */}
          {zonas.flatMap((z) => {
            const color = colorPorIntensidad(z.intensidad)
            return z.zona.tramos.map((tramo, i) => (
              <Fragment key={`${z.zona.id}-t${i}`}>
                <Polyline
                  positions={tramo}
                  pathOptions={{
                    color: '#fff',
                    weight: 9,
                    opacity: 0.85,
                    lineCap: 'round',
                    interactive: false,
                  }}
                />
                <Polyline
                  positions={tramo}
                  pathOptions={{ color, weight: 5, opacity: 0.95, lineCap: 'round' }}
                  eventHandlers={{ click: () => onSeleccionarZona(z) }}
                />
              </Fragment>
            ))
          })}

          {/* De cerca: pines individuales. De lejos: una burbuja por distrito. */}
          {conPines &&
            reportes.map((r) => (
              <Marker
                key={r.id}
                position={[r.lat, r.lng]}
                icon={iconoReporte(r.tipo)}
                eventHandlers={{ click: () => onSeleccionarReporte(r) }}
              />
            ))}
          {!conPines &&
            conteoPorDistrito.map(({ distrito, n, color }) => (
              <Marker
                key={`burbuja-${distrito.id}`}
                position={[distrito.lat, distrito.lng]}
                icon={iconoBurbuja(n, color)}
                eventHandlers={{ click: () => onAcercarDistrito(distrito) }}
              />
            ))}
        </>
      )}

      {/* Puntos seguros: puntitos de lejos, pines con ícono de cerca. */}
      {verSeguros &&
        puntosSeguros.map((p) => {
          const { label } = META_PUNTO_SEGURO[p.tipo]
          const popup = (
            <Popup>
              <div className="text-[13px]">
                <p className="font-bold text-seguro">{label}</p>
                <p className="text-tinta">{p.nombre}</p>
                <p className="text-tinta/55">{p.distrito}</p>
              </div>
            </Popup>
          )
          return conPines ? (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={iconoSeguro(p.tipo)}>
              {popup}
            </Marker>
          ) : (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={5}
              pathOptions={{
                color: '#fff',
                weight: 2,
                fillColor: '#1FA971',
                fillOpacity: 1,
              }}
            >
              {popup}
            </CircleMarker>
          )
        })}

      {/* Ruta segura simulada: línea punteada verde hasta el destino. */}
      {ruta && (
        <>
          <Polyline
            positions={ruta.puntos}
            pathOptions={{
              color: '#fff',
              weight: 10,
              opacity: 0.9,
              lineCap: 'round',
              interactive: false,
            }}
          />
          <Polyline
            positions={ruta.puntos}
            pathOptions={{
              color: '#1FA971',
              weight: 5,
              opacity: 0.95,
              dashArray: '1 10',
              lineCap: 'round',
              interactive: false,
            }}
          />
          <Circle
            center={[ruta.destino.lat, ruta.destino.lng]}
            radius={28}
            pathOptions={{
              color: '#1FA971',
              weight: 2,
              opacity: 0.8,
              fillColor: '#1FA971',
              fillOpacity: 0.15,
              interactive: false,
            }}
          />
        </>
      )}

      {/* Tu ubicación simulada (punto azul + halo de precisión). */}
      <Circle
        center={MI_UBICACION}
        radius={90}
        pathOptions={{
          color: '#2E6BFF',
          weight: 1,
          opacity: 0.35,
          fillColor: '#2E6BFF',
          fillOpacity: 0.08,
          interactive: false,
        }}
      />
      <Marker
        position={MI_UBICACION}
        icon={iconoUsuario}
        zIndexOffset={500}
        interactive={false}
      />
    </MapContainer>
  )
}
