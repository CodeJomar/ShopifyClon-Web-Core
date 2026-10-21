"use client"

import * as React from "react"
import { Mail, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Switch } from "@/shared/components/ui/switch"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { useMounted } from "@/shared/hooks/use-mounted"
import { DireccionesView } from "./direcciones-view"
import { OrdenesView } from "./ordenes-view"
import { MisTiendasView } from "@/modules/tienda/views/mis-tiendas-view"
import { PerfilForm } from "../components/perfil-form"
import { ContrasenaForm } from "../components/contrasena-form"
import { perfilCuentaAction } from "../actions/cuenta.actions"
import type { PerfilCuentaDto } from "@/dtos/cuenta"
import type { ErrorApi } from "@/lib/api/error-api"

/**
 * "Mi cuenta" en una sola pantalla, en orden: datos personales, seguridad, preferencias (tema), mis tiendas,
 * direcciones y mis compras. Cada bloque tiene un ancla (#tiendas, #direcciones, #compras).
 */
export function CuentaView() {
  const [perfil, setPerfil] = React.useState<PerfilCuentaDto | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const { theme, setTheme } = useTheme()
  const montado = useMounted()
  const oscuro = montado && theme === "dark"

  // Enlaces como /cuenta#tiendas: el contenido carga después, así que se desplaza cuando ya hay datos
  React.useEffect(() => {
    const ancla = window.location.hash
    if (!ancla) return
    const t = setTimeout(() => document.querySelector(ancla)?.scrollIntoView({ behavior: "smooth" }), 700)
    return () => clearTimeout(t)
  }, [])

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

  return (
    <div className="max-w-5xl space-y-8">
      <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Mi cuenta</h1>

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

      <div className="grid items-start gap-6 lg:grid-cols-2">
      {perfil && (
        <Card>
          <CardHeader>
            <CardTitle>Datos personales</CardTitle>
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
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>Cambia tu contraseña cuando lo necesites.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContrasenaForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
            <CardDescription>Cómo quieres ver OTemu en este dispositivo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="tema-oscuro" className="flex items-center gap-2 text-[13.5px] font-bold text-foreground">
                {oscuro ? <Moon aria-hidden="true" className="size-4 text-muted-foreground" /> : <Sun aria-hidden="true" className="size-4 text-muted-foreground" />}
                Tema oscuro
              </label>
              <Switch id="tema-oscuro" checked={oscuro} onCheckedChange={(marcado) => setTheme(marcado ? "dark" : "light")} />
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      <section id="tiendas" className="scroll-mt-6">
        <MisTiendasView embebido />
      </section>
      <section id="direcciones" className="scroll-mt-6">
        <DireccionesView embebido />
      </section>
      <section id="compras" className="scroll-mt-6">
        <OrdenesView embebido />
      </section>
    </div>
  )
}
