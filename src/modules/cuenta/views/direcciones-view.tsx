"use client"

import * as React from "react"
import Link from "next/link"
import { MapPin, Pencil, Star, Trash2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { useConfirm } from "@/shared/providers/confirm-provider"
import { toast } from "@/shared/components/ui/toast"
import { DireccionForm, FORMULARIO_DIRECCION_ID } from "../components/direccion-form"
import { direccionesAction, eliminarDireccionAction, marcarDireccionPrincipalAction } from "../actions/cuenta.actions"
import type { DireccionDto } from "@/dtos/cuenta"
import type { ErrorApi } from "@/lib/api/error-api"

export function DireccionesView() {
  const confirmar = useConfirm()
  const [direcciones, setDirecciones] = React.useState<DireccionDto[] | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [panel, setPanel] = React.useState<{ abierto: boolean; editando?: DireccionDto }>({ abierto: false })
  const [ocupada, setOcupada] = React.useState<string | null>(null)

  const cargar = React.useCallback(async () => {
    const res = await direccionesAction()
    if (res.ok) {
      setError(null)
      setDirecciones(res.datos)
    } else setError(res.error)
  }, [])

  React.useEffect(() => {
    let cancelado = false
    direccionesAction().then((res) => {
      if (cancelado) return
      if (res.ok) setDirecciones(res.datos)
      else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [])

  const eliminar = async (direccion: DireccionDto) => {
    const aceptado = await confirmar({
      variant: "destructive",
      title: "¿Eliminar esta dirección?",
      description: `Se quitará ${direccion.direccion_linea1}. Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
    })
    if (!aceptado) return
    setOcupada(direccion.id)
    const res = await eliminarDireccionAction(direccion.id)
    setOcupada(null)
    if (!res.ok) return setError(res.error)
    toast.add({ type: "success", title: "Dirección eliminada" })
    cargar()
  }

  const marcarPrincipal = async (direccion: DireccionDto) => {
    setOcupada(direccion.id)
    const res = await marcarDireccionPrincipalAction(direccion.id)
    setOcupada(null)
    if (!res.ok) return setError(res.error)
    toast.add({ type: "success", title: "Dirección principal actualizada" })
    cargar()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/cuenta" className="text-[12px] font-bold text-brand-text hover:underline">
            ← Mi cuenta
          </Link>
          <h1 className="mt-1 text-[18px] font-extrabold tracking-tight text-foreground">Mis direcciones</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">Donde recibes tus compras. Puedes guardar hasta 20.</p>
        </div>
        <Button onClick={() => setPanel({ abierto: true })}>Agregar dirección</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos completar la acción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!direcciones && !error && (
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          Cargando tus direcciones…
        </p>
      )}

      {direcciones && direcciones.length === 0 && (
        <Card>
          <CardContent>
            <EstadoVacio
              titulo="Aún no tienes direcciones"
              descripcion="Agrega una para recibir tus compras sin escribirla cada vez."
              icono={MapPin}
              accion={{ texto: "Agregar dirección", onClick: () => setPanel({ abierto: true }) }}
            />
          </CardContent>
        </Card>
      )}

      {direcciones && direcciones.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {direcciones.map((direccion) => (
            <li key={direccion.id}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="min-w-0 truncate text-[15px]">{direccion.nombre_contacto}</CardTitle>
                    {direccion.es_principal && <Badge variant="estado" tono="marca">Principal</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1 text-[13px] text-muted-foreground">
                    <p>{direccion.direccion_linea1}</p>
                    {direccion.direccion_linea2 && <p>{direccion.direccion_linea2}</p>}
                    <p>
                      {direccion.ciudad}, {direccion.estado_provincia} {direccion.codigo_postal}
                    </p>
                    <p>{direccion.pais}</p>
                    {direccion.telefono && <p>Tel. {direccion.telefono}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="neutral" onClick={() => setPanel({ abierto: true, editando: direccion })} disabled={ocupada !== null}>
                      <Pencil aria-hidden="true" />
                      Editar
                    </Button>
                    {!direccion.es_principal && (
                      <Button size="sm" variant="soft" onClick={() => marcarPrincipal(direccion)} loading={ocupada === direccion.id} disabled={ocupada !== null && ocupada !== direccion.id}>
                        <Star aria-hidden="true" />
                        Marcar como principal
                      </Button>
                    )}
                    <Button size="sm" variant="danger-outline" onClick={() => eliminar(direccion)} disabled={ocupada !== null}>
                      <Trash2 aria-hidden="true" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <FormPanel
        open={panel.abierto}
        onOpenChange={(abierto) => setPanel((estado) => ({ ...estado, abierto }))}
        title={panel.editando ? "Editar dirección" : "Agregar dirección"}
        description="Los datos se usan para entregar tus compras."
        footer={
          <div className="flex w-full gap-3">
            <Button type="button" variant="neutral" className="flex-1" onClick={() => setPanel({ abierto: false })}>
              Cancelar
            </Button>
            <Button type="submit" form={FORMULARIO_DIRECCION_ID} className="flex-1">
              Guardar
            </Button>
          </div>
        }
      >
        <DireccionForm
          key={panel.editando?.id ?? "nueva"}
          inicial={panel.editando}
          onGuardado={() => {
            setPanel({ abierto: false })
            cargar()
          }}
        />
      </FormPanel>
    </div>
  )
}
