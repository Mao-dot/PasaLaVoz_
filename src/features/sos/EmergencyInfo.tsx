import { MapPin, Clock, Calendar, ShieldAlert } from 'lucide-react'
import Tarjeta from '../../components/Tarjeta'
import type { Coordenadas } from './useGeolocation'

interface EmergencyInfoProps {
  coords: Coordenadas | null
  errorUbicacion: string | null
}

/**
 * Tarjeta con la información clave de la alerta activa:
 * - Ubicación real (lat/lng/precisión) o aviso elegante si no está disponible.
 * - Hora y fecha generadas automáticamente.
 * - Estado: "Alerta Activa".
 */
export default function EmergencyInfo({ coords, errorUbicacion }: EmergencyInfoProps) {
  const ahora = new Date()
  const fecha = ahora.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const hora = ahora.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Tarjeta className="entrar-item space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <ShieldAlert size={16} className="text-sos" /> Información de emergencia
        </h3>
        <span className="flex items-center gap-1.5 rounded-full bg-sos-suave px-2.5 py-1 text-[11px] font-bold text-sos">
          <span className="punto-vivo h-1.5 w-1.5 rounded-full bg-sos" aria-hidden />
          Alerta Activa
        </span>
      </div>

      <div className="grid gap-2 text-[13px]">
        <div className="flex items-start gap-2 rounded-xl bg-fondo px-3 py-2.5">
          <MapPin size={16} className="mt-0.5 shrink-0 text-marca" />
          {coords ? (
            <div className="min-w-0">
              <p className="font-semibold text-tinta">Ubicación</p>
              <p className="text-tinta/65">Latitud: {coords.lat.toFixed(5)}</p>
              <p className="text-tinta/65">Longitud: {coords.lng.toFixed(5)}</p>
              <p className="text-tinta/65">Precisión: ±{Math.round(coords.precision)} m</p>
            </div>
          ) : (
            <div className="min-w-0">
              <p className="font-semibold text-tinta">Ubicación</p>
              <p className="text-tinta/55">{errorUbicacion ?? 'Ubicación no disponible'}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-fondo px-3 py-2.5">
          <Clock size={16} className="shrink-0 text-marca" />
          <p>
            <span className="font-semibold text-tinta">Hora:</span>{' '}
            <span className="text-tinta/65">{hora}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-fondo px-3 py-2.5">
          <Calendar size={16} className="shrink-0 text-marca" />
          <p>
            <span className="font-semibold text-tinta">Fecha:</span>{' '}
            <span className="text-tinta/65">{fecha}</span>
          </p>
        </div>
      </div>
    </Tarjeta>
  )
}
