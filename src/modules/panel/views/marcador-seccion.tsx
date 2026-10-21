"use client"

import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { Card, CardContent } from "@/shared/components/ui/card"

/** Marcador de una sección que llega en una tarea posterior (W-008…W-013). */
export function MarcadorSeccion({ titulo }: { titulo: string }) {
  return (
    <Card>
      <CardContent>
        <EstadoVacio titulo={titulo} descripcion="Esta sección llega pronto." />
      </CardContent>
    </Card>
  )
}
