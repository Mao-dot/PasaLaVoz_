import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
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
  ChevronDown,
} from 'lucide-react'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Boton from '../../components/Boton'
import Tarjeta from '../../components/Tarjeta'
import { useApp } from '../../context/AppContext'
import { AVISO_PROTOTIPO } from '../../lib/numeros'
import { MI_UBICACION } from '../../data/distritos'

type Estado = 'idle' | 'enviada'

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
              vibrar([200, 80, 200])
              setEstado('enviada')
            }}
          />
        )}

        <ContactosConfianza />

        <div className="flex items-start gap-2 rounded-xl bg-sos-suave px-3 py-2.5 text-[12.5px] text-sos-oscuro">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          {AVISO_PROTOTIPO}
        </div>
      </div>
    </div>
  )
}

/* ---------- Botón mantener-y-soltar (mecánica tipo nota de voz) ----------
 * 1. Presiona y mantén: la alerta se ARMA (anillo de progreso, ~1.5 s).
 * 2. Armada: al SOLTAR se envía de inmediato.
 * 3. ¿Te arrepentiste? Sin soltar, desliza el dedo hacia abajo hasta la
 *    zona CANCELAR y suelta ahí: no se envía nada.
 */
type Fase = 'reposo' | 'cargando' | 'armado'
type Aviso = 'corto' | 'cancelado' | null

