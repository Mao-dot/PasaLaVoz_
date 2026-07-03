import { Outlet } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

// Layout de las pantallas principales: contenido desplazable + bottom nav fija.
// `isolate` crea un stacking context: los z-index internos del mapa (Leaflet
// usa 200–1000) quedan confinados y ya no se dibujan sobre la barra inferior.
export default function AppLayout() {
  return (
    <>
      <main className="relative isolate z-0 flex-1 min-h-0 overflow-y-auto bg-fondo">
        <Outlet />
      </main>
      <BottomNav />
    </>
  )
}
