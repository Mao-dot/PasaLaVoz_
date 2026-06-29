import { NavLink, useNavigate } from 'react-router-dom'
import { Map, FilePlus2, BarChart3, User, Siren } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Item {
  to: string
  label: string
  Icono: LucideIcon
}

const izquierda: Item[] = [
  { to: '/mapa', label: 'Mapa', Icono: Map },
  { to: '/reportar', label: 'Reportar', Icono: FilePlus2 },
]
const derecha: Item[] = [
  { to: '/estadisticas', label: 'Datos', Icono: BarChart3 },
  { to: '/perfil', label: 'Perfil', Icono: User },
]

function Tab({ item }: { item: Item }) {
  const { to, label, Icono } = item
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[56px]',
          'text-[11px] font-medium transition-colors',
          isActive ? 'text-marca' : 'text-tinta/45 hover:text-tinta/70',
        ].join(' ')
      }
    >
      <Icono size={22} aria-hidden />
      <span>{label}</span>
    </NavLink>
  )
}

// Barra de navegación inferior fija con botón SOS central elevado (FAB rojo).
export default function BottomNav() {
  const navigate = useNavigate()
  return (
    <nav className="relative z-30 border-t border-borde bg-white safe-bottom">
      {/* FAB SOS central elevado */}
      <button
        onClick={() => navigate('/sos')}
        aria-label="Abrir SOS de emergencia"
        className="absolute left-1/2 -top-7 -translate-x-1/2 grid h-16 w-16 place-items-center
                   rounded-full bg-sos text-white shadow-marco ring-4 ring-white
                   transition-transform active:scale-95 hover:bg-sos-oscuro"
      >
        <Siren size={26} aria-hidden />
        <span className="absolute -bottom-4 text-[10px] font-bold text-sos">
          SOS
        </span>
      </button>

      <div className="flex items-stretch">
        {izquierda.map((it) => (
          <Tab key={it.to} item={it} />
        ))}
        {/* Hueco para el FAB */}
        <div className="w-16 shrink-0" aria-hidden />
        {derecha.map((it) => (
          <Tab key={it.to} item={it} />
        ))}
      </div>
    </nav>
  )
}
