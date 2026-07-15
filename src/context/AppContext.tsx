import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Contacto, Reporte } from '../data/types'
import { reportesSemilla } from '../data/reportes'
import { contactosSemilla } from '../data/contactos'
import { crearRegistroUnico } from '../lib/guards'

// Estado global del prototipo. Todo vive en memoria (sin backend).
interface AppState {
  modo: 'anonimo' | 'cuenta'
  entrarAnonimo: () => void
  crearCuenta: () => void

  reportes: Reporte[]
  agregarReporte: (
    nuevo: Omit<Reporte, 'id' | 'estado' | 'confirmaciones' | 'esPropio'>,
  ) => Reporte
  eliminarReporte: (id: string) => void
  confirmarReporte: (id: string) => void
  misConfirmaciones: Set<string>

  contactos: Contacto[]
  agregarContacto: (contacto: Omit<Contacto, 'id'>) => void
  eliminarContacto: (id: string) => void
}

const AppContext = createContext<AppState | null>(null)

let _id = 1000
const nuevoId = (prefijo: string) => `${prefijo}${++_id}`

export function AppProvider({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<'anonimo' | 'cuenta'>('anonimo')
  const [reportes, setReportes] = useState<Reporte[]>(reportesSemilla)
  const [contactos, setContactos] = useState<Contacto[]>(contactosSemilla)
  const confirmacionesProcesadas = useRef(crearRegistroUnico())
  const [misConfirmaciones, setMisConfirmaciones] = useState<Set<string>>(new Set())

  const entrarAnonimo = useCallback(() => setModo('anonimo'), [])
  const crearCuenta = useCallback(() => setModo('cuenta'), [])

  const agregarReporte = useCallback(
    (nuevo: Omit<Reporte, 'id' | 'estado' | 'confirmaciones' | 'esPropio'>) => {
      const reporte: Reporte = {
        ...nuevo,
        id: nuevoId('r'),
        estado: 'recibido',
        confirmaciones: 0,
        esPropio: true,
      }
      setReportes((prev) => [reporte, ...prev])
      return reporte
    },
    [],
  )

  const eliminarReporte = useCallback((id: string) => {
    setReportes((prev) => prev.filter((reporte) => reporte.id !== id))
  }, [])

  const confirmarReporte = useCallback((id: string) => {
    // Evita que dos taps ocurridos antes del siguiente render incrementen dos
    // veces la misma confirmación.
    if (!confirmacionesProcesadas.current.registrar(id)) return

    setMisConfirmaciones((prev) => new Set(prev).add(id))
    setReportes((prev) =>
      prev.map((reporte) =>
        reporte.id === id
          ? { ...reporte, confirmaciones: reporte.confirmaciones + 1 }
          : reporte,
      ),
    )
  }, [])

  const agregarContacto = useCallback((contacto: Omit<Contacto, 'id'>) => {
    setContactos((prev) => [...prev, { ...contacto, id: nuevoId('c') }])
  }, [])

  const eliminarContacto = useCallback((id: string) => {
    setContactos((prev) => prev.filter((contacto) => contacto.id !== id))
  }, [])

  const value = useMemo<AppState>(
    () => ({
      modo,
      entrarAnonimo,
      crearCuenta,
      reportes,
      agregarReporte,
      eliminarReporte,
      confirmarReporte,
      misConfirmaciones,
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
      eliminarReporte,
      confirmarReporte,
      misConfirmaciones,
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
