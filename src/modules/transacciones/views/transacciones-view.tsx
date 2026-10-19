"use client"

import { useCan } from "@/modules/auth"
import { ACCION, MODULO } from "@/shared/constants/permisos"
import { SeccionCajas } from "../components/seccion-cajas"
import { SeccionHistorialPedidos } from "../components/seccion-historial-pedidos"

export type PestanaTransacciones = "cajas" | "historial"

interface TransaccionesViewProps {
  pestanaPorDefecto?: PestanaTransacciones
}

/** Cada ruta muestra una sola sección: /transacciones/cajas (turno de caja) o /transacciones/pedidos (historial). */
export function TransaccionesView({ pestanaPorDefecto = "cajas" }: TransaccionesViewProps) {
  const { puede } = useCan()

  // Todas las vistas se ajustan al alto disponible (sin scroll en ningún dispositivo)
  return (
    <div data-sin-desborde className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      {pestanaPorDefecto === "cajas" ? (
        <SeccionCajas
          puedeAbrirCerrar={puede({ modulo: MODULO.TRANSACTIONS, accion: ACCION.ARQUEAR })}
          puedeMover={puede({ modulo: MODULO.TRANSACTIONS, accion: ACCION.CREAR })}
        />
      ) : (
        <SeccionHistorialPedidos
          puedeDevolver={puede({ modulo: MODULO.TRANSACTIONS, accion: ACCION.DEVOLVER })}
          puedeAnular={puede({ modulo: MODULO.ORDERS, accion: ACCION.ANULAR })}
        />
      )}
    </div>
  )
}
