import { OrdenesView } from "@/modules/cuenta"

export const metadata = {
  title: "Mis órdenes | OTemu",
  description: "Compras que hiciste en OTemu.",
}

export default function OrdenesPage() {
  return (
    <main className="min-h-screen bg-background p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <OrdenesView />
      </div>
    </main>
  )
}
