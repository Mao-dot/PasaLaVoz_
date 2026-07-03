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
  ShieldCheck,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Boton from '../../components/Boton'
import Tarjeta from '../../components/Tarjeta'
import { useApp } from '../../context/AppContext'
import { AVISO_PROTOTIPO } from '../../lib/numeros'
import { CENTRO_LIMA } from '../../data/distritos'

type Estado = 'idle' | 'confirmando' | 'enviada'

// Vibración háptica si el dispositivo la soporta (móviles).
function vibrar(patron: number | number[]) {
  try {
    navigator.vibrate?.(patron)
  } catch {
    /* sin soporte: no pasa nada */
  }
}

export default function SosPage() {
  const [estado, setEstado] = useState<Estado>('idle')

  return (
    <div className="pb-8">
      <EncabezadoPagina titulo="SOS" subtitulo="Emergencia y contactos de confianza" />

      <div className="space-y-5 p-4">
        {estado === 'enviada' ? (
          <AlertaEnviada
            onReiniciar={() => {
              vibrar(80)
              setEstado('idle')
            }}
          />
        ) : (
          <BotonSos
            onActivar={() => {
              vibrar([120, 60, 120])
              setEstado('confirmando')
            }}
          />
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
          onConfirmar={() => {
            vibrar([200, 80, 200])
            setEstado('enviada')
          }}
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
    vibrar(30)
    inicio.current = performance.now()
    raf.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => reset(), [])

  // Anillo de progreso
  const R = 92
  const C = 2 * Math.PI * R
  const offset = C * (1 - progreso / 100)
  const presionando = progreso > 0

  return (
    <Tarjeta className="flex flex-col items-center px-4 py-6">
      <p className="mb-5 text-center text-[15px] font-semibold text-tinta/70">
        Mantén presionado <span className="text-sos">3 segundos</span> para activar el SOS
      </p>

      <div className="relative">
        {/* Ondas pulsantes de fondo */}
        <span className="sos-anillo" aria-hidden />
        <span className="sos-anillo sos-anillo-2" aria-hidden />

        <button
          onPointerDown={iniciar}
          onPointerUp={reset}
          onPointerLeave={reset}
          onPointerCancel={reset}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Mantén presionado 3 segundos para activar SOS"
          className={[
            'relative grid h-56 w-56 select-none place-items-center rounded-full text-white',
            'bg-gradient-to-b from-sos to-sos-oscuro shadow-marco touch-none',
            'transition-transform',
            presionando ? 'scale-95' : 'active:scale-95',
          ].join(' ')}
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
            <span className="text-[12px] text-white/85">
              {presionando
                ? `Sigue presionando… ${Math.ceil(3 - (progreso / 100) * 3)}s`
                : 'Presiona y mantén'}
            </span>
          </div>
        </button>
      </div>

      <p className="mt-5 flex items-center gap-1.5 text-center text-[12px] text-tinta/50">
        <ShieldCheck size={14} className="shrink-0 text-seguro" />
        Al activarlo se avisa a tus contactos con tu zona aproximada.
      </p>
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
  const TOTAL = 5
  const [seg, setSeg] = useState(TOTAL)

  useEffect(() => {
    if (seg <= 0) {
      onConfirmar()
      return
    }
    vibrar(45)
    const id = setTimeout(() => setSeg((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seg, onConfirmar])

  // Anillo de cuenta regresiva
  const R = 54
  const C = 2 * Math.PI * R

  return (
    <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
      <div className="pop-in w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-marco">
        <div className="relative mx-auto grid h-32 w-32 place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={R} fill="none" stroke="#FDECEC" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="#E23B3B"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - seg / TOTAL)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="text-5xl font-extrabold tabular-nums text-sos">{seg}</span>
        </div>

        <h2 className="mt-4 text-xl font-extrabold">¿Activar alerta de emergencia?</h2>
        <p className="mt-1 text-[13.5px] text-tinta/60">
          Se enviará automáticamente a tus contactos. Aún puedes cancelar.
        </p>
        <div className="mt-5 grid gap-2">
          <Boton variante="secundario" bloque onClick={onCancelar} className="min-h-[54px] text-base">
            Cancelar
          </Boton>
          <Boton variante="sos" bloque onClick={onConfirmar}>
            Enviar ahora
          </Boton>
        </div>
      </div>
    </div>
  )
}

/* ---------- Estado: alerta enviada (simulada) ---------- */
function AlertaEnviada({ onReiniciar }: { onReiniciar: () => void }) {
  const { contactos } = useApp()

  // Cronómetro de tiempo compartiendo ubicación.
  const [transcurrido, setTranscurrido] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTranscurrido((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const mm = String(Math.floor(transcurrido / 60)).padStart(2, '0')
  const ss = String(transcurrido % 60).padStart(2, '0')

  // Enlace de WhatsApp con ubicación aproximada (mock: centro de Lima).
  const [lat, lng] = CENTRO_LIMA
  const textoSos = encodeURIComponent(
    `🚨 SOS — Necesito ayuda. Mi zona aproximada: https://maps.google.com/?q=${lat},${lng} (enviado con PasaLaVoz, prototipo)`,
  )

  return (
    <Tarjeta className="overflow-hidden">
      <div className="bg-sos px-4 py-5 text-center text-white">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold">
          <span className="punto-vivo h-2 w-2 rounded-full bg-white" />
          ALERTA ACTIVA · {mm}:{ss}
        </div>
        <h2 className="mt-3 text-lg font-extrabold">Tus contactos fueron avisados</h2>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-[13px] text-white/85">
          <MapPin size={14} />
          Compartiendo tu zona aproximada en tiempo real
        </p>
      </div>

      <div className="space-y-2 p-4">
        {contactos.length === 0 && (
          <p className="rounded-xl bg-fondo px-3 py-3 text-center text-[13px] text-tinta/55">
            No tienes contactos de confianza aún. Agrégalos más abajo.
          </p>
        )}
        {contactos.map((c, i) => (
          <div
            key={c.id}
            className="entrar-item flex items-center gap-3 rounded-xl bg-fondo px-3 py-2.5"
            style={{ animationDelay: `${i * 220}ms` }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-marca-suave font-bold text-marca-oscuro">
              {c.nombre.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{c.nombre}</p>
              <p className="flex items-center gap-1 text-[12px] text-seguro">
                <CheckCircle2 size={12} /> Notificado · {c.telefono}
              </p>
            </div>
            <span className="punto-vivo ml-auto h-2.5 w-2.5 rounded-full bg-seguro" />
          </div>
        ))}

        <div className="grid gap-2 pt-1">
          <a
            href="tel:105"
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-sos font-bold text-white active:bg-sos-oscuro"
          >
            <PhoneCall size={20} /> Llamar al 105 (PNP)
          </a>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:100"
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-marca text-[14px] font-bold text-white active:bg-marca-oscuro"
            >
              <Phone size={17} /> Línea 100
            </a>
            <a
              href={`https://wa.me/?text=${textoSos}`}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-seguro text-[14px] font-bold text-white active:opacity-90"
            >
              <MessageCircle size={17} /> WhatsApp
            </a>
          </div>
        </div>

        <Boton variante="exito" bloque onClick={onReiniciar} className="mt-1">
          <ShieldCheck size={19} /> Estoy a salvo — finalizar alerta
        </Boton>
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
        <span className="rounded-full bg-fondo px-2 py-0.5 text-[12px] font-bold text-tinta/50">
          {contactos.length}
        </span>
      </div>

      <div className="space-y-2">
        {contactos.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-borde px-3 py-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-marca-suave font-bold text-marca-oscuro">
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
            placeholder="Teléfono · Ej. 999 888 777"
            inputMode="tel"
            className="w-full rounded-lg border border-borde bg-white px-3 py-2.5 text-sm focus:border-marca focus:outline-none"
          />
          <div className="flex gap-2">
            <Boton variante="primario" bloque disabled={!nombre.trim()} onClick={guardar}>
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
