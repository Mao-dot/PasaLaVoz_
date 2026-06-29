/** @type {import('tailwindcss').Config} */
// Paleta y tokens de PasaLaVoz. Para personalizar colores, edita aquí.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primario: confianza
        marca: {
          DEFAULT: '#2E5BD7',
          claro: '#5B7FE0',
          oscuro: '#1E3F9E',
          suave: '#EAF0FF',
        },
        // Emergencia / SOS (solo para SOS y alertas críticas)
        sos: {
          DEFAULT: '#E23B3B',
          oscuro: '#C32B2B',
          suave: '#FDECEC',
        },
        // Puntos seguros
        seguro: {
          DEFAULT: '#1FA971',
          suave: '#E6F6EF',
        },
        // Zonas de riesgo (ámbar → rojo)
        riesgo: {
          bajo: '#F59E0B',
          medio: '#F2772F',
          alto: '#E23B3B',
        },
        // Neutros
        fondo: '#F7F8FB',
        tinta: '#1A1A1A',
        borde: '#E5E8F0',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      maxWidth: {
        movil: '430px',
      },
      boxShadow: {
        marco: '0 20px 60px -15px rgba(20,30,70,0.35)',
        suave: '0 2px 10px -4px rgba(20,30,70,0.18)',
      },
    },
  },
  plugins: [],
}
