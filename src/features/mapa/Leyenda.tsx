// Leyenda de colores del mapa (riesgo + puntos seguros).
export default function Leyenda() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-xl bg-white/95 px-3 py-2 text-[11px] shadow-suave backdrop-blur">
      <p className="mb-1 font-bold text-tinta/70">Leyenda</p>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="h-2.5 w-12 rounded-full bg-gradient-to-r from-riesgo-bajo via-riesgo-medio to-riesgo-alto" />
        <span className="text-tinta/60">Riesgo: bajo → alto</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full border-2 border-white bg-seguro shadow" />
        <span className="text-tinta/60">Punto seguro</span>
      </div>
    </div>
  )
}
