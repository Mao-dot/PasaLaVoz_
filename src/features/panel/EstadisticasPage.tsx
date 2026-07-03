import { useMemo } from 'react'
import {
  TrendingUp, MapPinned, Database,
  Shield, Clock, Eye, CircleCheckBig, Users, TriangleAlert,
} from 'lucide-react'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Tarjeta from '../../components/Tarjeta'
import { useApp } from '../../context/AppContext'
import type { TipoIncidente, EstadoReporte } from '../../data/types'
import {
  META_INCIDENTE,
  META_ESTADO,
  TIPOS_INCIDENTE,
  colorPorIntensidad,
} from '../../lib/incidentes'
import { enUltimaSemana, tiempoRelativo } from '../../lib/format'

// ─── Colores de estado ────────────────────────────────
const COLOR_ESTADO = {
  recibido: '#F59E0B',
  revisado: '#3B82F6',
  atendido: '#22C55E',
} as const

// ─── Componente principal ─────────────────────────────
export default function EstadisticasPage() {
  const { reportes } = useApp()

  const semana = useMemo(
    () => reportes.filter((r) => enUltimaSemana(r.fecha)),
    [reportes],
  )

  // Conteo por tipo de incidente (semana)
  const porTipo = useMemo(() => {
    const m = new Map<TipoIncidente, number>()
    TIPOS_INCIDENTE.forEach((t) => m.set(t, 0))
    semana.forEach((r) => m.set(r.tipo, (m.get(r.tipo) ?? 0) + 1))
    return m
  }, [semana])

  const maxTipo = Math.max(1, ...porTipo.values())
  const tipoFrecuente = [...porTipo.entries()].sort((a, b) => b[1] - a[1])[0]

  // Conteo por distrito (semana)
  const porZona = useMemo(() => {
    const m = new Map<string, number>()
    semana.forEach((r) => m.set(r.distrito, (m.get(r.distrito) ?? 0) + 1))
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [semana])
  const maxZona = Math.max(1, ...porZona.map(([, n]) => n))

  // Conteo por estado (todos los reportes)
  const porEstado = useMemo(() => {
    const m = new Map<EstadoReporte, number>()
    ;(['recibido', 'revisado', 'atendido'] as EstadoReporte[]).forEach((e) => m.set(e, 0))
    reportes.forEach((r) => m.set(r.estado, (m.get(r.estado) ?? 0) + 1))
    return m
  }, [reportes])

  const totalAtendidos = porEstado.get('atendido') ?? 0
  const tasaAtencion =
    reportes.length > 0 ? Math.round((totalAtendidos / reportes.length) * 100) : 0

  const recientes = useMemo(
    () =>
      [...reportes]
        .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha))
        .slice(0, 5),
    [reportes],
  )

  return (
    <div className="pb-8">
      <EncabezadoPagina titulo="Estadísticas" subtitulo="Datos de tu zona esta semana" />

      <div className="space-y-4 p-4">

        {/* ── KPIs principales ── */}
        <div className="grid grid-cols-3 gap-2">
          <KpiCard
            Icono={TrendingUp}
            valor={String(semana.length)}
            etiqueta="Esta semana"
            iconColor="#2563EB"
            bgColor="#EFF6FF"
          />
          <KpiCard
            Icono={TriangleAlert}
            valor={
              tipoFrecuente && tipoFrecuente[1] > 0
                ? META_INCIDENTE[tipoFrecuente[0]].label
                : '—'
            }
            etiqueta="Tipo frecuente"
            iconColor="#D97706"
            bgColor="#FFFBEB"
            small
          />
          <KpiCard
            Icono={MapPinned}
            valor={porZona[0] ? porZona[0][0].split(' ')[0] : '—'}
            etiqueta="Zona crítica"
            iconColor="#DC2626"
            bgColor="#FEF2F2"
            small
          />
        </div>

        {/* ── Estado de reportes ── */}
        <Tarjeta className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">Estado de reportes</h2>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
            >
              {tasaAtencion}% resueltos
            </span>
          </div>

          {/* Tarjetas de estado */}
          <div className="mb-3 flex gap-2">
            {(
              [
                { estado: 'recibido' as EstadoReporte, label: 'Recibidos', Icono: Clock },
                { estado: 'revisado' as EstadoReporte, label: 'En revisión', Icono: Eye },
                { estado: 'atendido' as EstadoReporte, label: 'Atendidos', Icono: CircleCheckBig },
              ] as const
            ).map(({ estado, label, Icono }) => {
              const n = porEstado.get(estado) ?? 0
              const pct =
                reportes.length > 0 ? Math.round((n / reportes.length) * 100) : 0
              const color = COLOR_ESTADO[estado]
              return (
                <div
                  key={estado}
                  className="flex flex-1 flex-col items-center rounded-xl py-2.5 text-center"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icono size={15} style={{ color }} />
                  <p
                    className="mt-1 text-lg font-extrabold leading-none"
                    style={{ color }}
                  >
                    {n}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-tight text-tinta/50">{label}</p>
                  <p className="text-[10px] font-semibold" style={{ color }}>
                    {pct}%
                  </p>
                </div>
              )
            })}
          </div>

          {/* Barra de progreso compuesta */}
          <div className="flex h-2 overflow-hidden rounded-full bg-fondo">
            {(['recibido', 'revisado', 'atendido'] as EstadoReporte[]).map((estado) => {
              const n = porEstado.get(estado) ?? 0
              const pct =
                reportes.length > 0 ? (n / reportes.length) * 100 : 0
              return (
                <div
                  key={estado}
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: COLOR_ESTADO[estado],
                  }}
                />
              )
            })}
          </div>
        </Tarjeta>

        {/* ── Incidentes por tipo ── */}
        <Tarjeta className="p-4">
          <h2 className="mb-3 text-sm font-bold">Incidentes por tipo</h2>
          <div className="space-y-2.5">
            {TIPOS_INCIDENTE.map((t) => {
              const n = porTipo.get(t) ?? 0
              const meta = META_INCIDENTE[t]
              const pct =
                semana.length > 0 ? Math.round((n / semana.length) * 100) : 0
              return (
                <div key={t} className="flex items-center gap-2">
                  <span className="flex w-24 shrink-0 items-center gap-1.5 text-[12px] text-tinta/70">
                    <meta.Icono size={13} /> {meta.label}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-fondo">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(n / maxTipo) * 100}%`,
                        backgroundColor: colorPorIntensidad(meta.peso),
                        minWidth: n > 0 ? '8px' : '0',
                      }}
                    />
                  </div>
                  <div className="flex w-14 items-center justify-end gap-1">
                    <span className="text-[12px] font-bold tabular-nums text-tinta/70">
                      {n}
                    </span>
                    {n > 0 && (
                      <span className="text-[10px] text-tinta/35">{pct}%</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Tarjeta>

        {/* ── Reportes por distrito ── */}
        {porZona.length > 0 && (
          <Tarjeta className="p-4">
            <h2 className="mb-3 text-sm font-bold">Reportes por distrito</h2>
            <div className="space-y-2">
              {porZona.map(([distrito, n], i) => (
                <div key={distrito} className="flex items-center gap-2">
                  <span className="w-4 shrink-0 text-[10px] font-bold text-tinta/30">
                    #{i + 1}
                  </span>
                  <span className="w-28 shrink-0 truncate text-[12.5px] text-tinta/70">
                    {distrito}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-fondo">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(n / maxZona) * 100}%`,
                        backgroundColor: '#2563EB',
                      }}
                    />
                  </div>
                  <span className="w-5 text-right text-[12px] font-bold tabular-nums text-tinta/70">
                    {n}
                  </span>
                </div>
              ))}
            </div>
          </Tarjeta>
        )}

        {/* ── Actividad reciente ── */}
        <Tarjeta className="p-4">
          <h2 className="mb-3 text-sm font-bold">Actividad reciente</h2>
          <ul className="divide-y divide-borde">
            {recientes.map((r) => {
              const meta = META_INCIDENTE[r.tipo]
              const est = META_ESTADO[r.estado]
              return (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                    style={{
                      backgroundColor: `${colorPorIntensidad(meta.peso)}20`,
                    }}
                  >
                    <meta.Icono
                      size={15}
                      style={{ color: colorPorIntensidad(meta.peso) }}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{meta.label}</p>
                    <p className="text-[11px] text-tinta/50">
                      {r.distrito} · {tiempoRelativo(r.fecha)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${est.clases}`}
                  >
                    {est.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </Tarjeta>

        {/* ── Datos abiertos ── */}
        <Tarjeta className="overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 bg-marca px-4 py-3">
            <Database size={15} className="shrink-0 text-white/80" />
            <p className="text-[13px] font-bold text-white">
              Datos abiertos para Lima
            </p>
          </div>
          {/* Indicadores de transparencia */}
          <div className="space-y-2.5 p-4">
            {[
              {
                Icono: Shield,
                titulo: 'Anonimato garantizado',
                texto: 'Los reportes no contienen nombres ni datos personales.',
              },
              {
                Icono: MapPinned,
                titulo: 'Coordenadas ofuscadas',
                texto: 'Solo se muestran zonas aproximadas, nunca ubicaciones exactas.',
              },
              {
                Icono: Users,
                titulo: 'Bien público',
                texto: 'Datos compatibles con datosabiertos.gob.pe para uso de municipios e investigadores.',
              },
            ].map(({ Icono, titulo, texto }) => (
              <div key={titulo} className="flex items-start gap-3">
                <div
                  className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                  style={{ backgroundColor: '#EFF6FF' }}
                >
                  <Icono size={13} style={{ color: '#2563EB' }} />
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold text-tinta/80">{titulo}</p>
                  <p className="text-[11.5px] leading-snug text-tinta/50">{texto}</p>
                </div>
              </div>
            ))}
          </div>
        </Tarjeta>

      </div>
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────
function KpiCard({
  Icono,
  valor,
  etiqueta,
  iconColor,
  bgColor,
  small = false,
}: {
  Icono: typeof TrendingUp
  valor: string
  etiqueta: string
  iconColor: string
  bgColor: string
  small?: boolean
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-borde p-3 text-center shadow-suave"
      style={{ backgroundColor: bgColor }}
    >
      <Icono size={18} style={{ color: iconColor }} />
      <span
        className={`font-extrabold leading-tight ${small ? 'text-[13px]' : 'text-xl'}`}
      >
        {valor}
      </span>
      <span className="text-[10px] leading-tight text-tinta/55">{etiqueta}</span>
    </div>
  )
}
