import { useMemo } from 'react'
import { TrendingUp, MapPinned, Activity, Database } from 'lucide-react'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Tarjeta from '../../components/Tarjeta'
import { useApp } from '../../context/AppContext'
import type { TipoIncidente } from '../../data/types'
import {
  META_INCIDENTE,
  META_ESTADO,
  TIPOS_INCIDENTE,
  colorPorIntensidad,
} from '../../lib/incidentes'
import { enUltimaSemana, tiempoRelativo } from '../../lib/format'

export default function EstadisticasPage() {
  const { reportes } = useApp()

  const semana = useMemo(
    () => reportes.filter((r) => enUltimaSemana(r.fecha)),
    [reportes],
  )

  // Conteo por tipo
  const porTipo = useMemo(() => {
    const m = new Map<TipoIncidente, number>()
    TIPOS_INCIDENTE.forEach((t) => m.set(t, 0))
    semana.forEach((r) => m.set(r.tipo, (m.get(r.tipo) ?? 0) + 1))
    return m
  }, [semana])

  const maxTipo = Math.max(1, ...porTipo.values())
  const tipoFrecuente = [...porTipo.entries()].sort((a, b) => b[1] - a[1])[0]

  // Zona con más incidentes
  const porZona = useMemo(() => {
    const m = new Map<string, number>()
    semana.forEach((r) => m.set(r.distrito, (m.get(r.distrito) ?? 0) + 1))
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [semana])

  const recientes = useMemo(
    () => [...reportes].sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha)).slice(0, 6),
    [reportes],
  )

  return (
    <div className="pb-8">
      <EncabezadoPagina titulo="Tu zona esta semana" subtitulo="Datos de la comunidad" />

      <div className="space-y-4 p-4">
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-3 gap-2">
          <ResumenCard
            Icono={TrendingUp}
            valor={String(semana.length)}
            etiqueta="Reportes"
          />
          <ResumenCard
            Icono={Activity}
            valor={tipoFrecuente && tipoFrecuente[1] > 0 ? META_INCIDENTE[tipoFrecuente[0]].label : '—'}
            etiqueta="Tipo más frecuente"
          />
          <ResumenCard
            Icono={MapPinned}
            valor={porZona[0] ? porZona[0][0].split(' ')[0] : '—'}
            etiqueta="Zona con más"
          />
        </div>

        {/* Gráfico de barras por tipo */}
        <Tarjeta className="p-4">
          <h2 className="mb-3 text-sm font-bold">Incidentes por tipo</h2>
          <div className="space-y-2.5">
            {TIPOS_INCIDENTE.map((t) => {
              const n = porTipo.get(t) ?? 0
              const meta = META_INCIDENTE[t]
              return (
                <div key={t} className="flex items-center gap-2">
                  <span className="flex w-24 shrink-0 items-center gap-1.5 text-[12.5px] text-tinta/70">
                    <meta.Icono size={14} /> {meta.label}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-fondo">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(n / maxTipo) * 100}%`,
                        backgroundColor: colorPorIntensidad(meta.peso),
                        minWidth: n > 0 ? '8px' : '0',
                      }}
                    />
                  </div>
                  <span className="w-5 text-right text-[12.5px] font-semibold tabular-nums text-tinta/70">
                    {n}
                  </span>
                </div>
              )
            })}
          </div>
        </Tarjeta>

        {/* Reportes recientes con estado */}
        <Tarjeta className="p-4">
          <h2 className="mb-3 text-sm font-bold">Reportes recientes</h2>
          <ul className="divide-y divide-borde">
            {recientes.map((r) => {
              const meta = META_INCIDENTE[r.tipo]
              const est = META_ESTADO[r.estado]
              return (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                    style={{ backgroundColor: `${colorPorIntensidad(meta.peso)}22` }}
                  >
                    <meta.Icono size={17} style={{ color: colorPorIntensidad(meta.peso) }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{meta.label}</p>
                    <p className="text-[12px] text-tinta/55">
                      {r.distrito} · {tiempoRelativo(r.fecha)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${est.clases}`}>
                    {est.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </Tarjeta>

        <div className="flex items-center justify-center gap-2 rounded-xl bg-marca-suave px-3 py-3 text-center text-[13px] font-semibold text-marca-oscuro">
          <Database size={16} />
          Datos abiertos para una comunidad más segura.
        </div>
      </div>
    </div>
  )
}

function ResumenCard({
  Icono,
  valor,
  etiqueta,
}: {
  Icono: typeof TrendingUp
  valor: string
  etiqueta: string
}) {
  return (
    <Tarjeta className="flex flex-col items-center justify-center gap-1 p-3 text-center">
      <Icono size={20} className="text-marca" />
      <span className="text-lg font-extrabold leading-tight">{valor}</span>
      <span className="text-[11px] leading-tight text-tinta/55">{etiqueta}</span>
    </Tarjeta>
  )
}
