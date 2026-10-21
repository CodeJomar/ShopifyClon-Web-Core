"use client"

import * as React from "react"
import { Mail, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Switch } from "@/shared/components/ui/switch"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { useMounted } from "@/shared/hooks/use-mounted"
import { PerfilForm } from "../components/perfil-form"
import { perfilCuentaAction } from "../actions/cuenta.actions"
import type { PerfilCuentaDto } from "@/dtos/cuenta"
import type { ErrorApi } from "@/lib/api/error-api"

/** Pestaña Perfil: datos personales y preferencias (tema claro/oscuro). El título y las pestañas las pone el layout. */
export function CuentaView() {
  const [perfil, setPerfil] = React.useState<PerfilCuentaDto | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const { theme, setTheme } = useTheme()
  const montado = useMounted()
  const oscuro = montado && theme === "dark"

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
    <div className="max-w-[720px] space-y-6">
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
  )
}
