import type { ReactNode } from 'react'

// Encabezado estándar de pantalla (título + subtítulo opcional).
export default function EncabezadoPagina({
  titulo,
  subtitulo,
  accion,
}: {
  titulo: string
  subtitulo?: string
  accion?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-borde bg-white/90 px-5 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold leading-tight">{titulo}</h1>
          {subtitulo && (
            <p className="text-[13px] text-tinta/55">{subtitulo}</p>
          )}
        </div>
        {accion}
      </div>
    </header>
  )
}
