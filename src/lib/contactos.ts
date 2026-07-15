/**
 * Validación deliberadamente flexible: acepta números locales e
 * internacionales, pero rechaza valores vacíos o imposibles de contactar.
 */
export function telefonoPareceValido(valor: string): boolean {
  const limpio = valor.trim()
  if (!limpio || !/^\+?[\d\s().-]+$/.test(limpio)) return false

  const digitos = limpio.replace(/\D/g, '')
  return digitos.length >= 7 && digitos.length <= 15
}
