"use client"

import * as React from "react"
import type { PedidoListadoDto } from "@/dtos/pedidos"
import { aCentimos } from "@/shared/utils/dinero"
import { getPedidosDeMesa } from "../actions/pos.actions"

/* -------------------------------------------------------------------------- */
/*                              Pedidos de una mesa                            */
/* -------------------------------------------------------------------------- */

/** Pedidos de hoy de la mesa que todavía tienen saldo por cobrar. */
export function usePedidosPorCobrar(idMesa: string | null, refrescarCuando: string) {
  const [datos, setDatos] = React.useState<{ idMesa: string; pedidos: PedidoListadoDto[] } | null>(null)

  const cargar = React.useCallback(
    (id: string) =>
      getPedidosDeMesa(id).then((res) => {
        if (res.isOk()) setDatos({ idMesa: id, pedidos: res.data })
      }),
    [],
  )

  React.useEffect(() => {
    if (idMesa) void cargar(idMesa)
  }, [idMesa, refrescarCuando, cargar])

  const pedidos = React.useMemo(
    () =>
      datos && datos.idMesa === idMesa
        ? datos.pedidos.filter((p) => p.estado !== "anulado" && p.estado !== "pagado" && aCentimos(p.saldo_pendiente) > 0)
        : [],
    [datos, idMesa],
  )

  const recargar = React.useCallback(() => (idMesa ? cargar(idMesa) : Promise.resolve()), [idMesa, cargar])

  return { pedidos, recargar }
}
