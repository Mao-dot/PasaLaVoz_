import type { ReactNode } from 'react'

// Tarjeta blanca con borde suave, usada en toda la app.
export default function Tarjeta({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <div
      id={id}
      className={[
        'rounded-2xl bg-white border border-borde shadow-suave',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
