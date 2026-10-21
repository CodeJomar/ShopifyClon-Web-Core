import { MisTiendasView } from "@/modules/tienda"

export const metadata = {
  title: "Mis tiendas | OTemu",
  description: "Elige con cuál tienda quieres trabajar.",
}

export default function MisTiendasPage() {
  return (
    <main className="min-h-screen bg-background p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <MisTiendasView />
      </div>
    </main>
  )
}
