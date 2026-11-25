import Image from "next/image"
import { cn } from "@/shared/utils/cn"

/** Marca de OTemu (carrito con toldo) sobre su fondo verde. Cuadrada: el tamaño y el radio los pone quien la usa. */
export function MarcaOtemu({ className }: { className?: string }) {
  return <Image src="/logo-otemu.png" alt="" width={96} height={96} className={cn("shrink-0 rounded-xl object-cover", className)} />
}
