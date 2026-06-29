import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Contacto, Reporte } from '../data/types'
import { reportesSemilla } from '../data/reportes'
import { contactosSemilla } from '../data/contactos'

// Estado global del prototipo. Todo vive en memoria (sin backend).
interface AppState {
  // Sesión
  modo: 'anonimo' | 'cuenta'
  entrarAnonimo: () => void
  crearCuenta: () => void

  // Reportes
  reportes: Reporte[]
  agregarReporte: (nuevo: Omit<Reporte, 'id' | 'estado'>) => Reporte

  // Contactos de confianza
  contactos: Contacto[]
  agregarContacto: (c: Omit<Contacto, 'id'>) => void
  eliminarContacto: (id: string) => void
}

const AppContext = createContext<AppState | null>(null)

let _id = 1000
const nuevoId = (prefijo: string) => `${prefijo}${++_id}`

export function AppProvider({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<'anonimo' | 'cuenta'>('anonimo')
  const [reportes, setReportes] = useState<Reporte[]>(reportesSemilla)
  const [contactos, setContactos] = useState<Contacto[]>(contactosSemilla)

  const entrarAnonimo = useCallback(() => setModo('anonimo'), [])
  const crearCuenta = useCallback(() => setModo('cuenta'), [])

  const agregarReporte = useCallback(
    (nuevo: Omit<Reporte, 'id' | 'estado'>) => {
      const reporte: Reporte = { ...nuevo, id: nuevoId('r'), estado: 'recibido' }
      setReportes((prev) => [reporte, ...prev])
      return reporte
    },
    [],
  )

  const agregarContacto = useCallback((c: Omit<Contacto, 'id'>) => {
    setContactos((prev) => [...prev, { ...c, id: nuevoId('c') }])
  }, [])

  const eliminarContacto = useCallback((id: string) => {
    setContactos((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const value = useMemo<AppState>(
    () => ({
      modo,
      entrarAnonimo,
      crearCuenta,
      reportes,
      agregarReporte,
      contactos,
      agregarContacto,
      eliminarContacto,
    }),
    [
      modo,
      entrarAnonimo,
      crearCuenta,
      reportes,
      agregarReporte,
      contactos,
      agregarContacto,
      eliminarContacto,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}
