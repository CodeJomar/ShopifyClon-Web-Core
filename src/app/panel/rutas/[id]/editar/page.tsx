import { RutaEditarView } from "@/modules/rutas/views/ruta-editar-view"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <RutaEditarView id={id} />
}
