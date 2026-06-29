// Tipos mínimos para el plugin leaflet.heat (no trae sus propios @types).
import 'leaflet'

declare module 'leaflet' {
  interface HeatLayerOptions {
    minOpacity?: number
    maxZoom?: number
    max?: number
    radius?: number
    blur?: number
    gradient?: Record<number, string>
  }

  type HeatLatLngTuple = [number, number, number?]

  interface HeatLayer extends Layer {
    setLatLngs(latlngs: HeatLatLngTuple[]): this
    addLatLng(latlng: HeatLatLngTuple): this
    setOptions(options: HeatLayerOptions): this
  }

  function heatLayer(
    latlngs: HeatLatLngTuple[],
    options?: HeatLayerOptions,
  ): HeatLayer
}

// Import de efecto secundario: leaflet.heat registra L.heatLayer al cargarse.
declare module 'leaflet.heat'
