import Link from "next/link"
import { Store } from "lucide-react"

import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { Button } from "@/shared/components/ui/button"

export default function VitrinaNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-isla text-center">
        <EstadoVacio
          titulo="Esta tienda no está disponible"
          descripcion="La tienda o el producto que buscas no existe o no se encuentra operativo en este momento."
          icono={Store}
        />
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/">
            <Button variant="outline" size="sm">
              Ir al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
