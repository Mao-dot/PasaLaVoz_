import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ShieldAlert, ShieldCheck, Clock, ChevronRight } from 'lucide-react'
import MapaView from './MapaView'
import Leyenda from './Leyenda'
import Chip from '../../components/Chip'
import BottomSheet from '../../components/BottomSheet'
import Boton from '../../components/Boton'
import { useApp } from '../../context/AppContext'
import { puntosSeguros } from '../../data/puntosSeguros'
import { distritos, CENTRO_LIMA } from '../../data/distritos'
import type { Reporte, TipoIncidente } from '../../data/types'
import { META_INCIDENTE, TIPOS_INCIDENTE } from '../../lib/incidentes'
import { tiempoRelativo } from '../../lib/format'

// Chips de filtro visibles (los 5 tipos principales del prompt).
const FILTROS: TipoIncidente[] = ['acoso', 'robo', 'persecucion', 'violencia', 'zona_oscura']

export default function MapaPage() {
  const navigate = useNavigate()
  const { reportes } = useApp()

  const [verRiesgo, setVerRiesgo] = useState(true)
  const [verSeguros, setVerSeguros] = useState(true)
  const [distritoId, setDistritoId] = useState('todos')
  // Empieza con todos los tipos activos (incl. "otro", que no tiene chip).
  const [activos, setActivos] = useState<Set<TipoIncidente>>(
    () => new Set(TIPOS_INCIDENTE),
  )
  const [seleccion, setSeleccion] = useState<Reporte | null>(null)

  const { centro, zoom } = useMemo(() => {
    if (distritoId === 'todos') return { centro: CENTRO_LIMA, zoom: 13 }
    const d = distritos.find((x) => x.id === distritoId)
    return d
      ? { centro: [d.lat, d.lng] as [number, number], zoom: 15 }
      : { centro: CENTRO_LIMA, zoom: 13 }
  }, [distritoId])

  const distritoNombre =
    distritoId === 'todos'
      ? null
      : distritos.find((d) => d.id === distritoId)?.nombre ?? null

  const reportesFiltrados = useMemo(
    () =>
      reportes.filter(
        (r) =>
          activos.has(r.tipo) &&
          (distritoNombre === null || r.distrito === distritoNombre),
      ),
    [reportes, activos, distritoNombre],
  )

  const toggleFiltro = (t: TipoIncidente) => {
    setActivos((prev) => {
      const next = new Set(prev)
      next.has(t) ? next.delete(t) : next.add(t)
      return next
    })
  }

  return (
    <div className="relative h-full w-full">
      {/* Mapa a pantalla completa */}
      <MapaView
        reportes={reportesFiltrados}
        puntosSeguros={verSeguros ? puntosSeguros : []}
        verRiesgo={verRiesgo}
        verSeguros={verSeguros}
        centro={centro}
        zoom={zoom}
        onSeleccionarZona={setSeleccion}
      />

      {/* Barra superior: distrito + capas + filtros */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-3">
        <div className="pointer-events-auto rounded-2xl bg-white/95 p-2.5 shadow-suave backdrop-blur">
          {/* Selector de distrito */}
          <div className="flex items-center gap-2 rounded-xl border border-borde bg-fondo px-3">
            <MapPin size={18} className="text-marca" />
            <select
              value={distritoId}
              onChange={(e) => setDistritoId(e.target.value)}
              className="w-full bg-transparent py-2.5 text-sm font-semibold text-tinta focus:outline-none"
              aria-label="Seleccionar zona o distrito"
            >
              <option value="todos">Todo Lima (zonas de ejemplo)</option>
              {distritos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle de capas */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <ToggleCapa
              activo={verRiesgo}
              onClick={() => setVerRiesgo((v) => !v)}
              Icono={ShieldAlert}
              color="text-sos"
              label="Zonas de riesgo"
            />
            <ToggleCapa
              activo={verSeguros}
              onClick={() => setVerSeguros((v) => !v)}
              Icono={ShieldCheck}
              color="text-seguro"
              label="Puntos seguros"
            />
          </div>

          {/* Chips de filtro por tipo */}
          <div className="scrollbar-none mt-2 flex gap-2 overflow-x-auto">
            {FILTROS.map((t) => {
              const { label, Icono } = META_INCIDENTE[t]
              return (
                <Chip
                  key={t}
                  activo={activos.has(t)}
                  onClick={() => toggleFiltro(t)}
                >
                  <Icono size={14} />
                  {label}
                </Chip>
              )
            })}
          </div>
        </div>
      </div>

      <Leyenda />

      {/* Bottom sheet de una zona */}
      <BottomSheet
        abierto={seleccion !== null}
        onCerrar={() => setSeleccion(null)}
        titulo={seleccion ? META_INCIDENTE[seleccion.tipo].label : undefined}
      >
        {seleccion && <DetalleZona reporte={seleccion} onReportar={() => navigate('/reportar')} />}
      </BottomSheet>
    </div>
  )
}

function ToggleCapa({
  activo,
  onClick,
  Icono,
  color,
  label,
}: {
  activo: boolean
  onClick: () => void
  Icono: typeof ShieldAlert
  color: string
  label: string
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={activo}
      className={[
        'flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[12.5px] font-semibold transition-colors min-h-[42px]',
        activo
          ? 'border-marca/30 bg-marca-suave text-marca-oscuro'
          : 'border-borde bg-white text-tinta/45',
      ].join(' ')}
    >
      <Icono size={16} className={activo ? color : 'text-tinta/40'} />
      {label}
    </button>
  )
}

function DetalleZona({
  reporte,
  onReportar,
}: {
  reporte: Reporte
  onReportar: () => void
}) {
  const meta = META_INCIDENTE[reporte.tipo]
  const colorNivel =
    meta.nivel === 'Alto'
      ? 'bg-sos-suave text-sos'
      : meta.nivel === 'Medio'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-marca-suave text-marca-oscuro'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-fondo px-3 py-1 text-[13px] font-semibold">
          <meta.Icono size={15} /> {meta.label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-fondo px-3 py-1 text-[13px] text-tinta/60">
          <Clock size={14} /> {tiempoRelativo(reporte.fecha)}
        </span>
        <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${colorNivel}`}>
          Riesgo {meta.nivel.toLowerCase()}
        </span>
      </div>

      <div className="rounded-xl bg-fondo p-3">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-tinta">
          <MapPin size={15} className="text-marca" />
          Zona aproximada: {reporte.distrito}
        </p>
        <p className="mt-1 text-[12px] text-tinta/55">
          Mostramos un área, nunca la dirección exacta, para proteger a quien reporta.
        </p>
      </div>

      {reporte.descripcion && (
        <p className="text-[14px] leading-relaxed text-tinta/80">
          “{reporte.descripcion}”
        </p>
      )}

      <Boton variante="primario" bloque onClick={onReportar}>
        Reportar aquí <ChevronRight size={18} />
      </Boton>
    </div>
  )
}
