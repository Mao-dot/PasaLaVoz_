import { describe, expect, it } from 'vitest'
import { crearBloqueoAccion, crearRegistroUnico } from './guards'
import { telefonoPareceValido } from './contactos'
import { validarFechaIncidente } from './reportes'

describe('guardas de acciones', () => {
  it('bloquea un segundo envío sincrónico y permite reintentar tras liberar', () => {
    const guardia = crearBloqueoAccion()
    expect(guardia.intentar()).toBe(true)
    expect(guardia.intentar()).toBe(false)
    guardia.liberar()
    expect(guardia.intentar()).toBe(true)
  })
  it('registra una confirmación solo una vez', () => {
    const registro = crearRegistroUnico()
    expect(registro.registrar('r1')).toBe(true)
    expect(registro.registrar('r1')).toBe(false)
    expect(registro.contiene('r1')).toBe(true)
  })
})

describe('validaciones de entrada', () => {
  it.each(['999 888 777', '+51 (1) 555-1234'])('acepta teléfono plausible %s', valor => expect(telefonoPareceValido(valor)).toBe(true))
  it.each(['', '123', 'llámame'])('rechaza teléfono inválido %s', valor => expect(telefonoPareceValido(valor)).toBe(false))
  it('rechaza fechas vacías, inválidas y futuras', () => {
    expect(validarFechaIncidente('').valida).toBe(false)
    expect(validarFechaIncidente('no-fecha').valida).toBe(false)
    expect(validarFechaIncidente('2026-01-02T00:00', Date.parse('2026-01-01')).valida).toBe(false)
  })
  it('acepta una fecha pasada', () => expect(validarFechaIncidente('2025-01-01T00:00', Date.parse('2026-01-01')).valida).toBe(true))
})
