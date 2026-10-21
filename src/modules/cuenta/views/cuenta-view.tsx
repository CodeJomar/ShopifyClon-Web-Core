"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, Mail, MapPin, Moon, Receipt, Store, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"
import { Card } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Switch } from "@/shared/components/ui/switch"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { useMounted } from "@/shared/hooks/use-mounted"
import { PerfilForm } from "../components/perfil-form"
import { ContrasenaForm } from "../components/contrasena-form"
import { perfilCuentaAction } from "../actions/cuenta.actions"
import type { PerfilCuentaDto } from "@/dtos/cuenta"
import type { ErrorApi } from "@/lib/api/error-api"

/** Tarjetas hacia las demás pantallas de la cuenta (cada una sigue siendo su propia ruta). */
const ACCESOS = [
  { href: "/cuenta/tiendas", icono: Store, titulo: "Mis tiendas", descripcion: "Elige con cuál trabajar o crea una nueva." },
  { href: "/cuenta/direcciones", icono: MapPin, titulo: "Direcciones", descripcion: "Donde recibes tus compras." },
  { href: "/cuenta/ordenes", icono: Receipt, titulo: "Mis compras", descripcion: "Lo que compraste en cualquier tienda." },
]

/**
 * "Mi cuenta": a la izquierda el perfil (identidad, datos, contraseña y apariencia) y a la derecha tarjetas
 * hacia Mis tiendas, Direcciones y Mis compras.
 */
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
    <div className="max-w-[1400px] space-y-8">
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

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      {perfil ? (
        <Card className="gap-0 py-0 lg:grid lg:grid-cols-[300px_1fr]">
          {/* Columna izquierda: identidad, contraseña y apariencia */}
          <div className="flex flex-col gap-6 border-b border-border/60 p-6 sm:p-7 lg:border-b-0 lg:border-r">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-24 items-center justify-center rounded-full bg-primary/14 text-brand-text ring-1 ring-primary/32" aria-hidden="true">
                <User className="size-11" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[16px] font-extrabold tracking-tight text-foreground">{perfil.nombres} {perfil.apellidos}</p>
                <p className="truncate text-[12.5px] text-muted-foreground">{perfil.correo_electronico}</p>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            <section className="space-y-4" aria-labelledby="cuenta-seguridad">
              <h2 id="cuenta-seguridad" className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Seguridad</h2>
              <ContrasenaForm />
            </section>

            <div className="h-px bg-border/60" />

            <section className="space-y-3" aria-labelledby="tema-titulo">
              <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Preferencias</h2>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p id="tema-titulo" className="text-[13.5px] font-bold text-foreground">Apariencia</p>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">{oscuro ? "Tema oscuro activado." : "Tema claro activado."}</p>
                </div>
                {/* El mismo interruptor luna / sol que estaba en el encabezado */}
                <div className="flex h-9 items-center gap-2 rounded-full bg-brand-strong/12 px-3">
                  <Moon aria-hidden="true" className="size-3.5 text-muted-foreground" />
                  <Switch checked={oscuro} onCheckedChange={(marcado) => setTheme(marcado ? "dark" : "light")} aria-labelledby="tema-titulo" />
                  <Sun aria-hidden="true" className={oscuro ? "size-3.5 text-muted-foreground" : "size-3.5 text-foreground"} />
                </div>
              </div>
            </section>
          </div>

          {/* Columna derecha: información del perfil */}
          <div className="p-6 sm:p-7">
            <div className="mb-6">
              <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Información del perfil</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">Así te verán las tiendas donde compras.</p>
            </div>
            <PerfilForm
              perfil={perfil}
              onGuardado={setPerfil}
              correo={
                <FloatingInput
                  label="Correo electrónico"
                  leftIcon={<Mail className="size-4" aria-hidden="true" />}
                  value={perfil.correo_electronico}
                  readOnly
                  copiable
                  ayuda="El correo no se puede cambiar."
                />
              }
            />
          </div>
        </Card>
      ) : (
        <div />
      )}

      {/* Contenedor de la derecha: tarjetas hacia las otras pantallas de la cuenta */}
      <nav aria-label="Más de tu cuenta" className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
        {ACCESOS.map(({ href, icono: Icono, titulo, descripcion }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3.5 rounded-xl border border-island-border bg-card p-4 shadow-isla outline-none transition-all hover:-translate-y-px hover:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/14 text-brand-text" aria-hidden="true">
              <Icono className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-extrabold text-foreground">{titulo}</span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{descripcion}</span>
            </span>
            <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-text" />
          </Link>
        ))}
      </nav>
      </div>
    </div>
  )
}