function BotonSos({ onActivar }: { onActivar: () => void }) {
  const [fase, setFase] = useState<Fase>('reposo')
  const [progreso, setProgreso] = useState(0)
  const [sobreCancelar, setSobreCancelar] = useState(false)
  const [aviso, setAviso] = useState<Aviso>(null)
  const inicio = useRef<number | null>(null)
  const raf = useRef<number>()
  const armadoTimeout = useRef<number>()
  const cancelarRef = useRef<HTMLDivElement>(null)
  const ARMADO_MS = 1500

  const reset = () => {
    inicio.current = null
    if (raf.current) cancelAnimationFrame(raf.current)
    if (armadoTimeout.current) clearTimeout(armadoTimeout.current)
    setProgreso(0)
    setFase('reposo')
    setSobreCancelar(false)
  }

  // El anillo se anima con rAF, pero el ARMADO usa un timeout aparte:
  // si el navegador recorta frames, el gesto sigue siendo puntual.
  const tick = (t: number) => {
    if (inicio.current == null) return
    const p = Math.min(100, ((t - inicio.current) / ARMADO_MS) * 100)
    setProgreso(p)
    if (p < 100) raf.current = requestAnimationFrame(tick)
  }

  const alPresionar = (e: ReactPointerEvent<HTMLButtonElement>) => {
    // Captura el puntero: seguimos recibiendo move/up aunque el dedo
    // salga del botón (necesario para deslizar hasta CANCELAR).
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* toque implícitamente capturado o puntero sintético: continuar */
    }
    setAviso(null)
    vibrar(30)
    setFase('cargando')
    inicio.current = performance.now()
    raf.current = requestAnimationFrame(tick)
    armadoTimeout.current = window.setTimeout(() => {
      // Alerta armada: desde aquí, soltar = enviar.
      setFase('armado')
      vibrar([70, 50, 110])
    }, ARMADO_MS)
  }

  const alMover = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (fase === 'reposo') return
    const rect = cancelarRef.current?.getBoundingClientRect()
    if (!rect) return
    const margen = 14
    const dentro =
      e.clientX >= rect.left - margen &&
      e.clientX <= rect.right + margen &&
      e.clientY >= rect.top - margen &&
      e.clientY <= rect.bottom + margen
    if (dentro !== sobreCancelar) {
      setSobreCancelar(dentro)
      if (dentro) vibrar(20)
    }
  }

  const alSoltar = () => {
    if (fase === 'armado') {
      if (sobreCancelar) {
        reset()
        setAviso('cancelado')
        vibrar(50)
      } else {
        reset()
        onActivar()
      }
    } else if (fase === 'cargando') {
      reset()
      setAviso('corto')
    }
  }

  // Interrupción del sistema (llamada, gesto del SO): jamás enviar por error.
  const alInterrumpir = () => {
    if (fase !== 'reposo') {
      reset()
      setAviso('cancelado')
    }
  }

  // Los avisos se limpian solos a los pocos segundos.
  useEffect(() => {
    if (!aviso) return
    const id = setTimeout(() => setAviso(null), 3500)
    return () => clearTimeout(id)
  }, [aviso])

  useEffect(() => () => reset(), [])

  // Anillo de progreso
  const R = 92
  const C = 2 * Math.PI * R
  const offset = C * (1 - progreso / 100)
  const presionando = fase !== 'reposo'

  const instruccion =
    fase === 'reposo' ? (
      <>
        Mantén presionado para armar. <span className="text-sos">Al soltar se envía.</span>
      </>
    ) : fase === 'cargando' ? (
      <>Armando la alerta… no sueltes</>
    ) : sobreCancelar ? (
      <span className="text-tinta">Suelta para cancelar</span>
    ) : (
      <>
        <span className="text-sos">Suelta para ENVIAR</span> · desliza abajo para cancelar
      </>
    )

  return (
    <Tarjeta className="flex flex-col items-center px-4 py-6">
      <p className="mb-5 min-h-[22px] text-center text-[15px] font-semibold text-tinta/70">
        {instruccion}
      </p>

      <div className="relative">
        {/* Ondas pulsantes de fondo */}
        <span className="sos-anillo" aria-hidden />
        <span className="sos-anillo sos-anillo-2" aria-hidden />

        <button
          onPointerDown={alPresionar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alInterrumpir}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Mantén presionado; al soltar se envía la alerta. Desliza hacia abajo para cancelar."
          className={[
            'relative grid h-56 w-56 select-none place-items-center rounded-full text-white',
            'bg-gradient-to-b from-sos to-sos-oscuro shadow-marco touch-none',
            'transition-transform',
            aviso === 'corto' ? 'sacudida' : '',
            fase === 'armado' && !sobreCancelar ? 'sos-armado' : '',
            presionando ? 'scale-95' : 'active:scale-95',
            sobreCancelar ? 'opacity-70 saturate-50' : '',
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
              strokeDashoffset={fase === 'armado' ? 0 : offset}
            />
          </svg>
          <div className="pointer-events-none flex flex-col items-center">
            <Siren size={52} />
            <span className="mt-1 text-2xl font-extrabold tracking-wide">SOS</span>
            <span className="text-[12px] text-white/85">
              {fase === 'reposo' && 'Presiona y mantén'}
              {fase === 'cargando' && 'Armando…'}
              {fase === 'armado' && (sobreCancelar ? 'Cancelando…' : 'Suelta para enviar')}
            </span>
          </div>
        </button>
      </div>

      {/* Zona de cancelar: objetivo del gesto "desliza hacia abajo". */}
      <div
        ref={cancelarRef}
        aria-hidden={!presionando}
        className={[
          'mt-6 flex h-14 w-full max-w-[250px] items-center justify-center gap-2 rounded-2xl border-2 text-[13.5px] font-bold transition-all duration-200',
          presionando ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
          sobreCancelar
            ? 'scale-105 border-solid border-sos bg-sos-suave text-sos'
            : 'border-dashed border-borde bg-fondo/60 text-tinta/45',
        ].join(' ')}
      >
        <ChevronDown size={18} />
        {sobreCancelar ? 'Suelta para cancelar' : 'Desliza aquí para cancelar'}
      </div>

      <p
        className={[
          'mt-4 flex min-h-[20px] items-center gap-1.5 text-center text-[12px]',
          aviso === 'corto' ? 'font-semibold text-amber-600' : '',
          aviso === 'cancelado' ? 'font-semibold text-seguro' : 'text-tinta/50',
        ].join(' ')}
      >
        {aviso === 'corto' ? (
          <>Se soltó muy pronto. Mantén presionado hasta que se arme.</>
        ) : aviso === 'cancelado' ? (
          <>
            <ShieldCheck size={14} className="shrink-0" /> Alerta cancelada. No se envió
            nada.
          </>
        ) : (
          <>
            <ShieldCheck size={14} className="shrink-0 text-seguro" />
            Al enviarla se avisa a tus contactos con tu zona aproximada.
          </>
        )}
      </p>
    </Tarjeta>
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

  // Enlace de WhatsApp con la zona aproximada del usuario (simulada).
  const [lat, lng] = MI_UBICACION
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
