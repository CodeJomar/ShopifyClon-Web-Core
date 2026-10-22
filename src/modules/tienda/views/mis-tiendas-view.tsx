"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Store } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { fijarTiendaAction, misTiendasAction } from "../actions/tienda.actions"
import type { MiTiendaDto } from "@/dtos/tienda"
import type { ErrorApi } from "@/lib/api/error-api"

const NOMBRE_ROL: Record<string, string> = {
  PROPIETARIO: "Propietario",
  ADMINISTRADOR: "Administrador",
  GESTOR_CATALOGO: "Gestor de catálogo",
  GESTOR_PEDIDOS: "Gestor de pedidos",
}

export function MisTiendasView() {
  const router = useRouter()
  const [tiendas, setTiendas] = React.useState<MiTiendaDto[] | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [eligiendo, setEligiendo] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelado = false
    misTiendasAction().then((res) => {
      if (cancelado) return
      if (res.ok) setTiendas(res.datos)
      else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [])

  const elegir = async (tienda: MiTiendaDto) => {
    setEligiendo(tienda.tienda_id)
    setError(null)
    const res = await fijarTiendaAction(tienda.tienda_id)
    if (!res.ok) {
      setEligiendo(null)
      return setError(res.error)
    }
    router.replace("/panel")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Mis tiendas</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">Elige con cuál quieres trabajar.</p>
        </div>
        <Button variant="default" onClick={() => router.push("/cuenta/tiendas/nueva")}>
          Crear tienda
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos abrir la tienda</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!tiendas && !error && <p className="text-[13px] text-muted-foreground" aria-live="polite">Cargando tus tiendas…</p>}

      {tiendas && tiendas.length === 0 && (
        <Card>
          <CardContent>
            <EstadoVacio
              titulo="Aún no tienes tiendas"
              descripcion="Crea tu primera tienda y empieza a vender por redes."
              icono={Store}
              accion={{ texto: "Crear mi tienda", onClick: () => router.push("/cuenta/tiendas/nueva") }}
            />
          </CardContent>
        </Card>
      )}

      {tiendas && tiendas.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {tiendas.map((tienda) => (
            <li key={tienda.tienda_id}>
              <Card className={`h-full transition-colors ${tienda.esta_activa ? "border-primary ring-2 ring-primary/25" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{tienda.nombre}</CardTitle>
                      <CardDescription className="font-mono text-[12px]">otemu.com/tienda/{tienda.subdominio}</CardDescription>
                    </div>
                    <Badge variant="estado" tono="contorno">{NOMBRE_ROL[tienda.rol] ?? tienda.rol}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tienda.esta_activa && <Badge variant="estado" tono="marca">Tienda actual</Badge>}
                    {!tienda.operativa && <Badge variant="estado" tono="aviso">Requiere atención</Badge>}
                  </div>
                  <Button
                    variant={tienda.esta_activa ? "default" : "soft"}
                    size="sm"
                    loading={eligiendo === tienda.tienda_id}
                    disabled={eligiendo !== null}
                    onClick={() => elegir(tienda)}
                  >
                    {tienda.esta_activa ? "Continuar" : "Abrir"}
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-[13px] text-muted-foreground">
        <Link href="/cuenta" className="font-bold text-brand-text hover:underline">
          Volver a mi cuenta
        </Link>
      </p>
    </div>
  )
}
