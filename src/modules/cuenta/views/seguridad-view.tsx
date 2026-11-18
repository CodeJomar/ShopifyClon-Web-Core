"use client"

import * as React from "react"
import { LogOut, MonitorSmartphone, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useConfirm } from "@/shared/providers/confirm-provider"
import { cerrarSesionAction } from "@/modules/auth"
import { ContrasenaForm } from "../components/contrasena-form"
import { DosPasosSeccion } from "../components/dos-pasos-seccion"
import { cerrarSesionesAction } from "../actions/cuenta.actions"
import { usePerfilCuenta } from "../hooks/use-perfil-cuenta"

/** «Mi cuenta · Seguridad»: contraseña, verificación en dos pasos y cierre de sesión. */
export function SeguridadView() {
  const confirmar = useConfirm()
  const { perfil, setPerfil, error, setError } = usePerfilCuenta()
  const [cerrando, setCerrando] = React.useState(false)
  const [cerrandoTodas, setCerrandoTodas] = React.useState(false)

  const cerrarSesion = async () => {
    setCerrando(true)
    await cerrarSesionAction()
    window.location.replace("/login")
  }

  /** Invalida todas las sesiones de la cuenta en el servidor (A-007), también la de este navegador, y lleva al login. */
  const cerrarEnTodos = async () => {
    const aceptado = await confirmar({
      title: "¿Cerrar sesión en todos los dispositivos?",
      description: "Se cerrará tu sesión en este navegador y en cualquier otro donde la tengas abierta. Tendrás que volver a iniciarla.",
      confirmText: "Sí, cerrar todas",
    })
    if (!aceptado) return
    setCerrandoTodas(true)
    const res = await cerrarSesionesAction()
    // Si la API ya no reconoce la sesión (401) igual se cierra la de la web: el resultado es el mismo.
    if (!res.ok && res.error.estado !== 401) {
      setCerrandoTodas(false)
      return setError(res.error)
    }
    await cerrarSesionAction()
    window.location.replace("/login?aviso=sesiones")
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[30px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[36px]">Seguridad</h1>
        <p className="mt-1 text-[14.5px] font-medium text-muted-foreground">Tu contraseña, la verificación en dos pasos y tus sesiones abiertas.</p>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos completar la acción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <section className="max-w-xl space-y-4 rounded-3xl vidrio p-5 sm:p-7" aria-labelledby="seg-contrasena">
        <h2 id="seg-contrasena" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">Contraseña</h2>
        <ContrasenaForm />
      </section>

      <section className="max-w-xl rounded-3xl vidrio p-5 sm:p-7">
        {perfil ? <DosPasosSeccion perfil={perfil} onCambio={setPerfil} /> : <Skeleton className="h-24 rounded-2xl" aria-busy="true" aria-label="Cargando" />}
      </section>

      <section className="max-w-xl rounded-3xl vidrio p-5 sm:p-7" aria-labelledby="seg-sesion">
        <h2 id="seg-sesion" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">Sesión y cuenta</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="danger-outline" onClick={cerrarSesion} loading={cerrando} leftIcon={<LogOut aria-hidden="true" />}>
            Cerrar sesión
          </Button>
          <Button variant="neutral" onClick={cerrarEnTodos} loading={cerrandoTodas} leftIcon={<MonitorSmartphone aria-hidden="true" />}>
            Cerrar sesión en todos los dispositivos
          </Button>
          {/* Próximamente: necesita un endpoint nuevo (docs/orquestacion/ajustes/A-003) */}
          <Button variant="danger-outline" disabled leftIcon={<Trash2 aria-hidden="true" />} aria-describedby="cuenta-pronto">
            Eliminar mi cuenta
          </Button>
        </div>
        <p id="cuenta-pronto" className="mt-3 text-[12px] text-muted-foreground">Eliminar tu cuenta llega pronto.</p>
      </section>
    </div>
  )
}
