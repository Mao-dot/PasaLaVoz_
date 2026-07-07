import { useMemo, useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  ArrowLeft,
  X,
  Map as MapIcon,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Clock,
  ChevronRight,
  Layers,
  LocateFixed,
  Flame,
  Navigation,
  Eye,
  Check,
  Users,
} from 'lucide-react'
import MapaView, { type RutaSegura, type ZonaConReportes } from './MapaView'
import Leyenda from './Leyenda'
import Chip from '../../components/Chip'
import BottomSheet from '../../components/BottomSheet'
import Boton from '../../components/Boton'
import { useApp } from '../../context/AppContext'
import { puntosSeguros } from '../../data/puntosSeguros'
import { zonasCalientes } from '../../data/zonas'
import { distritos, CENTRO_LIMA, MI_UBICACION, ZOOM_INICIAL } from '../../data/distritos'
import type { Distrito, PuntoSeguro, Reporte, TipoIncidente } from '../../data/types'
import {
  META_INCIDENTE,
  META_PUNTO_SEGURO,
  TIPOS_INCIDENTE,
  colorPorIntensidad,
} from '../../lib/incidentes'
import {
  distanciaMetros,
  longitudRuta,
  minutosCaminando,
  puntoEnPoligono,
  rutaAproximada,
} from '../../lib/geo'
import { tiempoRelativo } from '../../lib/format'

// Chips de filtro visibles (los 5 tipos principales del prompt).
const FILTROS: TipoIncidente[] = ['acoso', 'robo', 'persecucion', 'violencia', 'zona_oscura']

// Normaliza texto para buscar sin acentos ni mayúsculas.
const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

interface Vista {
  centro: [number, number]
  zoom: number
}

