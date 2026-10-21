"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Mail, MapPin, Receipt, Store } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { cerrarSesionAction } from "@/modules/auth"
import { PerfilForm } from "../components/perfil-form"
import { ContrasenaForm } from "../components/contrasena-form"
import { perfilCuentaAction } from "../actions/cuenta.actions"
import type { PerfilCuentaDto } from "@/dtos/cuenta"
import type { ErrorApi } from "@/lib/api/error-api"

export function CuentaView() {
  const router = useRouter()
  const [perfil, setPerfil] = React.useState<PerfilCuentaDto | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [cerrando, setCerrando] = React.useState(false)

  React.useEffect(() => {
    let cancelado = false
    perfilCuentaAction().then((res) => {
      if (cancelado) return
      if (res.ok) setPerfil(res.datos)
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
    <div className="space-y-6">
      <div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">
          {perfil ? `Hola, ${perfil.nombres}` : "Mi cuenta"}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Tus datos, tu seguridad y tus compras.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar tu cuenta</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!perfil && !error && (
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          Cargando tus datos…
        </p>
      )}

      {perfil && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Mi perfil</CardTitle>
              <CardDescription>Así te verán las tiendas donde compras.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FloatingInput
                label="Correo electrónico"
                leftIcon={<Mail className="size-4" aria-hidden="true" />}
                value={perfil.correo_electronico}
                readOnly
                copiable
                ayuda="El correo no se puede cambiar."
              />
              <PerfilForm perfil={perfil} onGuardado={setPerfil} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Cambia tu contraseña cuando lo necesites.</CardDescription>
            </CardHeader>
            <CardContent>
              <ContrasenaForm />
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Accesos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button variant="neutral" className="justify-start" onClick={() => router.push("/cuenta/direcciones")}>
            <MapPin aria-hidden="true" />
            Mis direcciones
          </Button>
          <Button variant="neutral" className="justify-start" onClick={() => router.push("/cuenta/ordenes")}>
            <Receipt aria-hidden="true" />
            Mis órdenes
          </Button>
          <Button variant="neutral" className="justify-start" onClick={() => router.push("/cuenta/tiendas")}>
            <Store aria-hidden="true" />
            Mis tiendas
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="danger-outline" onClick={cerrarSesion} loading={cerrando}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
