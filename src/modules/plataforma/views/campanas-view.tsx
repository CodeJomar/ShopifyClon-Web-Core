"use client"

import * as React from "react"
import { Check, Sparkles } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { toast } from "@/shared/components/ui/toast"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { EstadoError } from "@/shared/components/composed/estado-error"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { ErrorApi } from "@/lib/api/error-api"
import type { CampanasAdminDto } from "@/dtos/campanas"

const llamar = <T,>(c: Parameters<typeof peticionApi<T>>[0]) => resultado(peticionApi<T>(c))

/** Campañas de la plataforma: se activa una a la vez y el servidor aplica el descuento por tramos de precio en todo el sitio. */
export function CampanasView() {
  const [datos, setDatos] = React.useState<CampanasAdminDto | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [cambiando, setCambiando] = React.useState<string | null>(null)
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    let cancelado = false
    void llamar<CampanasAdminDto>({ method: "GET", url: "/plataforma/campanas" }).then((res) => {
      if (cancelado) return
      if (res.ok) {
        setDatos(res.datos)
        setError(null)
      } else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [version])

  const activar = async (codigo: string | null) => {
    setCambiando(codigo ?? "apagar")
    const res = await llamar<unknown>({ method: "PUT", url: "/plataforma/campanas/activa", data: { codigo } })
    setCambiando(null)
    if (!res.ok) return void toast.add({ type: "error", title: "No se pudo cambiar la campaña", description: res.error.message })
    toast.add({ type: "success", title: codigo ? "Campaña activada" : "Campaña apagada", description: codigo ? "Los precios ya salen con el descuento." : "Los precios vuelven a su valor de lista." })
    setVersion((v) => v + 1)
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Campañas"
        descripcion="Activa una campaña y todos los productos reciben un descuento automático según su precio. La tienda asume el descuento."
        acciones={
          datos?.activa ? (
            <Button variant="neutral" loading={cambiando === "apagar"} disabled={cambiando !== null} onClick={() => activar(null)}>
              Apagar campaña
            </Button>
          ) : undefined
        }
      />

      {error ? (
        <EstadoError mensaje={error.message} onReintentar={() => setVersion((v) => v + 1)} />
      ) : !datos ? (
        <div className="grid gap-4 md:grid-cols-3" aria-busy="true" aria-label="Cargando">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : (
        <>
          <ul data-tour="campanas" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {datos.disponibles.map((c) => {
              const activa = datos.activa?.codigo === c.codigo
              return (
                <li key={c.codigo}>
                  <Card className={`h-full transition-colors ${activa ? "border-primary ring-2 ring-primary/25" : ""}`}>
                    <CardContent className="flex h-full flex-col justify-between gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-5 text-brand-text" aria-hidden="true" />
                          <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">{c.nombre}</h2>
                        </div>
                        {activa && <Badge variant="estado" tono="marca">Activa ahora</Badge>}
                      </div>
                      <Button
                        variant={activa ? "soft" : "default"}
                        size="sm"
                        disabled={activa || cambiando !== null}
                        loading={cambiando === c.codigo}
                        onClick={() => activar(c.codigo)}
                        leftIcon={activa ? <Check aria-hidden="true" /> : undefined}
                      >
                        {activa ? "En curso" : "Activar"}
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              )
            })}
          </ul>

          <Card>
            <CardContent className="space-y-3">
              <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Descuento por tramos de precio</h2>
              <p className="text-[13px] text-muted-foreground">Se calcula sobre el precio de lista de cada producto, en la moneda de su tienda. Con un cupón en el carrito gana el mayor descuento; no se acumulan.</p>
              <ul className="divide-y divide-border/60">
                {datos.tramos.map((t, i) => {
                  const siguiente = datos.tramos[i + 1]
                  return (
                    <li key={t.desde} className="flex items-center justify-between gap-3 py-2.5 text-[13.5px]">
                      <span className="font-semibold text-foreground">{siguiente ? `Desde ${t.desde} hasta menos de ${siguiente.desde}` : `Desde ${t.desde}`}</span>
                      <Badge variant="estado" tono="marca">{t.porcentaje} % de descuento</Badge>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
