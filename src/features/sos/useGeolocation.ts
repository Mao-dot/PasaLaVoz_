import { useCallback, useState } from 'react'

export type Coordenadas = {
  lat: number
  lng: number
  precision: number
}

export type EstadoGeo = 'inactivo' | 'buscando' | 'listo' | 'error'

interface UseGeolocationResult {
  coords: Coordenadas | null
  estado: EstadoGeo
  error: string | null
  solicitarUbicacion: () => void
}

/**
 * Hook que obtiene la ubicación real del dispositivo mediante
 * navigator.geolocation.getCurrentPosition().
 *
 * - Si el usuario concede el permiso: expone { lat, lng, precision }.
 * - Si lo rechaza o el navegador no lo soporta: expone un mensaje de
 *   error legible, sin romper el flujo del módulo SOS (el resto de la
 *   app sigue funcionando con normalidad).
 */
export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<Coordenadas | null>(null)
  const [estado, setEstado] = useState<EstadoGeo>('inactivo')
  const [error, setError] = useState<string | null>(null)

  const solicitarUbicacion = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setCoords(null)
      setEstado('error')
      setError('Este dispositivo no admite geolocalización.')
      return
    }

    setEstado('buscando')
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setCoords({
          lat: posicion.coords.latitude,
          lng: posicion.coords.longitude,
          precision: posicion.coords.accuracy,
        })
        setEstado('listo')
      },
      (err) => {
        setCoords(null)
        setEstado('error')
        if (err.code === err.PERMISSION_DENIED) {
          setError('No concediste permiso de ubicación. Puedes activarlo en los ajustes del navegador.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('No se pudo determinar tu ubicación en este momento.')
        } else if (err.code === err.TIMEOUT) {
          setError('La búsqueda de ubicación tardó demasiado. Intenta de nuevo.')
        } else {
          setError('No se pudo obtener la ubicación.')
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  }, [])

  return { coords, estado, error, solicitarUbicacion }
}
