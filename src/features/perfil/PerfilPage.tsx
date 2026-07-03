import { useNavigate } from 'react-router-dom'
import {
  CircleUserRound,
  FileText,
  Users,
  ShieldCheck,
  ChevronRight,
  Phone,
  Info,
  EyeOff,
  MapPinOff,
  UserX,
  TrendingUp,
  MapPinned,
  Award,
  Lock,
  Heart,
} from 'lucide-react'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Tarjeta from '../../components/Tarjeta'
import { useApp } from '../../context/AppContext'
import { NUMEROS_OFICIALES, AVISO_NO_REEMPLAZA } from '../../lib/numeros'
import { META_INCIDENTE, colorPorIntensidad } from '../../lib/incidentes'
import { enUltimaSemana } from '../../lib/format'

export default function PerfilPage() {
  const navigate = useNavigate()
  const { modo, reportes, contactos, crearCuenta } = useApp()

  // Estadísticas del usuario
  const misSemana = reportes.filter((r) => enUltimaSemana(r.fecha))
  const distritosUnicos = new Set(reportes.map((r) => r.distrito)).size
  const reportesAtendidos = reportes.filter((r) => r.estado === 'atendido').length

  // Tipo de incidente más reportado
  const conteoTipo = reportes.reduce<Record<string, number>>((acc, r) => {
    acc[r.tipo] = (acc[r.tipo] ?? 0) + 1
    return acc
  }, {})
  const tipoTop = Object.entries(conteoTipo).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="pb-8">
      <EncabezadoPagina titulo="Perfil" subtitulo="Tu cuenta y privacidad" />

      <div className="space-y-4 p-4">

        {/* ── Avatar + modo de sesión ── */}
        <Tarjeta className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-marca-suave text-marca">
                <CircleUserRound size={34} />
              </span>
              {modo === 'cuenta' && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-white"
                  style={{ backgroundColor: '#1FA971' }}
                >
                  <ShieldCheck size={11} color="white" />
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">
                {modo === 'anonimo' ? 'Usuario anónimo' : 'Cuenta activa'}
              </p>
              <p className="text-[12px] text-tinta/50">
                {modo === 'anonimo'
                  ? 'Sin datos personales guardados'
                  : 'Tus reportes siguen siendo anónimos'}
              </p>
            </div>
            {modo === 'anonimo' && (
              <button
                onClick={crearCuenta}
                className="rounded-lg bg-marca px-3 py-2 text-[12px] font-bold text-white"
              >
                Crear cuenta
              </button>
            )}
          </div>

          {/* Mini stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat
              Icono={TrendingUp}
              valor={String(reportes.length)}
              etiqueta="Reportes"
              color="#2E5BD7"
            />
            <MiniStat
              Icono={MapPinned}
              valor={String(distritosUnicos)}
              etiqueta="Distritos"
              color="#1FA971"
            />
            <MiniStat
              Icono={Users}
              valor={String(contactos.length)}
              etiqueta="Contactos"
              color="#F59E0B"
            />
          </div>
        </Tarjeta>

        {/* ── Mi contribución ── */}
        {reportes.length > 0 && (
          <Tarjeta className="p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Award size={16} className="text-marca" /> Mi contribución
            </h2>
            <div className="space-y-2">

              {/* Esta semana */}
              <div className="flex items-center justify-between rounded-xl bg-fondo px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-marca" />
                  <span className="text-[13px] text-tinta/70">Esta semana</span>
                </div>
                <span className="text-[13px] font-bold text-marca">
                  {misSemana.length} reportes
                </span>
              </div>

              {/* Atendidos */}
              <div className="flex items-center justify-between rounded-xl bg-fondo px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Heart size={14} style={{ color: '#1FA971' }} />
                  <span className="text-[13px] text-tinta/70">Reportes atendidos</span>
                </div>
                <span className="text-[13px] font-bold" style={{ color: '#1FA971' }}>
                  {reportesAtendidos}
                </span>
              </div>

              {/* Tipo más frecuente */}
              {tipoTop && (
                <div className="flex items-center justify-between rounded-xl bg-fondo px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const meta = META_INCIDENTE[tipoTop[0] as keyof typeof META_INCIDENTE]
                      const color = colorPorIntensidad(meta.peso)
                      return (
                        <>
                          <meta.Icono size={14} style={{ color }} />
                          <span className="text-[13px] text-tinta/70">Tipo más reportado</span>
                        </>
                      )
                    })()}
                  </div>
                  <span className="text-[13px] font-bold text-tinta/70">
                    {META_INCIDENTE[tipoTop[0] as keyof typeof META_INCIDENTE].label}
                  </span>
                </div>
              )}
            </div>
          </Tarjeta>
        )}

        {/* ── Menú de navegación ── */}
        <Tarjeta className="divide-y divide-borde overflow-hidden">
          <FilaMenu
            Icono={FileText}
            titulo="Mis reportes"
            valor={`${reportes.length}`}
            onClick={() => navigate('/estadisticas')}
          />
          <FilaMenu
            Icono={Users}
            titulo="Contactos de confianza"
            valor={`${contactos.length}`}
            onClick={() => navigate('/sos')}
          />
          <FilaMenu
            Icono={ShieldCheck}
            titulo="Configuración de privacidad"
            onClick={() => {
              document.getElementById('privacidad')?.scrollIntoView({ behavior: 'smooth' })
            }}
          />
        </Tarjeta>

        {/* ── Privacidad ── */}
        <Tarjeta id="privacidad" className="overflow-hidden">
          <div className="flex items-center gap-2 bg-marca px-4 py-3">
            <Lock size={15} className="shrink-0 text-white/80" />
            <p className="text-[13px] font-bold text-white">Tu privacidad está protegida</p>
          </div>
          <ul className="divide-y divide-borde">
            <ItemPrivacidad
              Icono={UserX}
              titulo="Anónimo por defecto"
              texto="No pedimos tu identidad para reportar."
            />
            <ItemPrivacidad
              Icono={MapPinOff}
              titulo="Ubicación ofuscada"
              texto="Mostramos zonas aproximadas, nunca tu punto exacto."
            />
            <ItemPrivacidad
              Icono={EyeOff}
              titulo="Sin datos de terceros"
              texto="Reportamos hechos y zonas, nunca personas."
            />
          </ul>
        </Tarjeta>

        {/* ── Sobre PasaLaVoz + números oficiales ── */}
        <Tarjeta className="p-4">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-bold">
            <Info size={16} className="text-marca" /> Sobre PasaLaVoz
          </h2>
          <p className="text-[13px] leading-relaxed text-tinta/70">
            PasaLaVoz es una herramienta comunitaria de prevención de la violencia y el acoso en
            espacios públicos de Lima. Trata los datos como un bien público.
          </p>

          <h3 className="mb-2 mt-4 text-[13px] font-bold text-tinta/80">Números oficiales</h3>
          <div className="grid gap-2">
            {NUMEROS_OFICIALES.map((n) => (
              <a
                key={n.numero}
                href={`tel:${n.numero}`}
                className="flex items-center gap-3 rounded-xl bg-fondo px-3 py-2.5 active:bg-borde"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-marca text-white">
                  <Phone size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">
                    {n.numero} · {n.nombre}
                  </p>
                  <p className="text-[12px] text-tinta/55">{n.descripcion}</p>
                </div>
                <ChevronRight size={18} className="text-tinta/30" />
              </a>
            ))}
          </div>
        </Tarjeta>

        {/* ── Aviso legal ── */}
        <div className="rounded-xl bg-marca-suave px-4 py-3 text-center text-[13px] font-semibold text-marca-oscuro">
          {AVISO_NO_REEMPLAZA}
        </div>

        <p className="text-center text-[11px] text-tinta/35">
          PasaLaVoz · prototipo hackathon · v0.1
        </p>
      </div>
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────
function MiniStat({
  Icono,
  valor,
  etiqueta,
  color,
}: {
  Icono: typeof TrendingUp
  valor: string
  etiqueta: string
  color: string
}) {
  return (
    <div
      className="flex flex-col items-center gap-0.5 rounded-xl py-2.5 text-center"
      style={{ backgroundColor: `${color}12` }}
    >
      <Icono size={15} style={{ color }} />
      <span className="text-base font-extrabold" style={{ color }}>
        {valor}
      </span>
      <span className="text-[10px] text-tinta/50">{etiqueta}</span>
    </div>
  )
}

function FilaMenu({
  Icono,
  titulo,
  valor,
  onClick,
}: {
  Icono: typeof FileText
  titulo: string
  valor?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-fondo"
    >
      <Icono size={20} className="text-marca" />
      <span className="flex-1 text-sm font-semibold">{titulo}</span>
      {valor !== undefined && (
        <span className="text-[13px] font-bold text-tinta/40">{valor}</span>
      )}
      <ChevronRight size={18} className="text-tinta/30" />
    </button>
  )
}

function ItemPrivacidad({
  Icono,
  titulo,
  texto,
}: {
  Icono: typeof UserX
  titulo: string
  texto: string
}) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: '#E6F6EF' }}
      >
        <Icono size={14} style={{ color: '#1FA971' }} />
      </span>
      <div>
        <p className="text-[13px] font-semibold text-tinta/80">{titulo}</p>
        <p className="text-[12px] leading-snug text-tinta/50">{texto}</p>
      </div>
    </li>
  )
}
