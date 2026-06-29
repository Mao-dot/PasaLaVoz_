import { Phone } from 'lucide-react'

// Aviso fijo: la app no reemplaza a la policía / emergencias.
export default function SafetyBanner({ className = '' }: { className?: string }) {
  return (
    <div
      className={[
        'flex items-center gap-2 rounded-xl bg-marca-suave px-3 py-2 text-[12px] text-marca-oscuro',
        className,
      ].join(' ')}
    >
      <Phone size={15} className="shrink-0" />
      <span>
        Esta app <strong>no reemplaza</strong> a la policía. En una emergencia
        real, llama al <strong>105</strong>.
      </span>
    </div>
  )
}
