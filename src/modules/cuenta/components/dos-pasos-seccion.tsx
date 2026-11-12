"use client"

import * as React from "react"
import { ShieldCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Switch } from "@/shared/components/ui/switch"
import { toast } from "@/shared/components/ui/toast"
import { CampoContrasena } from "@/modules/auth/components/campo-contrasena"
import { cambiarDosPasosAction } from "../actions/cuenta.actions"
import type { PerfilCuentaDto } from "@/dtos/cuenta"
import type { ErrorApi } from "@/lib/api/error-api"

/**
 * Verificación en dos pasos (A-007): con ella activa, al iniciar sesión se pide además un código de 6 dígitos que se envía
 * al correo. Cambiarla pide la contraseña actual (USR-010 si no coincide) y responde con el perfil actualizado.
 */
export function DosPasosSeccion({ perfil, onCambio }: { perfil: PerfilCuentaDto; onCambio: (perfil: PerfilCuentaDto) => void }) {
  const activo = Boolean(perfil.dos_pasos_activo)
  // `pendiente` es el estado al que se quiere pasar; mientras exista, se muestra el campo de la contraseña.
  const [pendiente, setPendiente] = React.useState<boolean | null>(null)
  const [contrasena, setContrasena] = React.useState("")
  const [errorCampo, setErrorCampo] = React.useState<string | undefined>()
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [guardando, setGuardando] = React.useState(false)

  const cancelar = () => {
    setPendiente(null)
    setContrasena("")
    setErrorCampo(undefined)
    setError(null)
  }

  const confirmar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pendiente === null) return
    if (!contrasena) return setErrorCampo("Escribe tu contraseña actual.")
    setErrorCampo(undefined)
    setError(null)
    setGuardando(true)
    const res = await cambiarDosPasosAction({ activo: pendiente, contrasena_actual: contrasena })
    setGuardando(false)
    if (!res.ok) {
      if (res.error.codigo === "USR-010") return setErrorCampo(res.error.message)
      return setError(res.error)
    }
    onCambio(res.datos)
    toast.add({
      type: "success",
      title: pendiente ? "Verificación en dos pasos activada" : "Verificación en dos pasos desactivada",
      description: pendiente ? "Al iniciar sesión te pediremos un código que enviamos a tu correo." : undefined,
    })
    cancelar()
  }

  return (
    <section className="space-y-3" aria-labelledby="dos-pasos-titulo">
      <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Verificación en dos pasos</h2>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p id="dos-pasos-titulo" className="flex items-center gap-1.5 text-[13.5px] font-bold text-foreground">
            <ShieldCheck aria-hidden="true" className="size-4 text-brand-text" />
            {activo ? "Activada" : "Desactivada"}
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">Al iniciar sesión te pediremos además un código que enviamos a tu correo.</p>
        </div>
        <Switch
          checked={pendiente ?? activo}
          onCheckedChange={(marcado) => {
            setError(null)
            setErrorCampo(undefined)
            setContrasena("")
            setPendiente(marcado === activo ? null : marcado)
          }}
          aria-labelledby="dos-pasos-titulo"
        />
      </div>

      {pendiente !== null && (
        <form onSubmit={confirmar} noValidate className="space-y-3 rounded-xl border border-border/60 bg-secondary/50 p-4">
          <p className="text-[12.5px] font-semibold text-foreground">
            {pendiente ? "Para activarla, confirma tu contraseña." : "Para desactivarla, confirma tu contraseña."}
          </p>
          <CampoContrasena
            label="Contraseña actual"
            autoComplete="current-password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            state={errorCampo ? "error" : "default"}
            mensajeError={errorCampo}
          />
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={cancelar}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={guardando}>
              {pendiente ? "Activar" : "Desactivar"}
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
