import { RutaDetalleView } from "@/modules/rutas/views/ruta-detalle-view"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <RutaDetalleView id={id} />
}
