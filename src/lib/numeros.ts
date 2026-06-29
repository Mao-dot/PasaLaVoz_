// Números oficiales de emergencia en Perú. Se muestran siempre en la app.
// PasaLaVoz COMPLEMENTA, no reemplaza, a estas líneas.
export interface NumeroOficial {
  numero: string
  nombre: string
  descripcion: string
}

export const NUMEROS_OFICIALES: NumeroOficial[] = [
  { numero: '105', nombre: 'PNP', descripcion: 'Policía Nacional del Perú' },
  { numero: '100', nombre: 'Línea 100', descripcion: 'MIMP — violencia familiar y sexual' },
  { numero: '116', nombre: 'Bomberos', descripcion: 'Emergencias y rescate' },
]

export const AVISO_NO_REEMPLAZA =
  'PasaLaVoz complementa, no reemplaza, a las autoridades. En una emergencia real, llama al 105.'

export const AVISO_PROTOTIPO =
  'Este es un prototipo: no se envía ninguna alerta, ubicación ni dato real.'
