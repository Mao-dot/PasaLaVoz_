import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export default function ConnectivityBanner() {
  const [enLinea, setEnLinea] = useState(() => navigator.onLine)

  useEffect(() => {
    const activar = () => setEnLinea(true)
    const desactivar = () => setEnLinea(false)
    window.addEventListener('online', activar)
    window.addEventListener('offline', desactivar)
    return () => {
      window.removeEventListener('online', activar)
      window.removeEventListener('offline', desactivar)
    }
  }, [])

  if (enLinea) return null

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-amber-100 px-3 py-2 text-center text-[12px] font-semibold text-amber-900"
    >
      <WifiOff size={15} /> Sin conexión: el mapa base puede no estar disponible y nada se sincroniza.
    </div>
  )
}
