import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  ShieldCheck,
  Camera,
  CheckCircle2,
  Info,
  ImageOff,
} from 'lucide-react'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Boton from '../../components/Boton'
import Tarjeta from '../../components/Tarjeta'
import SafetyBanner from '../../components/SafetyBanner'
import { useApp } from '../../context/AppContext'
import { distritos } from '../../data/distritos'
import type { TipoIncidente } from '../../data/types'
import { META_INCIDENTE, TIPOS_INCIDENTE, colorPorIntensidad } from '../../lib/incidentes'
import { ofuscarCoordenada, jitter } from '../../lib/geo'

// Valor por defecto del campo fecha/hora (ahora, en hora local).
function ahoraLocal(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default function ReportarPage() {
  const navigate = useNavigate()
  const { agregarReporte } = useApp()

  const [tipo, setTipo] = useState<TipoIncidente | null>(null)
  const [distritoId, setDistritoId] = useState(distritos[0].id)
  const [cuando, setCuando] = useState(ahoraLocal())
  const [descripcion, setDescripcion] = useState('')
  const [conFoto, setConFoto] = useState(false)
  const [anonimo, setAnonimo] = useState(true)
  const [enviado, setEnviado] = useState<{ tipo: TipoIncidente; distrito: string } | null>(null)

  const distrito = distritos.find((d) => d.id === distritoId)!

  const enviar = () => {
    if (!tipo) return
    // Si el campo de fecha quedó vacío o inválido, usamos "ahora".
    const fecha = new Date(cuando)
    // Coordenada de la zona + ruido, y luego ofuscada a ~3 decimales.
    agregarReporte({
      tipo,
      distrito: distrito.nombre,
      lat: ofuscarCoordenada(jitter(distrito.lat)),
      lng: ofuscarCoordenada(jitter(distrito.lng)),
      fecha: (isNaN(+fecha) ? new Date() : fecha).toISOString(),
      descripcion: descripcion.trim(),
      anonimo,
    })
    setEnviado({ tipo, distrito: distrito.nombre })
  }

  // Limpia el formulario para hacer otro reporte (conserva los ya enviados).
  const reiniciar = () => {
    setTipo(null)
    setDistritoId(distritos[0].id)
    setCuando(ahoraLocal())
    setDescripcion('')
    setConFoto(false)
    setAnonimo(true)
    setEnviado(null)
  }

  if (enviado) {
    return (
      <Confirmacion
        resumen={enviado}
        onMapa={() => navigate('/mapa')}
        onOtro={reiniciar}
      />
    )
  }

  return (
    <div className="pb-8">
      <EncabezadoPagina titulo="Reportar incidente" subtitulo="Tu reporte ayuda a prevenir" />

      <div className="space-y-4 p-4">
        {/* Tipo: tarjetas coloreadas según nivel de riesgo */}
        <section>
          <p className="mb-2 text-sm font-bold">¿Qué ocurrió?</p>
          <div className="grid grid-cols-3 gap-2">
            {TIPOS_INCIDENTE.map((t) => {
              const { label, Icono, peso, nivel } = META_INCIDENTE[t]
              const activo = tipo === t
              const color = colorPorIntensidad(peso)
              return (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  aria-pressed={activo}
                  style={
                    activo
                      ? { borderColor: color, backgroundColor: `${color}14` }
                      : undefined
                  }
                  className={[
                    'flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-2.5 text-center text-[12px] font-semibold transition-all min-h-[92px]',
                    activo
                      ? 'shadow-suave'
                      : 'border-borde bg-white text-tinta/70 hover:border-marca/40',
                  ].join(' ')}
                >
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full transition-colors"
                    style={{ backgroundColor: activo ? color : '#F1F3F9' }}
                  >
                    <Icono size={18} color={activo ? '#fff' : '#697086'} />
                  </span>
                  <span style={activo ? { color } : undefined}>{label}</span>
                  <span
                    className="text-[10px] font-medium leading-none"
                    style={{ color: activo ? color : '#9AA1B4' }}
                  >
                    Riesgo {nivel.toLowerCase()}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Ubicación (ofuscada) */}
        <section>
          <p className="mb-2 text-sm font-bold">Ubicación</p>
          <Tarjeta className="p-3">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-marca" />
              <span className="text-sm font-semibold">Zona aproximada:</span>
              <select
                value={distritoId}
                onChange={(e) => setDistritoId(e.target.value)}
                className="ml-auto rounded-lg border border-borde bg-fondo px-2 py-1.5 text-sm font-semibold focus:outline-none"
                aria-label="Distrito de la zona"
              >
                {distritos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-[12px] text-tinta/55">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-seguro" />
              Ocultamos tu ubicación exacta para protegerte. Solo se comparte el área.
            </p>
          </Tarjeta>
        </section>

        {/* Fecha y hora */}
        <section>
          <label className="mb-2 block text-sm font-bold" htmlFor="cuando">
            ¿Cuándo fue?
          </label>
          <input
            id="cuando"
            type="datetime-local"
            value={cuando}
            onChange={(e) => setCuando(e.target.value)}
            className="w-full rounded-xl border border-borde bg-white px-3 py-3 text-sm focus:border-marca focus:outline-none"
          />
        </section>

        {/* Descripción */}
        <section>
          <div className="mb-2 flex items-end justify-between">
            <label className="text-sm font-bold" htmlFor="desc">
              Descripción corta <span className="font-normal text-tinta/50">(opcional)</span>
            </label>
            <span
              className={[
                'text-[11px] tabular-nums',
                descripcion.length >= 220 ? 'font-bold text-sos' : 'text-tinta/40',
              ].join(' ')}
            >
              {descripcion.length}/240
            </span>
          </div>
          <textarea
            id="desc"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            maxLength={240}
            placeholder="Cuéntanos qué pasó, sin identificar a personas…"
            className="w-full resize-none rounded-xl border border-borde bg-white px-3 py-3 text-sm focus:border-marca focus:outline-none"
          />
          <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-[12px] text-amber-700">
            <Info size={14} className="mt-0.5 shrink-0" />
            No incluyas nombres ni datos de personas. Se reportan hechos y zonas, no personas.
          </p>
        </section>

        {/* Foto (mock) */}
        <section>
          <p className="mb-2 text-sm font-bold">
            Foto <span className="font-normal text-tinta/50">(opcional)</span>
          </p>
          {conFoto ? (
            <div className="overflow-hidden rounded-xl border border-borde">
              <div className="grid h-24 place-items-center bg-gradient-to-br from-marca-suave to-borde">
                <Camera size={28} className="text-marca/60" />
              </div>
              <div className="flex items-center justify-between bg-white p-2.5">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-tinta/70">
                  <CheckCircle2 size={15} className="text-seguro" /> Foto adjunta (simulada)
                </span>
                <button
                  onClick={() => setConFoto(false)}
                  className="flex items-center gap-1 text-[13px] font-semibold text-sos"
                >
                  <ImageOff size={15} /> Quitar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConFoto(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-borde bg-white py-4 text-sm font-semibold text-tinta/55 hover:border-marca/40"
            >
              <Camera size={18} /> Agregar foto (simulada)
            </button>
          )}
        </section>

        {/* Anónimo */}
        <Tarjeta className="flex items-center justify-between p-3">
          <div>
            <p className="text-sm font-bold">Reportar de forma anónima</p>
            <p className="text-[12px] text-tinta/55">Activado por defecto</p>
          </div>
          <Interruptor activo={anonimo} onClick={() => setAnonimo((v) => !v)} />
        </Tarjeta>

        <Boton variante="primario" bloque disabled={!tipo} onClick={enviar} className="mt-2">
          Enviar reporte
        </Boton>
        {!tipo && (
          <p className="text-center text-[12px] text-tinta/45">
            Elige un tipo de incidente para continuar.
          </p>
        )}

        <SafetyBanner className="mt-1" />
      </div>
    </div>
  )
}

// Interruptor accesible reutilizable.
function Interruptor({ activo, onClick }: { activo: boolean; onClick: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={activo}
      onClick={onClick}
      className={[
        'relative h-7 w-12 shrink-0 rounded-full transition-colors',
        activo ? 'bg-seguro' : 'bg-borde',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
          activo ? 'translate-x-[22px]' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  )
}

function Confirmacion({
  resumen,
  onMapa,
  onOtro,
}: {
  resumen: { tipo: TipoIncidente; distrito: string }
  onMapa: () => void
  onOtro: () => void
}) {
  const meta = META_INCIDENTE[resumen.tipo]
  const color = colorPorIntensidad(meta.peso)
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="pop-in grid h-20 w-20 place-items-center rounded-full bg-seguro-suave">
        <CheckCircle2 size={48} className="text-seguro" />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold">¡Reporte enviado!</h1>
      <p className="mt-2 max-w-xs text-[15px] text-tinta/70">
        Tu reporte ayuda a prevenir y a alertar a otras personas. Ya aparece en el mapa de tu
        comunidad.
      </p>

      {/* Resumen de lo reportado */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          <meta.Icono size={14} /> {meta.label}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-tinta/70 shadow-suave">
          <MapPin size={14} className="text-marca" /> {resumen.distrito}
        </span>
      </div>

      <div className="mt-7 grid w-full max-w-xs gap-2">
        <Boton variante="primario" bloque onClick={onMapa}>
          Ver en el mapa
        </Boton>
        <Boton variante="secundario" bloque onClick={onOtro}>
          Hacer otro reporte
        </Boton>
      </div>
      <p className="mt-6 text-[12px] text-tinta/45">
        Prototipo: tu reporte queda solo en este dispositivo, no se envía a ningún servidor.
      </p>
    </div>
  )
}
