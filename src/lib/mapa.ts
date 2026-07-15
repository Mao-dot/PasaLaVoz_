import type { Distrito, Reporte, TipoIncidente, ZonaCaliente } from '../data/types'
import { META_INCIDENTE, colorPorIntensidad } from './incidentes'
import { puntoEnPoligono } from './geo'

export interface ZonaConReportes {
  zona: ZonaCaliente
  reportes: Reporte[]
  intensidad: number
}

export function filtrarReportesMapa(
  reportes: Reporte[],
  activos: ReadonlySet<TipoIncidente>,
  distritoNombre: string | null,
): Reporte[] {
  return reportes.filter(
    (reporte) =>
      activos.has(reporte.tipo) &&
      (distritoNombre === null || reporte.distrito === distritoNombre),
  )
}

export function construirZonasConReportes(
  zonas: ZonaCaliente[],
  reportes: Reporte[],
): ZonaConReportes[] {
  return zonas
    .map((zona) => {
      const reportesDeZona = reportes.filter((reporte) =>
        puntoEnPoligono([reporte.lat, reporte.lng], zona.poligono),
      )
      return {
        zona,
        reportes: reportesDeZona,
        intensidad: reportesDeZona.reduce(
          (maximo, reporte) => Math.max(maximo, META_INCIDENTE[reporte.tipo].peso),
          0,
        ),
      }
    })
    .filter((zona) => zona.reportes.length > 0)
}

export function construirConteoPorDistrito(
  distritos: Distrito[],
  reportes: Reporte[],
) {
  return distritos
    .map((distrito) => {
      const reportesDelDistrito = reportes.filter(
        (reporte) => reporte.distrito === distrito.nombre,
      )
      return {
        distrito,
        n: reportesDelDistrito.length,
        color: colorPorIntensidad(
          reportesDelDistrito.reduce(
            (maximo, reporte) => Math.max(maximo, META_INCIDENTE[reporte.tipo].peso),
            0,
          ),
        ),
      }
    })
    .filter((resultado) => resultado.n > 0)
}

export function construirPuntosCalor(
  reportes: Reporte[],
): [number, number, number][] {
  return reportes.map((reporte) => [
    reporte.lat,
    reporte.lng,
    META_INCIDENTE[reporte.tipo].peso,
  ])
}
