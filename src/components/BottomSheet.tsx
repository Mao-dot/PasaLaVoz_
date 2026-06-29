import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  abierto: boolean
  onCerrar: () => void
  titulo?: string
  children: ReactNode
}

// Hoja inferior deslizable. Se cierra tocando el fondo o el botón cerrar.
export default function BottomSheet({
  abierto,
  onCerrar,
  titulo,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto, onCerrar])

  return (
    <div
      className={[
        'absolute inset-0 z-[1100] flex flex-col justify-end',
        abierto ? 'pointer-events-auto' : 'pointer-events-none',
      ].join(' ')}
      aria-hidden={!abierto}
    >
      {/* Fondo oscuro */}
      <button
        aria-label="Cerrar"
        onClick={onCerrar}
        className={[
          'absolute inset-0 bg-black/40 transition-opacity duration-200',
          abierto ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={[
          'relative bg-white rounded-t-3xl shadow-marco px-5 pt-3 pb-6 safe-bottom',
          'max-h-[80%] overflow-y-auto transition-transform duration-300 ease-out',
          abierto ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-borde" />
        {titulo && (
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">{titulo}</h2>
            <button
              onClick={onCerrar}
              aria-label="Cerrar"
              className="grid h-10 w-10 place-items-center rounded-full text-tinta/60 hover:bg-fondo"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
