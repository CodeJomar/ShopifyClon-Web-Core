import { FileText, Grid2X2, LayoutDashboard, ReceiptText, Refrigerator, ShieldCheck, Tag, Users, UtensilsCrossed, type LucideIcon } from "lucide-react"

// Mismos íconos que la barra lateral para reconocer cada módulo (nombres de módulo de la API)
const MODULO_ICONOS: Record<string, LucideIcon> = {
  DASHBOARD: LayoutDashboard,
  ORDERS: ReceiptText,
  KDS: Refrigerator,
  MENU: UtensilsCrossed,
  USERS: Users,
  ROLES: ShieldCheck,
  TABLES: Grid2X2,
  TRANSACTIONS: FileText,
}

/** Ícono de un módulo como objeto: se usa en JSX como `<config.icon />` sin crear un componente al renderizar. */
export const getModuloConfig = (modulo: string): { icon: LucideIcon } => ({ icon: MODULO_ICONOS[modulo] ?? Tag })
