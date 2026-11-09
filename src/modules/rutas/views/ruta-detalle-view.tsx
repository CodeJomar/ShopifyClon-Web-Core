"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Flag, Pencil, Play, Printer, Route } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
import { Button, buttonVariants } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { toast } from "@/shared/components/ui/toast"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { useConfirm } from "@/shared/providers/confirm-provider"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { PERMISO } from "@/shared/constants/permisos"
import type { RutaDetalle } from "@/dtos/ruta"
import type { ErrorApi } from "@/lib/api/error-api"
import { finalizarRutaAction, iniciarRutaAction, rutaAction } from "../actions/rutas.actions"
import { ParadaCard } from "../components/parada-card"
import { ETIQUETA_RUTA, formatearDia } from "../etiquetas"

/** Detalle de una ruta: datos del reparto, avance y sus paradas con el cambio de estado de cada envío. */
export function RutaDetalleView({ id }: { id: string }) {
  const router = useRouter()
  const { tienda, puede } = usePanel()
  const confirmar = useConfirm()
  const puedeGestionar = puede(PERMISO.ORDENES_GESTIONAR)
  const zonaHoraria = tienda?.zona_horaria ?? "America/Lima"

  const [ruta, setRuta] = React.useState<RutaDetalle | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [ocupada, setOcupada] = React.useState(false)
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    let cancelado = false
    rutaAction(id).then((res) => {
      if (cancelado) return
      if (res.ok) {
        setError(null)
        setRuta(res.datos)
      } else {
        setError(res.error)
      }
    })
    return () => {
      cancelado = true
    }
  }, [id, version])

  const recargar = () => setVersion((v) => v + 1)

  const cambiarEstado = async (accion: "iniciar" | "finalizar") => {
    if (!ruta) return
    const iniciar = accion === "iniciar"
    const aceptado = await confirmar({
      title: iniciar ? `¿Iniciar la ruta ${ruta.codigo}?` : `¿Finalizar la ruta ${ruta.codigo}?`,
      description: iniciar
        ? "Los envíos de la ruta pasarán a «En camino» y ya no podrás cambiar sus paradas."
        : "La ruta se cerrará. Las paradas que sigan pendientes quedarán como están.",
      confirmText: iniciar ? "Sí, iniciar" : "Sí, finalizar",
    })
    if (!aceptado) return
    setOcupada(true)
    const res = iniciar ? await iniciarRutaAction(ruta.id) : await finalizarRutaAction(ruta.id)
    setOcupada(false)
    if (!res.ok) return setError(res.error)
    toast.add({ type: "success", title: iniciar ? "Ruta iniciada" : "Ruta finalizada" })
    recargar()
  }

  if (error && !ruta) {
    return (
      <Card>
        <CardContent>
          <EstadoVacio icono={Route} titulo="No pudimos abrir la ruta" descripcion={error.message} accion={{ texto: "Volver a las rutas", onClick: () => router.push("/panel/rutas") }} />
        </CardContent>
      </Card>
    )
  }

  if (!ruta) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Cargando la ruta">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  const entregadas = ruta.paradas.filter((p) => p.estado_envio === "ENTREGADO").length
  const etiqueta = ETIQUETA_RUTA[ruta.estado]

  return (
    <div className="space-y-5">
      <Link href="/panel/rutas" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-text hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" /> Rutas
      </Link>

      <EncabezadoPagina
        titulo={`Ruta ${ruta.codigo}`}
        descripcion={`${formatearDia(ruta.fecha)} · ${ruta.chofer} · ${ruta.placa}`}
        acciones={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="estado" tono={etiqueta.tono}>{etiqueta.texto}</Badge>
            {puedeGestionar && ruta.estado === "BORRADOR" && (
              <Link href={`/panel/rutas/${ruta.id}/editar`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Pencil aria-hidden="true" /> Editar
              </Link>
            )}
            <Link href={`/panel/rutas/${ruta.id}/guia`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Printer aria-hidden="true" /> Guía de remisión
            </Link>
            {puedeGestionar && ruta.estado === "BORRADOR" && (
              <Button size="sm" loading={ocupada} onClick={() => cambiarEstado("iniciar")} leftIcon={<Play aria-hidden="true" />}>
                Iniciar ruta
              </Button>
            )}
            {puedeGestionar && ruta.estado === "EN_CURSO" && (
              <Button size="sm" loading={ocupada} onClick={() => cambiarEstado("finalizar")} leftIcon={<Flag aria-hidden="true" />}>
                Finalizar ruta
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos completar la acción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <Dato titulo="Chofer" valor={ruta.chofer} />
          <Dato titulo="Placa" valor={ruta.placa} mono />
          <Dato titulo="Entregas" valor={`${entregadas} de ${ruta.paradas.length}`} />
          <Dato titulo="Nota" valor={ruta.nota || "—"} />
        </CardContent>
      </Card>

      {ruta.estado === "BORRADOR" && (
        <Alert>
          <AlertTitle>Esta ruta aún es un borrador</AlertTitle>
          <AlertDescription>Cuando la inicies, los envíos pasarán a «En camino» y podrás marcar cada entrega.</AlertDescription>
        </Alert>
      )}

      <ol className="space-y-4" aria-label="Paradas de la ruta">
        {ruta.paradas.map((p) => (
          <li key={p.envio_id}>
            <ParadaCard parada={p} puedeCambiar={puedeGestionar && ruta.estado === "EN_CURSO"} zonaHoraria={zonaHoraria} alCambiar={recargar} />
          </li>
        ))}
      </ol>
    </div>
  )
}

function Dato({ titulo, valor, mono }: { titulo: string; valor: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] font-bold text-muted-foreground">{titulo}</p>
      <p className={`mt-0.5 break-words text-[14px] font-extrabold text-foreground ${mono ? "font-mono" : ""}`}>{valor}</p>
    </div>
  )
}
