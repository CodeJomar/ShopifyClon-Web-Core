import { DireccionesView } from "@/modules/cuenta"

export const metadata = {
  title: "Mis direcciones | OTemu",
  description: "Direcciones de envío de tu cuenta.",
}

export default function DireccionesPage() {
  return (
    <main className="min-h-screen bg-background p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <DireccionesView />
      </div>
    </main>
  )
}
