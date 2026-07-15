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
import { META_INCIDENTE, META_PUNTO_SEGURO } from '../../lib/incidentes'
import CapaCalor from './CapaCalor'

/** Zoom a partir del cual aparecen los pines individuales (estilo Waze). */
const ZOOM_PINES = 14

// ─── Mapa Único de Colores por Incidente ───
// Esto garantiza que el ícono y su área correspondiente tengan el mismo color
const COLORES_INCIDENTE: Record<TipoIncidente, string> = {
  acoso: '#F97316',       // Naranja
  robo: '#DC2626',        // Rojo
  persecucion: '#4F46E5', // Azul/Índigo
  violencia: '#C026D3',   // Magenta
  zona_oscura: '#374151', // Gris oscuro
  otro: '#6B7280'         // Gris neutro (Soluciona el error TS)
}

export interface ZonaConReportes {
  zona: ZonaCaliente
  reportes: Reporte[]
  intensidad: number
}

export interface RutaSegura {
  destino: PuntoSeguro
  puntos: [number, number][]
  metros: number
  minutos: number
}

// Recentra el mapa cuando cambia el centro objetivo y reporta el zoom
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
    const actual = map.getCenter()
    if (Math.abs(actual.lat - centro[0]) < 1e-6 && Math.abs(actual.lng - centro[1]) < 1e-6 && map.getZoom() === zoom) return
    map.flyTo(centro, zoom, { duration: 0.45 })
  }, [map, centro, zoom])
  return null
}

// ─── Generadores de Íconos ───
const cacheReporte = new Map<TipoIncidente, L.DivIcon>()
function iconoReporte(tipo: TipoIncidente): L.DivIcon {
  const existente = cacheReporte.get(tipo)
  if (existente) return existente

  const { Icono } = META_INCIDENTE[tipo]
  const colorIcono = COLORES_INCIDENTE[tipo] || '#D97706'

  const icono = L.divIcon({
    className: 'marcador-wrap',
    html: `<div class="marcador-reporte" style="--c:${colorIcono}">${renderToStaticMarkup(
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
  const [estiloClaro, setEstiloClaro] = useState<boolean>(true)
  const conPines = zoomActual >= ZOOM_PINES

  const tileUrl = estiloClaro
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"

  return (
    <div className="relative w-full h-full">
      <button
        onClick={() => setEstiloClaro(!estiloClaro)}
        className={`absolute top-4 right-4 z-[1000] px-3.5 py-2 rounded-xl text-xs font-bold shadow-md border transition-all duration-200 flex items-center gap-1.5 active:scale-95
          ${estiloClaro 
            ? 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-slate-200/40' 
            : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 shadow-black/30'}`}
      >
        <span>{estiloClaro ? '☀️ Estilo: Claro' : '🌙 Estilo: Oscuro'}</span>
      </button>

      <MapContainer
        center={CENTRO_LIMA}
        zoom={ZOOM_INICIAL}
        zoomSnap={0.25}
        wheelDebounceTime={25}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url={tileUrl}
          subdomains="abcd"
          maxZoom={19}
        />
        <Controlador centro={centro} zoom={zoom} onZoom={setZoomActual} />

        {verRiesgo && (
          <>
            {/* Capa de calor SIEMPRE activa (sin condicional de zoom) */}
            {!conPines && <CapaCalor reportes={reportes} />}

            {/* Zonas Calientes y Tramos (Corredores) */}
            {zonas.map((z) => {
              const tipoPrincipal = z.reportes[0]?.tipo || 'otro'
              const colorBase = COLORES_INCIDENTE[tipoPrincipal]
              
              // Forzamos a que las calles de robo y violencia sean de color rojo.
              // Si prefieres que ABSOLUTAMENTE TODAS las calles peligrosas sean rojas,
              // puedes cambiar esta línea por: const colorCalle = '#DC2626'
              const colorCalle = (tipoPrincipal === 'robo' || tipoPrincipal === 'violencia') 
                ? '#DC2626' 
                : colorBase; 

              return (
                <Fragment key={z.zona.id}>
                  {/* Polígono de la zona principal */}
                  <Polygon
                    positions={z.zona.poligono}
                    pathOptions={{
                      stroke: false,
                      fillColor: colorBase,
                      fillOpacity: estiloClaro ? 0.15 : 0.25,
                      smoothFactor: 10,
                    } as any}
                    eventHandlers={{ click: () => onSeleccionarZona(z) }}
                  />

                  {/* Tramos convertidos en áreas de peligro rojas */}
                  {z.zona.tramos.map((tramo, i) => (
                    <Polyline
                      key={`${z.zona.id}-t${i}`}
                      positions={tramo}
                      pathOptions={{
                        color: colorCalle,
                        weight: 35, // Grosor inmenso para efecto mancha/zona
                        opacity: estiloClaro ? 0.3 : 0.4, 
                        lineCap: 'round',
                        lineJoin: 'round',
                      }}
                      eventHandlers={{ click: () => onSeleccionarZona(z) }}
                    />
                  ))}
                </Fragment>
              )
            })}

            {/* Pines y Burbujas */}
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

        {/* Puntos Seguros */}
        {verSeguros &&
          puntosSeguros.map((p) => {
            const { label } = META_PUNTO_SEGURO[p.tipo]
            const popup = (
              <Popup>
                <div className="text-[13px]">
                  <p className="font-bold text-emerald-600">{label}</p>
                  <p className="text-slate-800">{p.nombre}</p>
                  <p className="text-slate-500">{p.distrito}</p>
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
                radius={5.5}
                pathOptions={{
                  color: '#ffffff',
                  weight: 2,
                  fillColor: '#10B981',
                  fillOpacity: 1,
                }}
              >
                {popup}
              </CircleMarker>
            )
          })}

        {/* Ruta segura */}
        {ruta && (
          <>
            <Polyline
              positions={ruta.puntos}
              pathOptions={{
                color: estiloClaro ? '#ffffff' : '#1e293b',
                weight: 10,
                opacity: 0.9,
                lineCap: 'round',
                interactive: false,
              }}
            />
            <Polyline
              positions={ruta.puntos}
              pathOptions={{
                color: '#10B981',
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
                color: '#10B981',
                weight: 2,
                opacity: 0.8,
                fillColor: '#10B981',
                fillOpacity: 0.15,
                interactive: false,
              }}
            />
          </>
        )}

        {/* Tu ubicación */}
        <Circle
          center={MI_UBICACION}
          radius={90}
          pathOptions={{
            color: '#3B82F6',
            weight: 1,
            opacity: 0.35,
            fillColor: '#3B82F6',
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
    </div>
  )
}
