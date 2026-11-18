"use client"

import { Mail, Moon, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Switch } from "@/shared/components/ui/switch"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { useMounted } from "@/shared/hooks/use-mounted"
import { TEMA_UNICO } from "@/shared/config/tema"
import { PerfilForm } from "../components/perfil-form"
import { usePerfilCuenta } from "../hooks/use-perfil-cuenta"

/** «Mi cuenta · Perfil»: quién eres, tus datos de contacto y la apariencia del sitio. La seguridad y las direcciones tienen su propia pantalla. */
export function CuentaView() {
  const { perfil, setPerfil, error } = usePerfilCuenta()
  const { theme, setTheme } = useTheme()
  const montado = useMounted()
  const oscuro = montado && theme === "dark"

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[30px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[36px]">Perfil</h1>
        <p className="mt-1 text-[14.5px] font-medium text-muted-foreground">Tus datos. Así te ven las tiendas donde compras.</p>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar tu cuenta</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!perfil && !error && <Skeleton className="h-72 rounded-3xl" aria-busy="true" aria-label="Cargando tus datos" />}

      {perfil && (
        <>
          <section className="flex items-center gap-4 rounded-3xl vidrio p-5 sm:p-6" aria-label="Tu cuenta">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/14 text-brand-text ring-1 ring-primary/32" aria-hidden="true">
              <User className="size-8" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[18px] font-extrabold tracking-tight text-foreground">{perfil.nombres} {perfil.apellidos}</p>
              <p className="truncate text-[13.5px] font-medium text-muted-foreground">{perfil.correo_electronico}</p>
            </div>
          </section>

          <section className="@container rounded-3xl vidrio p-5 sm:p-7">
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
          </section>

          {!TEMA_UNICO && (
          <section className="rounded-3xl vidrio p-5 sm:p-7" aria-labelledby="tema-titulo">
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">Preferencias</h2>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p id="tema-titulo" className="text-[14.5px] font-bold text-foreground">Apariencia</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{oscuro ? "Tema oscuro activado." : "Tema claro activado."}</p>
              </div>
              <div className="flex h-10 items-center gap-2.5 rounded-full bg-secondary px-3.5">
                <Sun aria-hidden="true" className={oscuro ? "size-4 text-muted-foreground" : "size-4 text-foreground"} />
                <Switch checked={oscuro} onCheckedChange={(marcado) => setTheme(marcado ? "dark" : "light")} aria-labelledby="tema-titulo" />
                <Moon aria-hidden="true" className={oscuro ? "size-4 text-foreground" : "size-4 text-muted-foreground"} />
              </div>
            </div>
          </section>
          )}
        </>
      )}
    </div>
  )
}
