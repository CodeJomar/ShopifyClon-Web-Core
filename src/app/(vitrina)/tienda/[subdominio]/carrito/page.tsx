import { CarritoView } from "@/modules/carrito"

export default async function CarritoPage({ params }: { params: Promise<{ subdominio: string }> }) {
  const { subdominio } = await params
  return <CarritoView subdominio={subdominio} />
}
