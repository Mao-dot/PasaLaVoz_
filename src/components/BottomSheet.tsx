import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  abierto: boolean
  onCerrar: () => void
  titulo?: string
  children: ReactNode
}

const SELECTOR_FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

// Diálogo inferior con cierre por Escape, foco contenido y retorno al activador.
export default function BottomSheet({
  abierto,
  onCerrar,
  titulo,
  children,
}: BottomSheetProps) {
  const tituloId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const cerrarRef = useRef<HTMLButtonElement>(null)
  const onCerrarRef = useRef(onCerrar)

  useEffect(() => {
    onCerrarRef.current = onCerrar
  }, [onCerrar])

  useEffect(() => {
    if (!abierto) return

    const focoAnterior =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const frame = window.requestAnimationFrame(() => cerrarRef.current?.focus())

    const onKey = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        onCerrarRef.current()
        return
      }

      if (evento.key !== 'Tab' || !panelRef.current) return

      const elementos = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(SELECTOR_FOCUSABLE),
      ).filter((elemento) => elemento.getClientRects().length > 0)

      if (elementos.length === 0) {
        evento.preventDefault()
        panelRef.current.focus()
        return
      }

      const primero = elementos[0]
      const ultimo = elementos[elementos.length - 1]

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primero.focus()
      }
    }

    window.addEventListener('keydown', onKey)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflowAnterior
      if (focoAnterior?.isConnected) focoAnterior.focus()
    }
  }, [abierto])

  // Al desmontarlo cerrado, ningún control oculto permanece en el orden de Tab.
  if (!abierto) return null

  return (
    <div className="absolute inset-0 z-[1100] flex flex-col justify-end overflow-hidden">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Cerrar detalle"
        onClick={onCerrar}
        className="absolute inset-0 bg-black/40"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className="relative max-h-[80%] overflow-y-auto rounded-t-3xl bg-white px-5 pb-6 pt-3 shadow-marco safe-bottom"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-borde" />
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id={tituloId} className="text-lg font-bold">
            {titulo ?? 'Detalle'}
          </h2>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar detalle"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-tinta/65 hover:bg-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca/50"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
