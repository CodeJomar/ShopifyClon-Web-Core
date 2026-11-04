"use client"

import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { RutaForm } from "../components/ruta-form"

export function RutaNuevaView() {
  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Nueva ruta" descripcion="Elige el día, el chofer y los envíos en el orden en que se visitarán." />
      <RutaForm />
    </div>
  )
}
