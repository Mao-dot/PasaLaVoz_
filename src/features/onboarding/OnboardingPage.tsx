import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Phone } from 'lucide-react'
import Boton from '../../components/Boton'
import { useApp } from '../../context/AppContext'

// Pantalla 0 — Inicio / Onboarding rápido.
export default function OnboardingPage() {
  const navigate = useNavigate()
  const { entrarAnonimo, crearCuenta } = useApp()

  const entrar = (modo: 'anonimo' | 'cuenta') => {
    if (modo === 'anonimo') entrarAnonimo()
    else crearCuenta()
    navigate('/mapa')
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-marca to-marca-oscuro px-6 pb-8 pt-16 text-white">
      {/* Logo + lema */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="grid h-24 w-24 place-items-center rounded-[1.6rem] bg-white/15 ring-1 ring-white/30 backdrop-blur">
          <ShieldCheck size={52} aria-hidden />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">PasaLaVoz</h1>
        <p className="mt-2 max-w-[16rem] text-[15px] text-white/85">
          Tu voz hace tu barrio más seguro.
        </p>

        <div className="mt-8 grid w-full max-w-xs gap-2 text-left">
          {[
            'Reporta de forma anónima',
            'Consulta zonas de riesgo y puntos seguros',
            'Activa un SOS hacia tus contactos de confianza',
          ].map((t) => (
            <div key={t} className="flex items-start gap-2 text-[13.5px] text-white/90">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/80" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div className="grid gap-3">
        <Boton variante="exito" bloque onClick={() => entrar('anonimo')}>
          Entrar de forma anónima
        </Boton>
        <button
          onClick={() => entrar('cuenta')}
          className="min-h-[48px] w-full rounded-xl border border-white/40 bg-white/10 font-semibold text-white transition-colors hover:bg-white/20"
        >
          Crear cuenta
        </button>

        <div className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-black/15 px-3 py-2.5 text-[12px] text-white/90">
          <Phone size={15} className="shrink-0" />
          <span>
            Esta app no reemplaza a la policía. En una emergencia real, llama al{' '}
            <strong>105</strong>.
          </span>
        </div>
      </div>
    </div>
  )
}
