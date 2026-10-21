"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { cerrarSesionAction, perfilAction } from "@/modules/auth"
import type { PerfilDto } from "@/dtos/auth"
import type { ErrorApi } from "@/lib/api/error-api"

// Marcador mínimo de la cuenta (W-005 lo completa). Sin sesión, el cliente API ya lleva al login (401).
export function CuentaView() {
  const router = useRouter()
  const [usuario, setUsuario] = React.useState<PerfilDto | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [cerrando, setCerrando] = React.useState(false)

  React.useEffect(() => {
    let cancelado = false
    perfilAction().then((res) => {
      if (cancelado) return
      if (res.ok) setUsuario(res.datos)
      else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [])

  const cerrarSesion = async () => {
    setCerrando(true)
    await cerrarSesionAction()
    router.replace("/login")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{usuario ? `Hola, ${usuario.nombres}` : "Tu cuenta"}</CardTitle>
          <CardDescription>{usuario?.correo_electronico ?? "Cargando tus datos…"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>No pudimos cargar tu cuenta</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <Button variant="neutral" onClick={cerrarSesion} loading={cerrando} className="w-full">
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
