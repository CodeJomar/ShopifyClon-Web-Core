import { CrearTiendaView } from "@/modules/tienda"

export const metadata = {
  title: "Crear tienda | OTemu",
  description: "Elige un plan y crea tu tienda en OTemu.",
}

export default function CrearTiendaPage() {
  return (
    <main className="min-h-screen bg-background p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <CrearTiendaView />
      </div>
    </main>
  )
}
