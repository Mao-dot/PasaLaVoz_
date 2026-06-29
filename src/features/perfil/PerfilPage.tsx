import { useNavigate } from 'react-router-dom'
import {
  UserCircle2,
  FileText,
  Users,
  ShieldCheck,
  ChevronRight,
  Phone,
  Info,
  EyeOff,
  MapPinOff,
  UserX,
} from 'lucide-react'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Tarjeta from '../../components/Tarjeta'
import { useApp } from '../../context/AppContext'
import { NUMEROS_OFICIALES, AVISO_NO_REEMPLAZA } from '../../lib/numeros'

export default function PerfilPage() {
  const navigate = useNavigate()
  const { modo, reportes, contactos, crearCuenta } = useApp()

  return (
    <div className="pb-8">
      <EncabezadoPagina titulo="Perfil" subtitulo="Tu cuenta y privacidad" />

      <div className="space-y-4 p-4">
        {/* Estado de sesión */}
        <Tarjeta className="flex items-center gap-3 p-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-marca-suave text-marca">
            <UserCircle2 size={30} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold">
              {modo === 'anonimo' ? 'Estás de forma anónima' : 'Cuenta creada'}
            </p>
            <p className="text-[12.5px] text-tinta/55">
              {modo === 'anonimo'
                ? 'No guardamos datos que te identifiquen.'
                : 'Tus reportes siguen siendo anónimos en el mapa.'}
            </p>
          </div>
          {modo === 'anonimo' && (
            <button
              onClick={crearCuenta}
              className="rounded-lg bg-marca px-3 py-2 text-[12.5px] font-bold text-white"
            >
              Crear cuenta
            </button>
          )}
        </Tarjeta>

        {/* Menú */}
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
              const el = document.getElementById('privacidad')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          />
        </Tarjeta>

        {/* Privacidad */}
        <Tarjeta id="privacidad" className="p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <ShieldCheck size={18} className="text-seguro" /> Tu privacidad
          </h2>
          <ul className="space-y-2.5 text-[13px] text-tinta/75">
            <ItemPrivacidad Icono={UserX} texto="Anónimo por defecto: no pedimos tu identidad." />
            <ItemPrivacidad Icono={MapPinOff} texto="Ubicación ofuscada: mostramos zonas, nunca tu punto exacto." />
            <ItemPrivacidad Icono={EyeOff} texto="Reportamos hechos y zonas, nunca a personas." />
          </ul>
        </Tarjeta>

        {/* Sobre PasaLaVoz + números oficiales */}
        <Tarjeta className="p-4">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-bold">
            <Info size={18} className="text-marca" /> Sobre PasaLaVoz
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
                className="flex items-center gap-3 rounded-xl bg-fondo px-3 py-2.5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-marca text-white">
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

        <div className="rounded-xl bg-marca-suave px-3 py-3 text-center text-[13px] font-semibold text-marca-oscuro">
          {AVISO_NO_REEMPLAZA}
        </div>

        <p className="text-center text-[11px] text-tinta/40">
          PasaLaVoz · prototipo para hackathon · v0.1
        </p>
      </div>
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
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-fondo"
    >
      <Icono size={20} className="text-marca" />
      <span className="flex-1 text-sm font-semibold">{titulo}</span>
      {valor && <span className="text-[13px] text-tinta/45">{valor}</span>}
      <ChevronRight size={18} className="text-tinta/30" />
    </button>
  )
}

function ItemPrivacidad({ Icono, texto }: { Icono: typeof UserX; texto: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icono size={16} className="mt-0.5 shrink-0 text-seguro" />
      <span>{texto}</span>
    </li>
  )
}
