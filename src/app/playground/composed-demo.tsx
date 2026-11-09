"use client"

import * as React from "react"
import { Inbox } from "lucide-react"

import { EstadoError } from "@/shared/components/composed/estado-error"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { SearchInput } from "@/shared/components/composed/search-input"
import { SelectorUbicacion, VisorUbicacion, type Ubicacion } from "@/shared/components/composed/mapa-ubicacion"

/** Demostración de los componentes compuestos para formularios, búsqueda y estados de lista. */
export function ComposedDemo() {
  const [busqueda, setBusqueda] = React.useState("")
  const [punto, setPunto] = React.useState<Ubicacion | null>(null)

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 rounded-3xl border bg-card p-6 shadow-sm md:grid-cols-2">
        <FloatingTextarea label="Descripción" />
        <FloatingTextarea label="Motivo (con error)" state="error" defaultValue="Muy corto" />
        <FloatingTextarea label="Observaciones (éxito)" state="success" defaultValue="Todo en orden" />
        <FloatingTextarea label="Deshabilitado" disabled />
      </div>

      <div className="rounded-3xl border bg-card p-6 shadow-sm">
        <SearchInput value={busqueda} onValueChange={setBusqueda} placeholder="Buscar producto…" className="max-w-sm" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <SelectorUbicacion valor={punto} alCambiar={setPunto} />
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <VisorUbicacion valor={punto ?? { latitud: -12.0464, longitud: -77.0428 }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <EstadoError mensaje="No hay conexión con el servidor." onReintentar={() => undefined} />
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <EstadoVacio titulo="Sin pedidos" descripcion="Cuando se registren pedidos aparecerán aquí." icono={Inbox} accion={{ texto: "Limpiar filtros", onClick: () => undefined }} />
        </div>
      </div>
    </div>
  )
}
