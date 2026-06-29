import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variante = 'primario' | 'secundario' | 'sos' | 'fantasma' | 'exito'

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  bloque?: boolean
  children: ReactNode
}

const estilos: Record<Variante, string> = {
  primario:
    'bg-marca text-white hover:bg-marca-oscuro active:bg-marca-oscuro shadow-suave',
  secundario:
    'bg-marca-suave text-marca-oscuro hover:bg-marca-suave/70 border border-marca/20',
  sos: 'bg-sos text-white hover:bg-sos-oscuro active:bg-sos-oscuro shadow-suave',
  exito: 'bg-seguro text-white hover:bg-seguro/90 shadow-suave',
  fantasma: 'bg-transparent text-marca-oscuro hover:bg-marca-suave/60',
}

// Botón con áreas táctiles amplias (mín. 44 px de alto) y buen contraste.
export default function Boton({
  variante = 'primario',
  bloque = false,
  className = '',
  children,
  ...props
}: BotonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 min-h-[48px]',
        'font-semibold text-[15px] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca/50 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        bloque ? 'w-full' : '',
        estilos[variante],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
