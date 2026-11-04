"use client"

import * as React from "react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import type { RutaDetalle } from "@/dtos/ruta"
import type { ErrorApi } from "@/lib/api/error-api"
import { rutaAction } from "../actions/rutas.actions"
import { RutaForm } from "../components/ruta-form"

/** Editar una ruta en borrador. Si ya salió (en curso o finalizada) ya no se puede cambiar. */
export function RutaEditarView({ id }: { id: string }) {
  const [ruta, setRuta] = React.useState<RutaDetalle | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  React.useEffect(() => {
    let cancelado = false
    rutaAction(id).then((res) => {
      if (cancelado) return
      if (res.ok) setRuta(res.datos)
      else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [id])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No pudimos abrir la ruta</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }
  if (!ruta) return <Skeleton className="h-96 rounded-xl" aria-busy="true" aria-label="Cargando la ruta" />

  if (ruta.estado !== "BORRADOR") {
    return (
      <Alert>
        <AlertTitle>Esta ruta ya no se puede editar</AlertTitle>
        <AlertDescription>
          Solo las rutas en borrador cambian de chofer o de paradas.{" "}
          <Link href={`/panel/rutas/${ruta.id}`} className="font-bold text-brand-text hover:underline">Volver al detalle</Link>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo={`Editar ${ruta.codigo}`} descripcion="Cambia el chofer, la placa o las paradas mientras la ruta siga en borrador." />
      <RutaForm inicial={ruta} />
    </div>
  )
}
