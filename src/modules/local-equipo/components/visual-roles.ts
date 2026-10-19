import { ChefHat, ConciergeBell, Coffee, ShieldCheck, Tag, Wallet, type LucideIcon } from "lucide-react"
import { normalizarTexto } from "@/shared/utils/formatters"

/** Identidad visual de un cargo: ícono y colores. */
interface RolVisual {
  icon: LucideIcon
  className: string
}

const ROL_VISUALES: { clave: string; visual: RolVisual }[] = [
  {
    clave: "admin",
    visual: { icon: ShieldCheck, className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
  },
  {
    clave: "caj",
    visual: { icon: Wallet, className: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" },
  },
  {
    clave: "barist",
    visual: { icon: Coffee, className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" },
  },
  {
    clave: "mozo",
    visual: { icon: ConciergeBell, className: "bg-slate-100 text-slate-700 dark:bg-stone-800 dark:text-stone-200" },
  },
  {
    clave: "cocin",
    visual: { icon: ChefHat, className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
  },
]

const ROL_GENERICO: RolVisual = {
  icon: Tag,
  className: "bg-[#EDE5E6] text-[#4C0107] dark:bg-[#E7B7BC]/15 dark:text-[#E7B7BC]",
}

// Los cargos son dinámicos: se reconoce el tipo por el nombre y si no, se usa un estilo neutro
export function getRolVisual(nombre: string): RolVisual {
  const texto = normalizarTexto(nombre)
  return ROL_VISUALES.find((r) => texto.includes(r.clave))?.visual ?? ROL_GENERICO
}
