"use client"

import * as React from "react"
import { PackageSearch, Search, Store } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { formatearFecha } from "@/shared/utils/fechas"
import type { SeguimientoPublico } from "@/dtos/ruta"
import type { ErrorApi } from "@/lib/api/error-api"
import { seguimientoPublicoAction } from "../actions/rutas.actions"
import { LineaTiempoEnvio } from "../components/linea-tiempo-envio"
import { ETIQUETA_EVENTO } from "../etiquetas"

/** Seguimiento público: el comprador escribe su número de guía y ve el historial de su envío (sin datos personales). */
export function SeguimientoView({ guiaInicial = "" }: { guiaInicial?: string }) {
  const [guia, setGuia] = React.useState(guiaInicial)
  const [resultado, setResultado] = React.useState<SeguimientoPublico | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [buscando, setBuscando] = React.useState(false)

  const buscar = React.useCallback(async (valor: string) => {
    const limpio = valor.trim()
    if (!limpio) return
    setBuscando(true)
    setError(null)
    const res = await seguimientoPublicoAction(limpio)
    setBuscando(false)
    if (res.ok) setResultado(res.datos)
    else {
      setResultado(null)
      setError(res.error)
    }
  }, [])

  // Enlace con ?guia=…: la búsqueda arranca sola.
  React.useEffect(() => {
    if (!guiaInicial) return
    let cancelado = false
    seguimientoPublicoAction(guiaInicial).then((res) => {
      if (cancelado) return
      if (res.ok) setResultado(res.datos)
      else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [guiaInicial])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 px-4 py-10">
      <header className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-isla">
          <Store className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-foreground">Seguimiento de tu pedido</h1>
          <p className="text-[13px] text-muted-foreground">Escribe el número de guía que recibiste para ver dónde está.</p>
        </div>
      </header>

      <Card>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void buscar(guia)
            }}
            className="flex items-start gap-2"
            noValidate
          >
            <div className="min-w-0 flex-1">
              <FloatingInput label="Número de guía" value={guia} onChange={(e) => setGuia(e.target.value)} />
            </div>
            <Button type="submit" className="h-11" loading={buscando} leftIcon={<Search aria-hidden="true" />}>
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <PackageSearch aria-hidden="true" />
          <AlertTitle>No encontramos ese envío</AlertTitle>
          <AlertDescription>Revisa que el número de guía esté bien escrito.</AlertDescription>
        </Alert>
      )}

      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[15px]">{resultado.numero_guia}</span>
              <Badge variant="estado" tono={ETIQUETA_EVENTO[resultado.estado].tono}>{ETIQUETA_EVENTO[resultado.estado].texto}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(resultado.chofer || resultado.empresa_transporte) && (
              <p className="text-[13px] text-muted-foreground">
                Transporte: <span className="font-bold text-foreground">{resultado.chofer ?? resultado.empresa_transporte}</span>
              </p>
            )}
            {(resultado.fecha_entrega_real || resultado.fecha_entrega_estimada) && (
              <p className="text-[13px] text-muted-foreground">
                {resultado.fecha_entrega_real
                  ? `Entregado el ${formatearFecha(resultado.fecha_entrega_real)}`
                  : `Entrega estimada: ${formatearFecha(resultado.fecha_entrega_estimada as string)}`}
              </p>
            )}
            <LineaTiempoEnvio eventos={resultado.eventos} />
          </CardContent>
        </Card>
      )}
    </main>
  )
}
