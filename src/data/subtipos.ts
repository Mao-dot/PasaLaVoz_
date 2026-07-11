import type { SubtipoIncidente, TipoIncidente } from './types'

export interface OpcionSubtipo {
  id: SubtipoIncidente
  label: string
}

export const SUBTIPOS_POR_INCIDENTE: Record<
  TipoIncidente,
  readonly OpcionSubtipo[]
> = {
  acoso: [
    {
      id: 'acoso_verbal',
      label: 'Acoso verbal',
    },
    {
      id: 'seguimiento_no_deseado',
      label: 'Seguimiento no deseado',
    },
    {
      id: 'tocamientos',
      label: 'Tocamientos',
    },
    {
      id: 'amenaza_hostigamiento',
      label: 'Amenaza u hostigamiento',
    },
  ],

  robo: [
    {
      id: 'arrebato_celular',
      label: 'Arrebato de celular',
    },
    {
      id: 'robo_pertenencias',
      label: 'Robo de pertenencias',
    },
    {
      id: 'robo_transporte',
      label: 'Robo en transporte público',
    },
    {
      id: 'intento_robo',
      label: 'Intento de robo',
    },
  ],

  persecucion: [
    {
      id: 'persecucion_pie',
      label: 'Persecución a pie',
    },
    {
      id: 'persecucion_vehiculo',
      label: 'Persecución en vehículo o moto',
    },
    {
      id: 'vigilancia_sospechosa',
      label: 'Vigilancia sospechosa persistente',
    },
    {
      id: 'otra_persecucion',
      label: 'Otra situación similar',
    },
  ],

  violencia: [
    {
      id: 'agresion_fisica',
      label: 'Agresión física',
    },
    {
      id: 'pelea_via_publica',
      label: 'Pelea en vía pública',
    },
    {
      id: 'amenaza',
      label: 'Amenaza',
    },
    {
      id: 'otra_violencia',
      label: 'Otro hecho violento',
    },
  ],

  zona_oscura: [
    {
      id: 'luminaria_apagada',
      label: 'Luminaria apagada',
    },
    {
      id: 'calle_sin_iluminacion',
      label: 'Calle sin iluminación',
    },
    {
      id: 'ruta_peatonal_oscura',
      label: 'Ruta peatonal oscura',
    },
    {
      id: 'otra_zona_oscura',
      label: 'Otro problema de iluminación',
    },
  ],

  otro: [
    {
      id: 'actividad_sospechosa',
      label: 'Actividad sospechosa',
    },
    {
      id: 'vandalismo',
      label: 'Vandalismo',
    },
    {
      id: 'peligro_via_publica',
      label: 'Peligro en vía pública',
    },
    {
      id: 'otro_incidente',
      label: 'Otro incidente',
    },
  ],
}

export function etiquetaSubtipo(subtipo: SubtipoIncidente): string {
  for (const opciones of Object.values(SUBTIPOS_POR_INCIDENTE)) {
    const opcion = opciones.find((actual) => actual.id === subtipo)

    if (opcion) {
      return opcion.label
    }
  }

  return subtipo
}