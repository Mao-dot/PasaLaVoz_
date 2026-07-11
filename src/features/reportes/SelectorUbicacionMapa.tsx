import { useEffect } from 'react'
import {
  Circle,
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'

interface PuntoMapa {
  lat: number
  lng: number
}

interface SelectorUbicacionMapaProps {
  centro: PuntoMapa
  puntoSeleccionado: PuntoMapa | null
  onSeleccionar: (punto: PuntoMapa) => void
}

function CapturarClick({
  onSeleccionar,
}: {
  onSeleccionar: (punto: PuntoMapa) => void
}) {
  useMapEvents({
    click(evento) {
      onSeleccionar({
        lat: evento.latlng.lat,
        lng: evento.latlng.lng,
      })
    },
  })

  return null
}

function CentrarMapa({
  centro,
}: {
  centro: PuntoMapa
}) {
  const mapa = useMap()

  useEffect(() => {
    mapa.setView(
      [centro.lat, centro.lng],
      17,
    )
  }, [
    centro.lat,
    centro.lng,
    mapa,
  ])

  return null
}

export default function SelectorUbicacionMapa({
  centro,
  puntoSeleccionado,
  onSeleccionar,
}: SelectorUbicacionMapaProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-borde bg-white">
      <div className="h-[280px]">
        <MapContainer
          center={[centro.lat, centro.lng]}
          zoom={17}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CapturarClick
            onSeleccionar={onSeleccionar}
          />

          <CentrarMapa centro={centro} />

          {puntoSeleccionado && (
            <>
              <CircleMarker
                center={[
                  puntoSeleccionado.lat,
                  puntoSeleccionado.lng,
                ]}
                radius={8}
                pathOptions={{
                  color: '#ffffff',
                  weight: 3,
                  fillColor: '#2E6BFF',
                  fillOpacity: 1,
                }}
              />

              <Circle
                center={[
                  puntoSeleccionado.lat,
                  puntoSeleccionado.lng,
                ]}
                radius={80}
                pathOptions={{
                  color: '#2E6BFF',
                  weight: 1,
                  fillColor: '#2E6BFF',
                  fillOpacity: 0.1,
                }}
              />
            </>
          )}
        </MapContainer>
      </div>

      <div className="border-t border-borde px-3 py-2.5">
        {puntoSeleccionado ? (
          <p className="text-[12px] font-medium text-tinta/65">
            Punto seleccionado. Antes de guardar el reporte,
            desplazaremos la coordenada entre 30 y 80 metros
            para proteger la ubicación exacta.
          </p>
        ) : (
          <p className="text-[12px] text-tinta/55">
            Toca el mapa para señalar dónde ocurrió el incidente.
          </p>
        )}
      </div>
    </div>
  )
}