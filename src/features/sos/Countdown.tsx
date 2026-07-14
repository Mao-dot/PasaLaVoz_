import { useEffect, useState } from 'react'
import { ShieldOff } from 'lucide-react'
import Tarjeta from '../../components/Tarjeta'
import Boton from '../../components/Boton'

const SEGUNDOS_INICIALES = 5

interface CountdownProps {
  /** Se llama una única vez cuando la cuenta regresiva llega a 0. */
  onFinalizar: () => void
  /** Se llama si el usuario decide cancelar antes de que termine. */
  onCancelar: () => void
}

// Vibración corta y segura (ignora navegadores sin soporte).
function vibrarTick() {
  try {
    navigator.vibrate?.(35)
  } catch {
    /* sin soporte: no pasa nada */
  }
}

/**
 * Pantalla de cuenta regresiva ("Enviando alerta…") que se muestra entre
 * que el usuario arma el botón SOS y el envío real de la alerta.
 * Da una última oportunidad de cancelar (botón Cancelar) antes de avisar
 * a los contactos de confianza.
 */
export default function Countdown({ onFinalizar, onCancelar }: CountdownProps) {
  const [segundos, setSegundos] = useState(SEGUNDOS_INICIALES)

  useEffect(() => {
    if (segundos <= 0) {
      onFinalizar()
      return
    }
    const id = window.setTimeout(() => {
      vibrarTick()
      setSegundos((s) => s - 1)
    }, 1000)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segundos])

  return (
    <Tarjeta className="flex flex-col items-center gap-5 px-4 py-8 text-center">
      <div className="relative grid h-40 w-40 place-items-center">
        {/* Ondas expansivas, mismo lenguaje visual que el botón SOS */}
        <span className="sos-anillo" aria-hidden />
        <span className="sos-anillo sos-anillo-2" aria-hidden />

        <div className="relative grid h-40 w-40 place-items-center rounded-full bg-gradient-to-b from-sos to-sos-oscuro text-white shadow-marco sos-armado">
          {/* key={segundos}: cada número reinicia su propia animación de aparición */}
          <span key={segundos} className="pop-in text-5xl font-extrabold tabular-nums">
            {segundos}
          </span>
        </div>
      </div>

      <div className="pop-in">
        <p className="text-[15px] font-bold text-tinta">Enviando alerta…</p>
        <p className="mt-1 text-[13px] text-tinta/55">
          Puedes cancelar mientras cuenta regresivamente.
        </p>
      </div>

      <Boton
        variante="fantasma"
        onClick={onCancelar}
        className="border border-borde"
        aria-label="Cancelar el envío de la alerta"
      >
        <ShieldOff size={18} /> Cancelar
      </Boton>
    </Tarjeta>
  )
}
