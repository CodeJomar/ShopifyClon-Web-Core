import { PedidoDetalleView } from "@/modules/mercado/views/pedido-detalle-view"

export const metadata = { title: "Pedido | OTemu" }

export default async function Pedido({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <PedidoDetalleView token={token} />
}
