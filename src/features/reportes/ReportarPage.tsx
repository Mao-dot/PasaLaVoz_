import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  ShieldCheck,
  Camera,
  LocateFixed,
  LoaderCircle,
  CheckCircle2,
  Info,
  ImageOff,
} from 'lucide-react'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Boton from '../../components/Boton'
import Tarjeta from '../../components/Tarjeta'
import SafetyBanner from '../../components/SafetyBanner'
import SelectorUbicacionMapa from './SelectorUbicacionMapa'
import { useApp } from '../../context/AppContext'
import { distritos } from '../../data/distritos'
import type {
  SubtipoIncidente,
  TipoIncidente,
} from '../../data/types'
import {
  SUBTIPOS_POR_INCIDENTE,
  etiquetaSubtipo,
} from '../../data/subtipos'
import {
  META_INCIDENTE,
  TIPOS_INCIDENTE,
  colorPorIntensidad,
} from '../../lib/incidentes'
import { distanciaMetros, ofuscarCoordenada, ofuscarUbicacion, jitter } from '../../lib/geo'

type MomentoIncidente = 'ahora' | 'hace_15' | 'personalizado'
type FuenteUbicacion = 'gps' | 'mapa' |'distrito'

interface UbicacionAproximada {
  lat: number
  lng: number

  /**
   * Precisión que indicó el dispositivo al obtener la ubicación,
   * expresada aproximadamente en metros.
   */
  precisionOriginalMetros: number

  /**
   * Radio máximo de privacidad aplicado por PasaLaVoz.
   */
  radioPrivacidadMetros: number
}
// Convierte una fecha al formato requerido por <input type="datetime-local">.
function fechaHoraLocal(fecha: Date = new Date()): string {
  const copia = new Date(fecha)
  copia.setMinutes(copia.getMinutes() - copia.getTimezoneOffset())
  return copia.toISOString().slice(0, 16)
}

function ahoraLocal(): string {
  return fechaHoraLocal(new Date())
}

