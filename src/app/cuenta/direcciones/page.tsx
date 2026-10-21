import { DireccionesView } from "@/modules/cuenta"

export const metadata = {
  title: "Mis direcciones | OTemu",
  description: "Direcciones de envío de tu cuenta.",
}

export default function DireccionesPage() {
  return (
    <div className="max-w-4xl">
      <DireccionesView />
    </div>
  )
}
