import { CrearTiendaView } from "@/modules/tienda"

export const metadata = {
  title: "Crear tienda | OTemu",
  description: "Elige un plan y crea tu tienda en OTemu.",
}

export default async function CrearTiendaPage({ searchParams }: { searchParams: Promise<{ plan?: string | string[] }> }) {
  const { plan } = await searchParams
  return (
    <div className="max-w-4xl">
      <CrearTiendaView planInicial={Array.isArray(plan) ? plan[0] : plan} />
    </div>
  )
}