export default function MapaPage() {
  const navigate = useNavigate()
  const { reportes } = useApp()

  const [verRiesgo, setVerRiesgo] = useState(true)
  const [verSeguros, setVerSeguros] = useState(true)
  const [distritoId, setDistritoId] = useState('todos')
  const [vista, setVista] = useState<Vista>({ centro: CENTRO_LIMA, zoom: ZOOM_INICIAL })
  // Empieza con todos los tipos activos (incl. "otro", que no tiene chip).
  const [activos, setActivos] = useState<Set<TipoIncidente>>(
    () => new Set(TIPOS_INCIDENTE),
  )
  const [seleccionReporte, setSeleccionReporte] = useState<Reporte | null>(null)
  const [seleccionZona, setSeleccionZona] = useState<ZonaConReportes | null>(null)
  const [ruta, setRuta] = useState<RutaSegura | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [consulta, setConsulta] = useState('')
  const [capasAbierto, setCapasAbierto] = useState(false)

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

  // Asigna cada reporte filtrado a la zona caliente que lo contiene.
  // Solo se pintan zonas "encendidas" (con al menos un reporte visible).
  const zonasConReportes = useMemo<ZonaConReportes[]>(
    () =>
      zonasCalientes
        .map((zona) => {
          const rs = reportesFiltrados.filter((r) =>
            puntoEnPoligono([r.lat, r.lng], zona.poligono),
          )
          return {
            zona,
            reportes: rs,
            intensidad: rs.reduce((m, r) => Math.max(m, META_INCIDENTE[r.tipo].peso), 0),
          }
        })
        .filter((z) => z.reportes.length > 0),
    [reportesFiltrados],
  )

  // Conteo por distrito para las burbujas de la vista lejana.
  const conteoPorDistrito = useMemo(
    () =>
      distritos
        .map((d) => {
          const rs = reportesFiltrados.filter((r) => r.distrito === d.nombre)
          return {
            distrito: d,
            n: rs.length,
            color: colorPorIntensidad(
              rs.reduce((m, r) => Math.max(m, META_INCIDENTE[r.tipo].peso), 0),
            ),
          }
        })
        .filter((x) => x.n > 0),
    [reportesFiltrados],
  )

  const toggleFiltro = (t: TipoIncidente) => {
    setActivos((prev) => {
      const next = new Set(prev)
      next.has(t) ? next.delete(t) : next.add(t)
      return next
    })
  }

  // ── Búsqueda ──
  const q = normalizar(consulta.trim())
  const distritosFiltrados = q
    ? distritos.filter((d) => normalizar(d.nombre).includes(q))
    : distritos
  const puntosFiltrados = q
    ? puntosSeguros.filter((p) => normalizar(`${p.nombre} ${p.distrito}`).includes(q))
    : puntosSeguros
  const sinResultados = distritosFiltrados.length === 0 && puntosFiltrados.length === 0

  const cerrarBusqueda = () => {
    setBuscando(false)
    setConsulta('')
  }

  const elegirTodos = () => {
    setDistritoId('todos')
    setVista({ centro: CENTRO_LIMA, zoom: ZOOM_INICIAL })
    cerrarBusqueda()
  }

  const elegirDistrito = (d: Distrito) => {
    setDistritoId(d.id)
    setVista({ centro: [d.lat, d.lng], zoom: 15 })
    cerrarBusqueda()
  }

  const elegirPunto = (p: PuntoSeguro) => {
    setVerSeguros(true)
    const d = distritos.find((x) => x.nombre === p.distrito)
    setDistritoId(d ? d.id : 'todos')
    setVista({ centro: [p.lat, p.lng], zoom: 16 })
    cerrarBusqueda()
  }

  // El botón de localizar te lleva a TU ubicación (simulada), como en Waze.
  const irAMiUbicacion = () => {
    setVista({ centro: MI_UBICACION, zoom: 16 })
  }

  // Burbuja de distrito (vista lejana) → acercarse a ese distrito.
  const acercarDistrito = (d: Distrito) => {
    setVista({ centro: [d.lat, d.lng], zoom: 15 })
  }

  const cerrarSheet = () => {
    setSeleccionReporte(null)
    setSeleccionZona(null)
  }

  // Ruta segura: al punto seguro más cercano a tu ubicación simulada.
  const activarRutaSegura = () => {
    let destino: PuntoSeguro | null = null
    let mejor = Infinity
    for (const p of puntosSeguros) {
      const d = distanciaMetros(MI_UBICACION, [p.lat, p.lng])
      if (d < mejor) {
        mejor = d
        destino = p
      }
    }
    if (!destino) return
    const puntos = rutaAproximada(MI_UBICACION, [destino.lat, destino.lng])
    const metros = Math.round(longitudRuta(puntos))
    setRuta({ destino, puntos, metros, minutos: minutosCaminando(metros) })
    setVerSeguros(true)
    cerrarSheet()
    setVista({
      centro: [
        (MI_UBICACION[0] + destino.lat) / 2,
        (MI_UBICACION[1] + destino.lng) / 2,
      ],
      zoom: 16,
    })
  }

  // La zona seleccionada puede quedar desactualizada tras confirmar un
  // reporte: se busca la versión viva en cada render.
  const zonaViva = seleccionZona
    ? zonasConReportes.find((z) => z.zona.id === seleccionZona.zona.id) ?? seleccionZona
    : null

  return (
    <div className="relative h-full w-full">
      {/* Mapa a pantalla completa */}
      <MapaView
        reportes={reportesFiltrados}
        zonas={zonasConReportes}
        conteoPorDistrito={conteoPorDistrito}
        puntosSeguros={puntosSeguros}
        verRiesgo={verRiesgo}
        verSeguros={verSeguros}
        centro={vista.centro}
        zoom={vista.zoom}
        ruta={ruta}
        onSeleccionarReporte={setSeleccionReporte}
        onSeleccionarZona={setSeleccionZona}
        onAcercarDistrito={acercarDistrito}
      />

      {/* ── Barra superior estilo Waze: píldora de búsqueda + chips ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] space-y-2 p-3">
        <button
          onClick={() => setBuscando(true)}
          className="pointer-events-auto flex w-full items-center gap-2.5 rounded-full bg-white px-4 py-3 text-left shadow-suave active:bg-fondo"
          aria-label="Buscar distrito o punto seguro"
        >
          <Search size={18} className="shrink-0 text-marca" />
          <span
            className={[
              'flex-1 truncate text-sm',
              distritoNombre ? 'font-bold text-tinta' : 'font-medium text-tinta/45',
            ].join(' ')}
          >
            {distritoNombre ?? '¿Qué zona quieres ver?'}
          </span>
          {distritoNombre && (
            <span
              role="button"
              aria-label="Quitar filtro de distrito"
              onClick={(e) => {
                e.stopPropagation()
                elegirTodos()
              }}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-fondo text-tinta/50 hover:bg-borde"
            >
              <X size={14} />
            </span>
          )}
        </button>

        {/* Chips de filtro por tipo, coloreados por nivel de riesgo */}
        <div className="scrollbar-none pointer-events-auto flex gap-2 overflow-x-auto pb-1">
          {FILTROS.map((t) => {
            const { label, Icono, peso } = META_INCIDENTE[t]
            const activo = activos.has(t)
            const color = colorPorIntensidad(peso)
            return (
              <Chip
                key={t}
                activo={activo}
                onClick={() => toggleFiltro(t)}
                className="shadow-suave"
                style={activo ? { backgroundColor: color, borderColor: color } : undefined}
              >
                <Icono size={14} />
                {label}
              </Chip>
            )
          })}
        </div>
      </div>

      {/* ── Botones flotantes (capas + mi ubicación) ── */}
      <div className="absolute bottom-20 right-3 z-[1000] flex flex-col gap-2">
        <FabMapa
          aria-label="Capas del mapa"
          activo={capasAbierto}
          onClick={() => setCapasAbierto((v) => !v)}
        >
          <Layers size={20} />
        </FabMapa>
        <FabMapa aria-label="Ir a mi ubicación" onClick={irAMiUbicacion}>
          <LocateFixed size={20} />
        </FabMapa>
      </div>

      {/* Popover de capas */}
      {capasAbierto && (
        <>
          <button
            aria-label="Cerrar capas"
            onClick={() => setCapasAbierto(false)}
            className="absolute inset-0 z-[1040] cursor-default bg-transparent"
          />
          <div className="pop-in absolute bottom-20 right-16 z-[1050] w-56 rounded-2xl bg-white p-2 shadow-marco">
            <p className="px-2 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wide text-tinta/40">
              Capas del mapa
            </p>
            <FilaCapa
              Icono={Flame}
              colorIcono="text-riesgo-medio"
              label="Zonas de riesgo"
              descripcion="Calor + zonas + reportes"
              activo={verRiesgo}
              onToggle={() => setVerRiesgo((v) => !v)}
            />
            <FilaCapa
              Icono={ShieldCheck}
              colorIcono="text-seguro"
              label="Puntos seguros"
              descripcion="Comisarías, hospitales…"
              activo={verSeguros}
              onToggle={() => setVerSeguros((v) => !v)}
            />
          </div>
        </>
      )}

      {/* Banner de ruta segura activa (reemplaza a la leyenda mientras dura). */}
      {ruta ? (
        <div className="pop-in absolute bottom-3 left-3 right-3 z-[1010] flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-marco">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-seguro-suave text-seguro">
            <Navigation size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-bold leading-tight">
              Ruta segura: {ruta.destino.nombre}
            </p>
            <p className="text-[12px] text-tinta/55">
              {META_PUNTO_SEGURO[ruta.destino.tipo].label} · {ruta.metros} m · ~
              {ruta.minutos} min a pie
            </p>
          </div>
          <button
            onClick={() => setRuta(null)}
            aria-label="Quitar ruta segura"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-fondo text-tinta/50 hover:bg-borde"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <Leyenda total={reportesFiltrados.length} />
      )}

      {/* ── Panel de búsqueda a pantalla completa (estilo Waze) ── */}
      {buscando && (
        <div className="absolute inset-0 z-[1200] flex flex-col bg-white">
          <div className="flex items-center gap-2 border-b border-borde p-3">
            <button
              onClick={cerrarBusqueda}
              aria-label="Volver al mapa"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-tinta/60 hover:bg-fondo"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-1 items-center gap-2 rounded-full bg-fondo px-3.5">
              <Search size={17} className="shrink-0 text-tinta/40" />
              <input
                autoFocus
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                placeholder="Distrito o punto seguro…"
                className="w-full bg-transparent py-2.5 text-sm focus:outline-none"
                aria-label="Buscar distrito o punto seguro"
              />
              {consulta && (
                <button
                  onClick={() => setConsulta('')}
                  aria-label="Borrar búsqueda"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-borde text-tinta/50"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <FilaResultado
              icono={
                <span className="grid h-9 w-9 place-items-center rounded-full bg-marca-suave text-marca">
                  <MapIcon size={17} />
                </span>
              }
              titulo="Todo Lima"
              subtitulo="Ver todas las zonas de ejemplo"
              onClick={elegirTodos}
            />

            {distritosFiltrados.length > 0 && (
              <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-tinta/40">
                Distritos
              </p>
            )}
            {distritosFiltrados.map((d) => {
              const n = reportes.filter((r) => r.distrito === d.nombre).length
              return (
                <FilaResultado
                  key={d.id}
                  icono={
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-fondo text-tinta/60">
                      <MapPin size={17} />
                    </span>
                  }
                  titulo={d.nombre}
                  subtitulo={n > 0 ? `${n} reportes en la zona` : 'Sin reportes recientes'}
                  onClick={() => elegirDistrito(d)}
                />
              )
            })}

            {puntosFiltrados.length > 0 && (
              <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-tinta/40">
                Puntos seguros
              </p>
            )}
            {puntosFiltrados.map((p) => {
              const { Icono, label } = META_PUNTO_SEGURO[p.tipo]
              return (
                <FilaResultado
                  key={p.id}
                  icono={
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-seguro-suave text-seguro">
                      <Icono size={17} />
                    </span>
                  }
                  titulo={p.nombre}
                  subtitulo={`${label} · ${p.distrito}`}
                  onClick={() => elegirPunto(p)}
                />
              )
            })}

            {sinResultados && (
              <div className="px-4 py-10 text-center text-sm text-tinta/45">
                Sin resultados para “{consulta.trim()}”.
                <br />
                Prueba con un distrito como “Miraflores”.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom sheet: detalle de un reporte o de una zona caliente */}
      <BottomSheet
        abierto={seleccionReporte !== null || zonaViva !== null}
        onCerrar={cerrarSheet}
        titulo={
          seleccionReporte
            ? META_INCIDENTE[seleccionReporte.tipo].label
            : zonaViva?.zona.nombre
        }
      >
        {seleccionReporte ? (
          <DetalleReporte
            reporteId={seleccionReporte.id}
            fallback={seleccionReporte}
            onReportar={() => navigate('/reportar')}
            onRutaSegura={activarRutaSegura}
          />
        ) : zonaViva ? (
          <DetalleZonaCaliente
            zona={zonaViva}
            onVerReporte={(r) => {
              setSeleccionZona(null)
              setSeleccionReporte(r)
            }}
            onReportar={() => navigate('/reportar')}
            onRutaSegura={activarRutaSegura}
          />
        ) : null}
      </BottomSheet>
    </div>
  )
}

// Botón flotante circular blanco, estilo Waze.
function FabMapa({
  activo = false,
  children,
  ...props
}: {
  activo?: boolean
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={[
        'grid h-12 w-12 place-items-center rounded-full shadow-marco transition-colors',
        activo ? 'bg-marca text-white' : 'bg-white text-marca hover:bg-fondo',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function FilaCapa({
  Icono,
  colorIcono,
  label,
  descripcion,
  activo,
  onToggle,
}: {
  Icono: typeof ShieldAlert
  colorIcono: string
  label: string
  descripcion: string
  activo: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={activo}
      className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-left hover:bg-fondo"
    >
      <Icono size={18} className={activo ? colorIcono : 'text-tinta/30'} />
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold leading-tight">{label}</span>
        <span className="block truncate text-[11px] text-tinta/45">{descripcion}</span>
      </span>
      <span
        className={[
          'relative h-6 w-10 shrink-0 rounded-full transition-colors',
          activo ? 'bg-marca' : 'bg-borde',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            activo ? 'translate-x-[18px]' : 'translate-x-0.5',
          ].join(' ')}
        />
      </span>
    </button>
  )
}

function FilaResultado({
  icono,
  titulo,
  subtitulo,
  onClick,
}: {
  icono: ReactNode
  titulo: string
  subtitulo: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left active:bg-fondo"
    >
      {icono}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{titulo}</span>
        <span className="block truncate text-[12px] text-tinta/50">{subtitulo}</span>
      </span>
      <ChevronRight size={17} className="shrink-0 text-tinta/25" />
    </button>
  )
}

// Detalle de un reporte individual, con validación comunitaria.
function DetalleReporte({
  reporteId,
  fallback,
  onReportar,
  onRutaSegura,
}: {
  reporteId: string
  fallback: Reporte
  onReportar: () => void
  onRutaSegura: () => void
}) {
  const { reportes, confirmarReporte, misConfirmaciones } = useApp()
  // Versión viva del reporte (las confirmaciones cambian en el contexto).
  const reporte = reportes.find((r) => r.id === reporteId) ?? fallback
  const yaConfirme = misConfirmaciones.has(reporte.id)

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

      {/* Validación comunitaria estilo Waze: "sigue pasando" */}
      <div className="flex items-center gap-2.5 rounded-xl border border-borde px-3 py-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-marca-suave text-marca">
          <Users size={17} />
        </span>
        <p className="min-w-0 flex-1 text-[13px] leading-snug text-tinta/75">
          <b className="text-tinta">{reporte.confirmaciones}</b>{' '}
          {reporte.confirmaciones === 1 ? 'vecino confirmó' : 'vecinos confirmaron'} esta
          zona
        </p>
        <button
          onClick={() => confirmarReporte(reporte.id)}
          disabled={yaConfirme}
          className={[
            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-bold transition-colors',
            yaConfirme
              ? 'bg-seguro-suave text-seguro'
              : 'bg-marca text-white active:bg-marca-oscuro',
          ].join(' ')}
        >
          {yaConfirme ? (
            <>
              <Check size={14} /> Confirmado
            </>
          ) : (
            <>
              <Eye size={14} /> Lo vi también
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Boton variante="exito" bloque onClick={onRutaSegura} className="text-[14px]">
          <Navigation size={17} /> Ruta segura
        </Boton>
        <Boton variante="primario" bloque onClick={onReportar} className="text-[14px]">
          Reportar aquí
        </Boton>
      </div>
    </div>
  )
}

// Detalle de una zona caliente: resumen + lista de sus reportes.
function DetalleZonaCaliente({
  zona,
  onVerReporte,
  onReportar,
  onRutaSegura,
}: {
  zona: ZonaConReportes
  onVerReporte: (r: Reporte) => void
  onReportar: () => void
  onRutaSegura: () => void
}) {
  const color = colorPorIntensidad(zona.intensidad)
  const nivel =
    zona.intensidad >= 0.75 ? 'alto' : zona.intensidad >= 0.55 ? 'medio' : 'bajo'
  const totalConfirmaciones = zona.reportes.reduce((s, r) => s + r.confirmaciones, 0)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-fondo px-3 py-1 text-[13px] text-tinta/60">
          <MapPin size={14} /> {zona.zona.distrito}
        </span>
        <span
          className="rounded-full px-3 py-1 text-[13px] font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          Riesgo {nivel}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-fondo px-3 py-1 text-[13px] text-tinta/60">
          <Users size={14} /> {totalConfirmaciones} confirmaciones
        </span>
      </div>

      <p className="text-[13px] text-tinta/60">
        {zona.reportes.length}{' '}
        {zona.reportes.length === 1 ? 'reporte activo' : 'reportes activos'} en esta zona.
        El área sigue las calles del sector, no ubicaciones exactas.
      </p>

      <div className="space-y-1.5">
        {zona.reportes.map((r) => {
          const meta = META_INCIDENTE[r.tipo]
          const c = colorPorIntensidad(meta.peso)
          return (
            <button
              key={r.id}
              onClick={() => onVerReporte(r)}
              className="flex w-full items-center gap-3 rounded-xl border border-borde px-3 py-2.5 text-left active:bg-fondo"
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white"
                style={{ backgroundColor: c }}
              >
                <meta.Icono size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{meta.label}</span>
                <span className="block text-[12px] text-tinta/50">
                  {tiempoRelativo(r.fecha)} · {r.confirmaciones}{' '}
                  {r.confirmaciones === 1 ? 'confirmación' : 'confirmaciones'}
                </span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-tinta/25" />
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Boton variante="exito" bloque onClick={onRutaSegura} className="text-[14px]">
          <Navigation size={17} /> Ruta segura
        </Boton>
        <Boton variante="primario" bloque onClick={onReportar} className="text-[14px]">
          Reportar aquí
        </Boton>
      </div>
    </div>
  )
}
