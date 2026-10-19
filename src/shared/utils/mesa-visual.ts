import { Armchair, GlassWater, MapPin, Sun, type LucideIcon } from "lucide-react"

import type { EstadoMesa } from "@/dtos/mesas"

/** Texto sin tildes ni mayúsculas, para reconocer nombres que escribe el propietario ("Terraza", "TERRAZA"). */
const normalizar = (texto: string): string =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()

/** Colores de cada estado de mesa, en modo claro y oscuro. */
export const ESTADO_MESA_CONFIG: Record<
  EstadoMesa,
  { label: string; badge: string; border: string; bg: string; dot: string }
> = {
  libre: {
    label: "Libre",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
    border: "border-emerald-200 hover:border-emerald-400 dark:border-emerald-900/40 dark:hover:border-emerald-600",
    bg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
    dot: "bg-emerald-500",
  },
  ocupada: {
    label: "Ocupada",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
    border: "border-amber-200 hover:border-amber-400 dark:border-amber-900/40 dark:hover:border-amber-600",
    bg: "hover:bg-amber-50/50 dark:hover:bg-amber-950/20",
    dot: "bg-amber-500",
  },
  por_cobrar: {
    label: "Por cobrar",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300",
    border: "border-purple-200 hover:border-purple-400 dark:border-purple-900/40 dark:hover:border-purple-600",
    bg: "hover:bg-purple-50/50 dark:hover:bg-purple-950/20",
    dot: "bg-purple-500",
  },
  por_limpiar: {
    label: "Por limpiar",
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
    border: "border-sky-200 hover:border-sky-400 dark:border-sky-900/40 dark:hover:border-sky-600",
    bg: "hover:bg-sky-50/50 dark:hover:bg-sky-950/20",
    dot: "bg-sky-500",
  },
}

// Ícono por área conocida; las áreas que crea el propietario usan uno genérico.
const AREA_MESA_ICONS: Record<string, LucideIcon> = {
  salon: Armchair,
  terraza: Sun,
  barra: GlassWater,
}

export const getAreaIcon = (area: string): LucideIcon => AREA_MESA_ICONS[normalizar(area)] ?? MapPin

/** Igual que `getAreaIcon`, pero como objeto: se usa en JSX como `<config.icon />` sin crear un componente al renderizar. */
export const getAreaConfig = (area: string): { icon: LucideIcon } => ({ icon: getAreaIcon(area) })
