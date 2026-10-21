"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { formatearDinero } from "@/shared/utils/dinero"
import type { PlanPlataformaDto } from "@/dtos/plataforma"
import type { ErrorApi } from "@/lib/api/error-api"
import { listarPlanesAction } from "../actions/plataforma.actions"
import { FORMULARIO_PLAN, PlanForm } from "../components/plan-form"
import { EliminarPlanForm, FORMULARIO_ELIMINAR_PLAN } from "../components/eliminar-plan-form"

export function PlanesView() {
  const [planes, setPlanes] = React.useState<PlanPlataformaDto[]>([])
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const [panelEditar, setPanelEditar] = React.useState<{ abierto: boolean; plan: PlanPlataformaDto | null }>({
    abierto: false,
    plan: null,
  })
  const [panelEliminar, setPanelEliminar] = React.useState<{ abierto: boolean; plan: PlanPlataformaDto | null }>({
    abierto: false,
    plan: null,
  })

  const cargar = React.useCallback(async () => {
    setCargando(true)
    const res = await listarPlanesAction()
    if (res.ok) {
      setError(null)
      setPlanes(res.datos)
    } else {
      setError(res.error)
    }
    setCargando(false)
  }, [])

  React.useEffect(() => {
    let cancelado = false
    listarPlanesAction().then((res) => {
      if (cancelado) return
      if (res.ok) {
        setError(null)
        setPlanes(res.datos)
      } else {
        setError(res.error)
      }
      setCargando(false)
    })
    return () => {
      cancelado = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">
            Planes de suscripción
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Administra los planes de suscripción de la plataforma, comisiones y límites para los comerciantes.
          </p>
        </div>
        <Button onClick={() => setPanelEditar({ abierto: true, plan: null })}>
          <Plus className="size-4" aria-hidden="true" />
          <span>Crear plan</span>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar los planes</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {cargando && (
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          Cargando catálogo de planes…
        </p>
      )}

      {!cargando && !error && planes.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <EstadoVacio
              titulo="No hay planes configurados"
              descripcion="Crea el primer plan para permitir que las tiendas se suscriban."
            />
          </CardContent>
        </Card>
      )}

      {!cargando && !error && planes.length > 0 && (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Precios (Mes / Año)</TableHead>
                <TableHead>Límites</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead>Prueba</TableHead>
                <TableHead>Visibilidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planes.map((plan) => (
                <TableRow key={plan.codigo}>
                  <TableCell className="font-mono text-[12px] font-bold text-foreground">
                    {plan.codigo}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-bold text-foreground">{plan.nombre}</p>
                      {plan.descripcion && (
                        <p className="text-[12px] text-muted-foreground line-clamp-1">
                          {plan.descripcion}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-foreground">
                      {formatearDinero(plan.precio_mensual, plan.moneda)} / mes
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {formatearDinero(plan.precio_anual, plan.moneda)} / año
                    </p>
                  </TableCell>
                  <TableCell className="text-[12.5px] text-muted-foreground">
                    <p>
                      Productos:{" "}
                      <strong className="text-foreground">
                        {plan.limite_productos == null ? "Ilimitados" : plan.limite_productos.toLocaleString("es-PE")}
                      </strong>
                    </p>
                    <p>
                      Personal:{" "}
                      <strong className="text-foreground">
                        {plan.limite_personal} {plan.limite_personal === 1 ? "persona" : "personas"}
                      </strong>
                    </p>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {(plan.porcentaje_comision * 100).toLocaleString("es-PE", { maximumFractionDigits: 2 })} %
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[12.5px]">
                    {plan.dias_prueba} días
                  </TableCell>
                  <TableCell>
                    <Badge variant="estado" tono={plan.es_publico ? "marca" : "contorno"}>
                      {plan.es_publico ? "Público" : "No público"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="neutral"
                        onClick={() => setPanelEditar({ abierto: true, plan })}
                      >
                        Editar
                      </Button>
                      {plan.es_publico && (
                        <Button
                          size="sm"
                          variant="neutral"
                          onClick={() => setPanelEliminar({ abierto: true, plan })}
                        >
                          Retirar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* FormPanel Crear / Editar Plan */}
      <FormPanel
        open={panelEditar.abierto}
        onOpenChange={(abierto) => setPanelEditar((prev) => ({ ...prev, abierto }))}
        title={panelEditar.plan ? `Editar plan: ${panelEditar.plan.nombre}` : "Crear nuevo plan"}
        description="Configura los precios, límites y comisiones del plan de suscripción."
        footer={
          <>
            <Button
              type="button"
              variant="neutral"
              onClick={() => setPanelEditar({ abierto: false, plan: null })}
            >
              Cancelar
            </Button>
            <Button type="submit" form={FORMULARIO_PLAN}>
              Guardar plan
            </Button>
          </>
        }
      >
        <PlanForm
          key={panelEditar.plan?.codigo ?? "nuevo"}
          plan={panelEditar.plan}
          onGuardado={() => {
            setPanelEditar({ abierto: false, plan: null })
            cargar()
          }}
        />
      </FormPanel>

      {/* FormPanel Retirar Plan */}
      <FormPanel
        open={panelEliminar.abierto}
        onOpenChange={(abierto) => setPanelEliminar((prev) => ({ ...prev, abierto }))}
        title="¿Retirar plan del catálogo público?"
        footer={
          <>
            <Button
              type="button"
              variant="neutral"
              onClick={() => setPanelEliminar({ abierto: false, plan: null })}
            >
              Cancelar
            </Button>
            <Button type="submit" form={FORMULARIO_ELIMINAR_PLAN} variant="danger">
              Confirmar y retirar
            </Button>
          </>
        }
      >
        {panelEliminar.plan && (
          <EliminarPlanForm
            plan={panelEliminar.plan}
            onGuardado={() => {
              setPanelEliminar({ abierto: false, plan: null })
              cargar()
            }}
          />
        )}
      </FormPanel>
    </div>
  )
}
