import { MisTiendasView } from "@/modules/tienda"

export const metadata = {
  title: "Mis tiendas | OTemu",
  description: "Elige con cuál tienda quieres trabajar.",
}

export default function MisTiendasPage() {
  return (
    <div className="max-w-4xl">
      <MisTiendasView />
    </div>
  )
}
