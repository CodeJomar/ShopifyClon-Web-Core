import { CrearTiendaView } from "@/modules/tienda"

export const metadata = {
  title: "Crear tienda | OTemu",
  description: "Elige un plan y crea tu tienda en OTemu.",
}

export default function CrearTiendaPage() {
  return (
    <div className="max-w-4xl">
      <CrearTiendaView />
    </div>
  )
}
