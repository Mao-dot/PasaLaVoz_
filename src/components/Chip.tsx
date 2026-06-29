import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  activo?: boolean
  children: ReactNode
}

// Chip de filtro seleccionable (usado en el mapa).
export default function Chip({
  activo = false,
  className = '',
  children,
  ...props
}: ChipProps) {
  return (
    <button
      aria-pressed={activo}
      className={[
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2',
        'text-[13px] font-semibold border transition-colors min-h-[40px]',
        activo
          ? 'bg-marca text-white border-marca'
          : 'bg-white text-tinta/70 border-borde hover:border-marca/40',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
