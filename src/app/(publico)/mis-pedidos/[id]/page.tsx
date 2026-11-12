import { PedidoDetalleView } from "@/modules/mercado/views/pedido-detalle-view"

export const metadata = { title: "Pedido | OTemu" }

export default async function Pedido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PedidoDetalleView id={id} />
}
