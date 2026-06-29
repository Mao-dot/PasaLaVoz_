import { useEffect, useRef, useState } from 'react'
import {
  Siren,
  Phone,
  PhoneCall,
  Users,
  Plus,
  Trash2,
  MapPin,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Boton from '../../components/Boton'
import Tarjeta from '../../components/Tarjeta'
import { useApp } from '../../context/AppContext'
import { AVISO_PROTOTIPO } from '../../lib/numeros'

type Estado = 'idle' | 'confirmando' | 'enviada'

export default function SosPage() {
  const [estado, setEstado] = useState<Estado>('idle')

  return (
    <div className="pb-8">
      <EncabezadoPagina titulo="SOS" subtitulo="Emergencia y contactos de confianza" />

      <div className="space-y-5 p-4">
        {estado === 'enviada' ? (
          <AlertaEnviada onReiniciar={() => setEstado('idle')} />
        ) : (
          <BotonSos onActivar={() => setEstado('confirmando')} />
        )}

        <ContactosConfianza />

        <div className="flex items-start gap-2 rounded-xl bg-sos-suave px-3 py-2.5 text-[12.5px] text-sos-oscuro">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          {AVISO_PROTOTIPO}
        </div>
      </div>

      {estado === 'confirmando' && (
        <ModalCuentaRegresiva
          onCancelar={() => setEstado('idle')}
          onConfirmar={() => setEstado('enviada')}
        />
      )}
    </div>
  )
}

/* ---------- Botón de mantener presionado 3 s ---------- */
function BotonSos({ onActivar }: { onActivar: () => void }) {
  const [progreso, setProgreso] = useState(0)
  const inicio = useRef<number | null>(null)
  const raf = useRef<number>()
  const DURACION = 3000

  const reset = () => {
    inicio.current = null
    if (raf.current) cancelAnimationFrame(raf.current)
    setProgreso(0)
  }

  const tick = (t: number) => {
    if (inicio.current == null) return
    const p = Math.min(100, ((t - inicio.current) / DURACION) * 100)
    setProgreso(p)
    if (p >= 100) {
      reset()
      onActivar()
      return
    }
    raf.current = requestAnimationFrame(tick)
  }

  const iniciar = () => {
    inicio.current = performance.now()
    raf.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => reset(), [])

  // Anillo de progreso
  const R = 92
  const C = 2 * Math.PI * R
  const offset = C * (1 - progreso / 100)

  return (
    <Tarjeta className="flex flex-col items-center px-4 py-6">
      <p className="mb-5 text-center text-[15px] font-semibold text-tinta/70">
        Mantén presionado <span className="text-sos">3 segundos</span> para activar el SOS
      </p>
      <button
        onPointerDown={iniciar}
        onPointerUp={reset}
        onPointerLeave={reset}
        onPointerCancel={reset}
        aria-label="Mantén presionado 3 segundos para activar SOS"
        className="relative grid h-56 w-56 select-none place-items-center rounded-full bg-sos text-white shadow-marco transition-transform active:scale-95 touch-none"
      >
        <svg className="pointer-events-none absolute inset-0 -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="8" />
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="flex flex-col items-center">
          <Siren size={52} />
          <span className="mt-1 text-2xl font-extrabold tracking-wide">SOS</span>
          <span className="text-[12px] text-white/80">
            {progreso > 0 ? 'Sigue presionando…' : 'Presiona y mantén'}
          </span>
        </div>
      </button>
    </Tarjeta>
  )
}

/* ---------- Modal con cuenta regresiva de 5 s ---------- */
function ModalCuentaRegresiva({
  onCancelar,
  onConfirmar,
}: {
  onCancelar: () => void
  onConfirmar: () => void
}) {
  const [seg, setSeg] = useState(5)

  useEffect(() => {
    if (seg <= 0) {
      onConfirmar()
      return
    }
    const id = setTimeout(() => setSeg((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seg, onConfirmar])

  return (
    <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-marco">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sos-suave">
          <ShieldAlert size={32} className="text-sos" />
        </div>
        <h2 className="mt-4 text-xl font-extrabold">¿Activar alerta de emergencia?</h2>
        <p className="mt-1 text-[13.5px] text-tinta/60">
          Se enviará en <span className="font-bold text-sos">{seg}s</span>. Puedes cancelar.
        </p>
        <div className="mt-5 grid gap-2">
          <Boton variante="sos" bloque onClick={onConfirmar}>
            Confirmar ahora
          </Boton>
          <Boton variante="secundario" bloque onClick={onCancelar}>
            Cancelar
          </Boton>
        </div>
      </div>
    </div>
  )
}

/* ---------- Estado: alerta enviada (simulada) ---------- */
function AlertaEnviada({ onReiniciar }: { onReiniciar: () => void }) {
  const { contactos } = useApp()
  return (
    <Tarjeta className="overflow-hidden">
      <div className="bg-seguro-suave px-4 py-5 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white">
          <CheckCircle2 size={36} className="text-seguro" />
        </div>
        <h2 className="mt-3 text-lg font-extrabold text-seguro">Alerta enviada</h2>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-[13px] text-tinta/70">
          <MapPin size={14} className="text-seguro" />
          Compartiendo tu ubicación con tus contactos de confianza
        </p>
      </div>

      <div className="space-y-2 p-4">
        {contactos.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl bg-fondo px-3 py-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-marca-suave text-marca-oscuro font-bold">
              {c.nombre.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{c.nombre}</p>
              <p className="text-[12px] text-tinta/55">Notificado · {c.telefono}</p>
            </div>
            <span className="ml-auto h-2.5 w-2.5 rounded-full bg-seguro" />
          </div>
        ))}

        <div className="grid gap-2 pt-1">
          <a
            href="tel:105"
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-sos font-bold text-white"
          >
            <PhoneCall size={20} /> Llamar al 105 (PNP)
          </a>
          <a
            href="tel:100"
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-marca font-bold text-white"
          >
            <Phone size={20} /> Línea 100 (violencia)
          </a>
        </div>

        <button
          onClick={onReiniciar}
          className="mt-1 w-full py-2 text-[13px] font-semibold text-tinta/50"
        >
          Volver al inicio del SOS
        </button>
      </div>
    </Tarjeta>
  )
}

/* ---------- Contactos de confianza (mock, editable) ---------- */
function ContactosConfianza() {
  const { contactos, agregarContacto, eliminarContacto } = useApp()
  const [agregando, setAgregando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')

  const guardar = () => {
    if (!nombre.trim()) return
    agregarContacto({ nombre: nombre.trim(), telefono: telefono.trim() || '—' })
    setNombre('')
    setTelefono('')
    setAgregando(false)
  }

  return (
    <Tarjeta className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Users size={18} className="text-marca" /> Contactos de confianza
        </h2>
        <span className="text-[12px] text-tinta/45">{contactos.length}</span>
      </div>

      <div className="space-y-2">
        {contactos.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-borde px-3 py-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-marca-suave text-marca-oscuro font-bold">
              {c.nombre.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{c.nombre}</p>
              <p className="text-[12px] text-tinta/55">{c.telefono}</p>
            </div>
            <button
              onClick={() => eliminarContacto(c.id)}
              aria-label={`Eliminar a ${c.nombre}`}
              className="ml-auto grid h-9 w-9 place-items-center rounded-full text-tinta/40 hover:bg-sos-suave hover:text-sos"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      {agregando ? (
        <div className="mt-3 space-y-2 rounded-xl bg-fondo p-3">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            className="w-full rounded-lg border border-borde bg-white px-3 py-2.5 text-sm focus:border-marca focus:outline-none"
          />
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Teléfono"
            inputMode="tel"
            className="w-full rounded-lg border border-borde bg-white px-3 py-2.5 text-sm focus:border-marca focus:outline-none"
          />
          <div className="flex gap-2">
            <Boton variante="primario" bloque onClick={guardar}>
              Guardar
            </Boton>
            <Boton variante="fantasma" bloque onClick={() => setAgregando(false)}>
              Cancelar
            </Boton>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAgregando(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-borde py-3 text-sm font-semibold text-marca hover:bg-marca-suave/50"
        >
          <Plus size={18} /> Agregar contacto
        </button>
      )}
    </Tarjeta>
  )
}
