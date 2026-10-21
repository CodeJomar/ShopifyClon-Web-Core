import { OrdenDetalleView } from "@/modules/cuenta"

export const metadata = {
  title: "Detalle de orden | OTemu",
  description: "Detalle de una compra en OTemu.",
}

export default async function OrdenDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <main className="min-h-screen bg-background p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <OrdenDetalleView id={id} />
      </div>
    </main>
  )
}
