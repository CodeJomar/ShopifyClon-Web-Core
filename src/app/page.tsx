import { Store } from "lucide-react"

import { EstadoVacio } from "@/shared/components/composed/estado-vacio"

// Marcador provisional de la raíz: la vitrina y el panel llegan en W-014 y W-007.
export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <EstadoVacio titulo="OTemu" descripcion="En construcción." icono={Store} />
    </main>
  )
}