function haceMinutosLocal(minutos: number): string {
  return fechaHoraLocal(new Date(Date.now() - minutos * 60_000))
}
function encontrarDistritoMasCercano(
  lat: number,
  lng: number,
) {
  const puntoUsuario: [number, number] = [lat, lng]

  return distritos.reduce((masCercano, actual) => {
    const distanciaActual = distanciaMetros(
      puntoUsuario,
      [actual.lat, actual.lng],
    )

    const distanciaMejor = distanciaMetros(
      puntoUsuario,
      [masCercano.lat, masCercano.lng],
    )

    return distanciaActual < distanciaMejor
      ? actual
      : masCercano
  })
}
export default function ReportarPage() {
  const navigate = useNavigate()
  const { agregarReporte } = useApp()

  const [tipo, setTipo] = useState<TipoIncidente | null>(null)
  const [subtipo, setSubtipo] = useState<SubtipoIncidente | null>(null)
  const [distritoId, setDistritoId] = useState(distritos[0].id)
  const [fuenteUbicacion, setFuenteUbicacion] =
  useState<FuenteUbicacion>('distrito')

  const [ubicacionGps, setUbicacionGps] =
  useState<UbicacionAproximada | null>(null)
  const [ubicacionMapa, setUbicacionMapa] =
  useState<{
    lat: number
    lng: number
  } | null>(null)

  const [obteniendoUbicacion, setObteniendoUbicacion] =
  useState(false)

  const [mensajeUbicacion, setMensajeUbicacion] =
  useState<string | null>(null)

  const [momento, setMomento] = useState<MomentoIncidente>('ahora')
  const [cuando, setCuando] = useState(ahoraLocal())

  const [descripcion, setDescripcion] = useState('')
  const [conFoto, setConFoto] = useState(false)
  const [anonimo, setAnonimo] = useState(true)

  const [error, setError] = useState<string | null>(null)

  const [enviado, setEnviado] = useState<{
    tipo: TipoIncidente
    subtipo: SubtipoIncidente
    distrito: string
  } | null>(null)

  const distrito = distritos.find((d) => d.id === distritoId)!

  const seleccionarMomento = (nuevoMomento: MomentoIncidente) => {
    setMomento(nuevoMomento)
    setError(null)

    if (nuevoMomento === 'ahora') {
      setCuando(ahoraLocal())
    }

    if (nuevoMomento === 'hace_15') {
      setCuando(haceMinutosLocal(15))
    }
  }
  const usarMiUbicacion = () => {
  setMensajeUbicacion(null)
  if (!('geolocation' in navigator)) {
    setMensajeUbicacion(
      'Este dispositivo o navegador no permite obtener la ubicación.',
    )
    return
  }

  setObteniendoUbicacion(true)

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      const {
        latitude,
        longitude,
        accuracy,
      } = posicion.coords
      if (accuracy > 1000) {
        setObteniendoUbicacion(false)
        setUbicacionGps(null)
        setFuenteUbicacion('distrito')

        setMensajeUbicacion(
          `La ubicación obtenida es demasiado imprecisa (±${Math.round(
            accuracy,
          )} m). Intenta nuevamente o selecciona el distrito manualmente.`,
        )

        return
      }
      /*
       * Importante:
       * la coordenada exacta solo existe temporalmente dentro
       * de este callback. No la guardamos en el estado del formulario.
       */
      const aproximada = ofuscarUbicacion(
        latitude,
        longitude,
        30,
        80,
      )

      const distritoCercano = encontrarDistritoMasCercano(
        latitude,
        longitude,
      )

      setUbicacionGps({
        lat: aproximada.lat,
        lng: aproximada.lng,
        precisionOriginalMetros: Math.round(accuracy),
        radioPrivacidadMetros: 80,
      })

      setUbicacionMapa(null)
      setDistritoId(distritoCercano.id)
      setFuenteUbicacion('gps')
      setObteniendoUbicacion(false)

      if (accuracy <= 100) {
        setMensajeUbicacion(
          'Ubicación obtenida con buena precisión y protegida antes de guardarla.',
        )
      } else if (accuracy <= 500) {
        setMensajeUbicacion(
          `Ubicación obtenida. El dispositivo estima una precisión de ±${Math.round(
            accuracy,
          )} m.`,
        )
      } else {
        setMensajeUbicacion(
          `La ubicación fue obtenida, pero su precisión es baja: aproximadamente ±${Math.round(
            accuracy,
          )} m. Puedes reintentar para mejorarla.`,
        )
      }
    },

    (errorGps) => {
      setObteniendoUbicacion(false)
      setUbicacionGps(null)
      setFuenteUbicacion('distrito')

      switch (errorGps.code) {
        case errorGps.PERMISSION_DENIED:
          setMensajeUbicacion(
            'No se concedió permiso para acceder a la ubicación. Puedes elegir el distrito manualmente.',
          )
          break

        case errorGps.POSITION_UNAVAILABLE:
          setMensajeUbicacion(
            'No fue posible determinar tu ubicación en este momento.',
          )
          break

        case errorGps.TIMEOUT:
          setMensajeUbicacion(
            'La ubicación tardó demasiado en responder. Puedes intentarlo nuevamente.',
          )
          break

        default:
          setMensajeUbicacion(
            'Ocurrió un problema inesperado al obtener la ubicación.',
          )
      }
    },

    {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 60_000,
    },
  )
  }
  const seleccionarPuntoMapa = (punto: {
    lat: number
    lng: number
  }) => {
    setUbicacionMapa(punto)
    setFuenteUbicacion('mapa')
    setUbicacionGps(null)
    setMensajeUbicacion(null)

    const distritoCercano = encontrarDistritoMasCercano(
      punto.lat,
      punto.lng,
    )

    setDistritoId(distritoCercano.id)
  }

  const enviar = () => {
  setError(null)

  if (!tipo) {
    setError('Elige un tipo de incidente antes de enviar el reporte.')
    return
  }

  if (!subtipo) {
    setError('Elige la opción que mejor describa el incidente.')
    return
  }

  if (subtipo === 'otro_incidente' && !descripcion.trim()) {
    setError(
      'Describe brevemente qué ocurrió cuando eliges "Otro incidente".',
    )
    return
  }

  let valorFecha: string

  if (momento === 'ahora') {
    valorFecha = ahoraLocal()
  } else if (momento === 'hace_15') {
    valorFecha = haceMinutosLocal(15)
  } else {
    valorFecha = cuando
  }

  const fecha = new Date(valorFecha)

  if (Number.isNaN(fecha.getTime())) {
    setError('Selecciona una fecha y hora válidas.')
    return
  }

  if (fecha.getTime() > Date.now()) {
    setError('La fecha del incidente no puede estar en el futuro.')
    return
  }

  // Si eligió "Marcar mapa", debe haber seleccionado un punto.
  if (
    fuenteUbicacion === 'mapa' &&
    !ubicacionMapa
  ) {
    setError(
      'Toca el mapa para señalar dónde ocurrió el incidente.',
    )
    return
  }

  let coordenadas: {
    lat: number
    lng: number
  }

  if (
    fuenteUbicacion === 'gps' &&
    ubicacionGps
  ) {
    coordenadas = {
      lat: ubicacionGps.lat,
      lng: ubicacionGps.lng,
    }
  } else if (
    fuenteUbicacion === 'mapa' &&
    ubicacionMapa
  ) {
    coordenadas = ofuscarUbicacion(
      ubicacionMapa.lat,
      ubicacionMapa.lng,
      30,
      80,
    )
  } else {
    coordenadas = {
      lat: ofuscarCoordenada(
        jitter(distrito.lat),
      ),
      lng: ofuscarCoordenada(
        jitter(distrito.lng),
      ),
    }
  }

  agregarReporte({
    tipo,
    subtipo,
    distrito: distrito.nombre,
    lat: coordenadas.lat,
    lng: coordenadas.lng,
    fecha: fecha.toISOString(),
    descripcion: descripcion.trim(),
    anonimo,
  })

  setEnviado({
    tipo,
    subtipo,
    distrito: distrito.nombre,
  })
}

  const reiniciar = () => {
    setTipo(null)
    setSubtipo(null)
    setDistritoId(distritos[0].id)

    setFuenteUbicacion('distrito')
    setUbicacionGps(null)
    setUbicacionMapa(null)
    setObteniendoUbicacion(false)
    setMensajeUbicacion(null)

    setMomento('ahora')
    setCuando(ahoraLocal())
    setDescripcion('')
    setConFoto(false)
    setAnonimo(true)
    setError(null)
    setEnviado(null)
  }

  const textoMomento =
    momento === 'ahora'
      ? 'Ahora'
      : momento === 'hace_15'
        ? 'Hace 15 minutos'
        : 'Fecha personalizada'

  if (enviado) {
    return (
      <Confirmacion
        resumen={enviado}
        onMapa={() => navigate('/mapa')}
        onOtro={reiniciar}
      />
    )
  }

  return (
    <div className="pb-8">
      <EncabezadoPagina
        titulo="Reportar incidente"
        subtitulo="Tu reporte ayuda a prevenir"
      />

      <div className="space-y-4 p-4">
        {/* Tipo de incidente */}
        <section>
          {/* Subcategoría dinámica */}
{tipo && (
  <section>
    <div className="mb-2">
      <p className="text-sm font-bold">
        Cuéntanos un poco más
      </p>

      <p className="mt-0.5 text-[12px] text-tinta/50">
        Elige la opción que mejor describa lo ocurrido.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-2">
      {SUBTIPOS_POR_INCIDENTE[tipo].map((opcion) => {
        const activo = subtipo === opcion.id

        return (
          <button
            key={opcion.id}
            type="button"
            onClick={() => {
              setSubtipo(opcion.id)
              setError(null)
            }}
            aria-pressed={activo}
            className={[
              'min-h-[52px] rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold transition-all',
              activo
                ? 'border-marca bg-marca-suave text-marca shadow-suave'
                : 'border-borde bg-white text-tinta/65 hover:border-marca/40',
            ].join(' ')}
          >
            {opcion.label}
          </button>
        )
      })}
    </div>
  </section>
)}
          <p className="mb-2 text-sm font-bold">
            ¿Qué ocurrió?
          </p>

          <div className="grid grid-cols-3 gap-2">
            {TIPOS_INCIDENTE.map((t) => {
              const { label, Icono, peso, nivel } = META_INCIDENTE[t]
              const activo = tipo === t
              const color = colorPorIntensidad(peso)

              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTipo(t)
                    setSubtipo(null)
                    setError(null)
                  }}
                  aria-pressed={activo}
                  style={
                    activo
                      ? {
                          borderColor: color,
                          backgroundColor: `${color}14`,
                        }
                      : undefined
                  }
                  className={[
                    'flex min-h-[92px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-2.5 text-center text-[12px] font-semibold transition-all',
                    activo
                      ? 'shadow-suave'
                      : 'border-borde bg-white text-tinta/70 hover:border-marca/40',
                  ].join(' ')}
                >
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full transition-colors"
                    style={{
                      backgroundColor: activo ? color : '#F1F3F9',
                    }}
                  >
                    <Icono
                      size={18}
                      color={activo ? '#fff' : '#697086'}
                    />
                  </span>

                  <span style={activo ? { color } : undefined}>
                    {label}
                  </span>

                  <span
                    className="text-[10px] font-medium leading-none"
                    style={{
                      color: activo ? color : '#9AA1B4',
                    }}
                  >
                    Riesgo {nivel.toLowerCase()}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Ubicación */}
        <section>
          <div className="mb-2">
            <p className="text-sm font-bold">
              ¿Dónde ocurrió?
            </p>

            <p className="mt-0.5 text-[12px] text-tinta/50">
              Usa una ubicación aproximada o selecciona el distrito manualmente.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
  <button
    type="button"
    onClick={usarMiUbicacion}
    disabled={obteniendoUbicacion}
    aria-pressed={fuenteUbicacion === 'gps'}
    className={[
      'flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center text-[11px] font-semibold transition-all',
      fuenteUbicacion === 'gps'
        ? 'border-marca bg-marca-suave text-marca shadow-suave'
        : 'border-borde bg-white text-tinta/65 hover:border-marca/40',
      obteniendoUbicacion
        ? 'cursor-wait opacity-70'
        : '',
    ].join(' ')}
  >
    {obteniendoUbicacion ? (
      <LoaderCircle
        size={18}
        className="animate-spin"
      />
    ) : (
      <LocateFixed size={18} />
    )}

    {obteniendoUbicacion
      ? 'Buscando...'
      : 'Mi ubicación'}
  </button>

  <button
    type="button"
    onClick={() => {
      setFuenteUbicacion('mapa')
      setUbicacionGps(null)
      setMensajeUbicacion(null)
    }}
    aria-pressed={fuenteUbicacion === 'mapa'}
    className={[
      'flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center text-[11px] font-semibold transition-all',
      fuenteUbicacion === 'mapa'
        ? 'border-marca bg-marca-suave text-marca shadow-suave'
        : 'border-borde bg-white text-tinta/65 hover:border-marca/40',
    ].join(' ')}
  >
    <MapPin size={18} />
    Marcar mapa
  </button>

  <button
    type="button"
    onClick={() => {
      setFuenteUbicacion('distrito')
      setUbicacionGps(null)
      setUbicacionMapa(null)
      setMensajeUbicacion(null)
    }}
    aria-pressed={fuenteUbicacion === 'distrito'}
    className={[
      'flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center text-[11px] font-semibold transition-all',
      fuenteUbicacion === 'distrito'
        ? 'border-marca bg-marca-suave text-marca shadow-suave'
        : 'border-borde bg-white text-tinta/65 hover:border-marca/40',
    ].join(' ')}
  >
    <MapPin size={18} />
    Distrito
  </button>
</div>
{fuenteUbicacion === 'mapa' && (
  <div className="mt-3 space-y-2">
    <SelectorUbicacionMapa
      centro={
        ubicacionMapa ?? {
          lat: distrito.lat,
          lng: distrito.lng,
        }
      }
      puntoSeleccionado={ubicacionMapa}
      onSeleccionar={seleccionarPuntoMapa}
    />

    <p className="flex items-start gap-1.5 rounded-lg bg-marca-suave/40 px-3 py-2 text-[12px] text-tinta/60">
      <ShieldCheck
        size={14}
        className="mt-0.5 shrink-0 text-seguro"
      />

      Puedes marcar el lugar exacto visualmente, pero esa coordenada
      no se guardará directamente. El reporte almacenará una versión
      desplazada entre 30 y 80 metros.
    </p>
  </div>
)}

          <Tarjeta className="mt-3 p-3">
  {fuenteUbicacion === 'gps' && ubicacionGps ? (
    <>
      <div className="flex items-center gap-2">
        <CheckCircle2
          size={18}
          className="shrink-0 text-seguro"
        />

        <div>
          <p className="text-sm font-bold">
            Ubicación aproximada lista
          </p>

          <p className="text-[12px] text-tinta/55">
            La posición exacta del dispositivo no se guardará.
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-seguro-suave px-3 py-2 text-[12px] text-tinta/65">
        <p>
          <span className="font-semibold">
            Distrito aproximado:
          </span>{' '}
          {distrito.nombre}
        </p>

        <p className="mt-1">
          <span className="font-semibold">
            Protección aplicada:
          </span>{' '}
          desplazamiento de 30 a 80 metros.
        </p>
      </div>
    </>
  ) : fuenteUbicacion === 'mapa' ? (
    <>
      <div className="flex items-center gap-2">
        <MapPin
          size={18}
          className={
            ubicacionMapa
              ? 'shrink-0 text-seguro'
              : 'shrink-0 text-marca'
          }
        />

        <div>
          <p className="text-sm font-bold">
            {ubicacionMapa
              ? 'Lugar del incidente seleccionado'
              : 'Selecciona el lugar en el mapa'}
          </p>

          <p className="text-[12px] text-tinta/55">
            {ubicacionMapa
              ? `Zona aproximada: ${distrito.nombre}`
              : 'Toca el mapa para señalar dónde ocurrió.'}
          </p>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="flex items-center gap-2">
        <MapPin
          size={18}
          className="shrink-0 text-marca"
        />

        <span className="text-sm font-semibold">
          Distrito:
        </span>

        <select
          value={distritoId}
          onChange={(e) => {
            setDistritoId(e.target.value)
            setFuenteUbicacion('distrito')
            setUbicacionGps(null)
            setUbicacionMapa(null)
          }}
          className="ml-auto rounded-lg border border-borde bg-fondo px-2 py-1.5 text-sm font-semibold focus:border-marca focus:outline-none"
          aria-label="Distrito donde ocurrió el incidente"
        >
          {distritos.map((d) => (
            <option
              key={d.id}
              value={d.id}
            >
              {d.nombre}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-2 flex items-start gap-1.5 text-[12px] text-tinta/55">
        <Info
          size={14}
          className="mt-0.5 shrink-0 text-marca"
        />

        El modo manual por distrito utiliza una ubicación genérica.
        Para mayor precisión, usa el GPS o marca el lugar en el mapa.
      </p>
    </>
  )}

  <p className="mt-3 flex items-start gap-1.5 border-t border-borde pt-3 text-[12px] text-tinta/55">
    <ShieldCheck
      size={14}
      className="mt-0.5 shrink-0 text-seguro"
    />

    PasaLaVoz no guarda directamente el punto exacto utilizado
    para generar el reporte.
  </p>
</Tarjeta>

          {mensajeUbicacion && (
            <p
              role="status"
              aria-live="polite"
              className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[12px] text-tinta/60"
            >
              {mensajeUbicacion}
            </p>
          )}
        </section>
        {/* Momento del incidente */}
        <section>
          <p className="mb-2 text-sm font-bold">
            ¿Cuándo ocurrió?
          </p>

          <div className="grid grid-cols-3 gap-2">
            <OpcionMomento
              activo={momento === 'ahora'}
              onClick={() => seleccionarMomento('ahora')}
            >
              Ahora
            </OpcionMomento>

            <OpcionMomento
              activo={momento === 'hace_15'}
              onClick={() => seleccionarMomento('hace_15')}
            >
              Hace 15 min
            </OpcionMomento>

            <OpcionMomento
              activo={momento === 'personalizado'}
              onClick={() => seleccionarMomento('personalizado')}
            >
              Otra fecha
            </OpcionMomento>
          </div>

          {momento === 'personalizado' && (
            <div className="mt-3">
              <label
                className="mb-2 block text-[12px] font-semibold text-tinta/60"
                htmlFor="cuando"
              >
                Selecciona la fecha y hora
              </label>

              <input
                id="cuando"
                type="datetime-local"
                value={cuando}
                max={ahoraLocal()}
                onChange={(e) => {
                  setCuando(e.target.value)
                  setError(null)
                }}
                className="w-full rounded-xl border border-borde bg-white px-3 py-3 text-sm focus:border-marca focus:outline-none"
              />
            </div>
          )}
        </section>

        {/* Descripción */}
        <section>
          <div className="mb-2 flex items-end justify-between">
            <label
              className="text-sm font-bold"
              htmlFor="desc"
            >
              Descripción corta{' '}
              <span className="font-normal text-tinta/50">
                (opcional)
              </span>
            </label>

            <span
              className={[
                'text-[11px] tabular-nums',
                descripcion.length >= 220
                  ? 'font-bold text-sos'
                  : 'text-tinta/40',
              ].join(' ')}
            >
              {descripcion.length}/240
            </span>
          </div>

          <textarea
            id="desc"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            maxLength={240}
            placeholder="Cuéntanos brevemente qué pasó…"
            className="w-full resize-none rounded-xl border border-borde bg-white px-3 py-3 text-sm focus:border-marca focus:outline-none"
          />

          <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-[12px] text-amber-700">
            <Info
              size={14}
              className="mt-0.5 shrink-0"
            />

            No incluyas nombres, teléfonos, placas ni otros datos personales.
            Reportamos hechos y zonas, no personas.
          </p>
        </section>

        {/* Foto simulada */}
        <section>
          <p className="mb-2 text-sm font-bold">
            Foto{' '}
            <span className="font-normal text-tinta/50">
              (opcional)
            </span>
          </p>

          {conFoto ? (
            <div className="overflow-hidden rounded-xl border border-borde">
              <div className="grid h-24 place-items-center bg-gradient-to-br from-marca-suave to-borde">
                <Camera
                  size={28}
                  className="text-marca/60"
                />
              </div>

              <div className="flex items-center justify-between bg-white p-2.5">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-tinta/70">
                  <CheckCircle2
                    size={15}
                    className="text-seguro"
                  />
                  Foto adjunta (simulada)
                </span>

                <button
                  type="button"
                  onClick={() => setConFoto(false)}
                  className="flex items-center gap-1 text-[13px] font-semibold text-sos"
                >
                  <ImageOff size={15} />
                  Quitar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConFoto(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-borde bg-white py-4 text-sm font-semibold text-tinta/55 hover:border-marca/40"
            >
              <Camera size={18} />
              Simular foto adjunta
            </button>
          )}

          <p className="mt-1.5 text-[11px] text-tinta/45">
            En esta versión del prototipo todavía no se carga ni almacena
            ningún archivo real.
          </p>
        </section>

        {/* Anonimato */}
        <button
          type="button"
          onClick={() => setAnonimo((valor) => !valor)}
          className="w-full text-left focus:outline-none"
          aria-pressed={anonimo}
        >
          <Tarjeta className="flex items-center justify-between p-3">
            <div className="pr-3">
              <p className="text-sm font-bold">
                Reportar de forma anónima
              </p>

              <p className="text-[12px] text-tinta/55">
                {anonimo
                  ? 'Tu reporte quedará marcado como anónimo.'
                  : 'Tu reporte quedará marcado como no anónimo.'}
              </p>
            </div>

            <Interruptor activo={anonimo} />
          </Tarjeta>
        </button>

        {/* Resumen previo */}
        {tipo && (
          <Tarjeta className="border border-marca/10 bg-marca-suave/30 p-3">

            <p className="text-[12px] font-bold uppercase tracking-wide text-marca">
              Antes de enviar
            </p>
            <div className="mt-2 space-y-1 text-[13px] text-tinta/70">
              <p>
                <span className="font-semibold">Incidente:</span>{' '}
                {META_INCIDENTE[tipo].label}
              </p>
              {subtipo && (
              <p>
              <span className="font-semibold">Detalle:</span>{' '}
              {etiquetaSubtipo(subtipo)}
              </p>
              )}
              <p>
                <span className="font-semibold">Zona:</span>{' '}
                {distrito.nombre}
              </p>
              <p>
                <span className="font-semibold">
                  Ubicación:
                </span>{' '}

                {fuenteUbicacion === 'gps' && ubicacionGps
                  ? 'GPS aproximado y protegido'
                  : fuenteUbicacion === 'mapa' && ubicacionMapa
                    ? 'Lugar marcado en mapa y protegido'
                    : 'Zona genérica del distrito'}
              </p>
              <p>
                <span className="font-semibold">Momento:</span>{' '}
                {textoMomento}
              </p>

              <p>
                <span className="font-semibold">Privacidad:</span>{' '}
                {anonimo ? 'Anónimo' : 'No anónimo'}
              </p>
            </div>
          </Tarjeta>
        )}

        {/* Error */}
        {error && (
          <p
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] font-medium text-sos"
          >
            <Info
              size={16}
              className="mt-0.5 shrink-0"
            />

            {error}
          </p>
        )}

        <Boton
          variante="primario"
          bloque
          onClick={enviar}
          className="mt-2"
        >
          Enviar reporte
        </Boton>

        {!tipo && (
          <p className="text-center text-[12px] text-tinta/45">
            Elige un tipo de incidente para continuar.
          </p>
        )}

        <SafetyBanner className="mt-1" />
      </div>
    </div>
  )
}

function OpcionMomento({
  activo,
  onClick,
  children,
}: {
  activo: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={[
        'min-h-12 rounded-xl border px-2 py-2 text-[12px] font-semibold transition-all',
        activo
          ? 'border-marca bg-marca-suave text-marca shadow-suave'
          : 'border-borde bg-white text-tinta/60 hover:border-marca/40',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function Interruptor({ activo }: { activo: boolean }) {
  return (
    <div
      role="switch"
      aria-checked={activo}
      className={[
        'flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full px-0.5 transition-colors',
        activo ? 'bg-seguro' : 'bg-borde',
      ].join(' ')}
    >
      <span
        className={[
          'h-6 w-6 rounded-full bg-white shadow transition-transform',
          activo ? 'translate-x-[20px]' : 'translate-x-0',
        ].join(' ')}
      />
    </div>
  )
}

function Confirmacion({
  resumen,
  onMapa,
  onOtro,
}: {
  resumen: {
    tipo: TipoIncidente
    subtipo: SubtipoIncidente
    distrito: string
  }
  onMapa: () => void
  onOtro: () => void
}) {
  const meta = META_INCIDENTE[resumen.tipo]
  const color = colorPorIntensidad(meta.peso)

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="pop-in grid h-20 w-20 place-items-center rounded-full bg-seguro-suave">
        <CheckCircle2
          size={48}
          className="text-seguro"
        />
      </div>

      <h1 className="mt-5 text-2xl font-extrabold">
        ¡Reporte enviado!
      </h1>

      <p className="mt-2 max-w-xs text-[15px] text-tinta/70">
        Tu reporte ayuda a prevenir y alertar a otras personas.
        Ya aparece en el mapa de tu comunidad.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          <meta.Icono size={14} />
          {meta.label}
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-tinta/70 shadow-suave">
          <MapPin
            size={14}
            className="text-marca"
          />
          {resumen.distrito}
        </span>
      </div>
      <p className="mt-3 text-[13px] font-semibold text-tinta/60">
        {etiquetaSubtipo(resumen.subtipo)}
      </p>

      <div className="mt-7 grid w-full max-w-xs gap-2">
        <Boton
          variante="primario"
          bloque
          onClick={onMapa}
        >
          Ver en el mapa
        </Boton>

        <Boton
          variante="secundario"
          bloque
          onClick={onOtro}
        >
          Hacer otro reporte
        </Boton>
      </div>

      <p className="mt-6 text-[12px] text-tinta/45">
        Prototipo: tu reporte queda solo en este dispositivo y no se envía
        a ningún servidor.
      </p>
    </div>
  )
}