import { ProductoDetalleView } from "@/modules/catalogo"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductoDetalleView id={id} />
}
