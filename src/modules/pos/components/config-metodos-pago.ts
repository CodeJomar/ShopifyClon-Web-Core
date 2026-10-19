import { Banknote, CreditCard, Landmark, Smartphone, type LucideIcon } from "lucide-react"
import type { MetodoPago } from "@/dtos/caja"

/* -------------------------------------------------------------------------- */
/*                               Métodos de pago                               */
/* -------------------------------------------------------------------------- */

export const METODO_PAGO_ICONS: Record<MetodoPago, LucideIcon> = {
  efectivo: Banknote,
  tarjeta: CreditCard,
  yape: Smartphone,
  plin: Smartphone,
  transferencia: Landmark,
}

// Montos sugeridos para cobros en efectivo (billetes de uso común en soles)
export const BILLETES_SUGERIDOS = [10, 20, 50, 100, 200] as const
