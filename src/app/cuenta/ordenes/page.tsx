import { redirect } from "next/navigation"

// Las compras viven en «Mis pedidos»: un pedido reúne las órdenes de todas las tiendas.
export default function OrdenesPage() {
  redirect("/mis-pedidos")
}
