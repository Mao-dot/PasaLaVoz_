import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PhoneFrame from './components/PhoneFrame'
import AppLayout from './routes/AppLayout'
import OnboardingPage from './features/onboarding/OnboardingPage'
import MapaPage from './features/mapa/MapaPage'
import ReportarPage from './features/reportes/ReportarPage'
import SosPage from './features/sos/SosPage'
import EstadisticasPage from './features/panel/EstadisticasPage'
import PerfilPage from './features/perfil/PerfilPage'

// Rutas de PasaLaVoz. El onboarding va fuera del layout (sin bottom nav).
export default function App() {
  return (
    <BrowserRouter>
      <PhoneFrame>
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route element={<AppLayout />}>
            <Route path="/mapa" element={<MapaPage />} />
            <Route path="/reportar" element={<ReportarPage />} />
            <Route path="/sos" element={<SosPage />} />
            <Route path="/estadisticas" element={<EstadisticasPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PhoneFrame>
    </BrowserRouter>
  )
}
