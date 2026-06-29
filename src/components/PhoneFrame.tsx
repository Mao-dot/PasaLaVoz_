import type { ReactNode } from 'react'

// En desktop, centra la app dentro de un "marco" tipo celular.
// En móvil ocupa toda la pantalla. El interior es responsive.
export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center sm:p-4">
      <div
        className="relative flex w-full max-w-movil flex-col overflow-hidden bg-fondo
                   h-screen sm:h-[860px] sm:max-h-[94vh] sm:rounded-[2.2rem] sm:border-[10px]
                   sm:border-slate-900 sm:shadow-marco"
      >
        {children}
      </div>
    </div>
  )
}
