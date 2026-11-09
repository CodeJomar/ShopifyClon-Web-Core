import type { Metadata } from "next"
import { SeguimientoView } from "@/modules/rutas/views/seguimiento-view"

export const metadata: Metadata = { title: "Seguimiento de tu pedido · OTemu" }

export default async function Page({ searchParams }: { searchParams: Promise<{ guia?: string }> }) {
  const { guia } = await searchParams
  return <SeguimientoView guiaInicial={guia ?? ""} />
}
