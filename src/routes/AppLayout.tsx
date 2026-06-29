import { Outlet } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

// Layout de las pantallas principales: contenido desplazable + bottom nav fija.
export default function AppLayout() {
  return (
    <>
      <main className="relative flex-1 min-h-0 overflow-y-auto bg-fondo">
        <Outlet />
      </main>
      <BottomNav />
    </>
  )
}
