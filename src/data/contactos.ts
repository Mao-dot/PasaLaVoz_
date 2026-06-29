import type { Contacto } from './types'

// Contactos de confianza (mock). En el prototipo no se les envía nada real.
export const contactosSemilla: Contacto[] = [
  { id: 'c1', nombre: 'Mamá', telefono: '+51 987 654 321', relacion: 'Familia' },
  { id: 'c2', nombre: 'Lucía (amiga)', telefono: '+51 912 345 678', relacion: 'Amistad' },
  { id: 'c3', nombre: 'Hermano', telefono: '+51 998 877 665', relacion: 'Familia' },
]
