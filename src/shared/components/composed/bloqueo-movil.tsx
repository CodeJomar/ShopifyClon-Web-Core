import { Coffee, MonitorSmartphone } from "lucide-react"

/**
 * Pantalla que reemplaza a toda la aplicación en un celular: Coffy Flow se opera desde una tablet o una computadora.
 * Se muestra solo por CSS (variante `pantalla-pequena`, ver globals.css), así que no depende de JavaScript ni parpadea
 * al cargar. Se monta una sola vez en el layout raíz.
 */
export function BloqueoMovil() {
  return (
    <div
      role="alert"
      className="fixed inset-0 z-[10000] hidden flex-col items-center justify-center gap-6 bg-white p-8 text-center pantalla-pequena:flex dark:bg-stone-950"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-[#4C0107] text-white shadow-sm">
        <Coffee size={30} strokeWidth={2.2} />
      </div>

      <div className="flex max-w-xs flex-col items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#EDE5E6] text-[#4C0107] dark:bg-stone-800 dark:text-[#E7B7BC]">
          <MonitorSmartphone size={24} />
        </span>
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-stone-100">
          Coffy Flow no está disponible en celular
        </h1>
        <p className="text-sm text-slate-500 dark:text-stone-400">
          El sistema está pensado para pantallas más grandes. Ábrelo desde una tablet, una laptop o una computadora para
          seguir trabajando.
        </p>
      </div>
    </div>
  )
}
