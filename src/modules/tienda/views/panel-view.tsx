"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { tiendaActivaAction } from "../actions/tienda.actions"
import type { TiendaActivaDto } from "@/dtos/tienda"
import type { ErrorApi } from "@/lib/api/error-api"

/** Marcador del panel (W-007 lo reemplaza). Sin tienda activa (SEG-001) manda a elegir una. */
export function PanelView() {
  const router = useRouter()
  const [tienda, setTienda] = React.useState<TiendaActivaDto | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  React.useEffect(() => {
    let cancelado = false
    tiendaActivaAction().then((res) => {
      if (cancelado) return
      if (res.ok) return setTienda(res.datos)
      // SEG-001: sin tienda activa (404) o no es miembro → elegir una.
      if (res.error.codigo === "SEG-001" || res.error.estado === 404) return router.replace("/cuenta/tiendas")
      setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{tienda ? tienda.nombre : "Panel"}</CardTitle>
          <CardDescription>{tienda ? `otemu.com/tienda/${tienda.subdominio}` : "Cargando tu tienda…"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>No pudimos cargar la tienda</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <p className="text-[13px] text-muted-foreground">El panel completo llega en la siguiente etapa.</p>
          <Button variant="neutral" className="w-full" onClick={() => router.push("/cuenta/tiendas")}>
            Cambiar de tienda
          </Button>
          <p className="text-center text-[13px]">
            <Link href="/cuenta" className="font-bold text-brand-text hover:underline">
              Mi cuenta
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
