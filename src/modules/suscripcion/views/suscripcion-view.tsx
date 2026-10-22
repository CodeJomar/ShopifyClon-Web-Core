"use client"

import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { ROL } from "@/shared/constants/permisos"
import type { PlanDto } from "@/dtos/tienda"
import type { SuscripcionPanelDto } from "@/dtos/suscripcion"
import type { ErrorApi } from "@/lib/api/error-api"
import { planesAction, suscripcionAction } from "../actions/suscripcion.actions"
import { ResumenSuscripcion } from "../components/resumen-suscripcion"
import { UsoPlan } from "../components/uso-plan"
import { PagarSuscripcionForm, FORMULARIO_PAGAR_SUSCRIPCION } from "../components/pagar-suscripcion-form"
import { CambiarPlanForm, FORMULARIO_CAMBIAR_PLAN } from "../components/cambiar-plan-form"
import { CancelarSuscripcionForm, FORMULARIO_CANCELAR_SUSCRIPCION } from "../components/cancelar-suscripcion-form"
import { RevertirCancelacionForm, FORMULARIO_REVERTIR_CANCELACION } from "../components/revertir-cancelacion-form"

export function SuscripcionView() {
  const { rol, tienda, recargar } = usePanel()
  const esPropietario = rol === ROL.PROPIETARIO
  const zonaHoraria = tienda?.zona_horaria ?? "America/Lima"

  const [suscripcion, setSuscripcion] = React.useState<SuscripcionPanelDto | null>(null)
  const [planes, setPlanes] = React.useState<PlanDto[]>([])
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const [panelPagar, setPanelPagar] = React.useState(false)
  const [panelCambiarPlan, setPanelCambiarPlan] = React.useState(false)
  const [panelCancelar, setPanelCancelar] = React.useState(false)
  const [panelRevertir, setPanelRevertir] = React.useState(false)

  const cargar = React.useCallback(async () => {
    const [subRes, planesRes] = await Promise.all([suscripcionAction(), planesAction()])
    if (subRes.ok) {
      setError(null)
      setSuscripcion(subRes.datos)
    } else {
      setError(subRes.error)
    }

    if (planesRes.ok) {
      setPlanes(planesRes.datos)
    }
    setCargando(false)
  }, [])

  React.useEffect(() => {
    let cancelado = false
    Promise.all([suscripcionAction(), planesAction()]).then(([subRes, planesRes]) => {
      if (cancelado) return
      if (subRes.ok) {
        setError(null)
        setSuscripcion(subRes.datos)
      } else {
        setError(subRes.error)
      }
      if (planesRes.ok) {
        setPlanes(planesRes.datos)
      }
      setCargando(false)
    })
    return () => {
      cancelado = true
    }
  }, [])

  const alCompletarAccion = async () => {
    setPanelPagar(false)
    setPanelCambiarPlan(false)
    setPanelCancelar(false)
    setPanelRevertir(false)
    await cargar()
    await recargar?.()
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Suscripción" descripcion="Tu plan, el periodo de facturación, el uso frente a los límites y tus pagos." />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar la suscripción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {cargando && (
        <div className="space-y-4" aria-busy="true" aria-label="Cargando suscripción">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      )}

      {!cargando && suscripcion && (
        <div className="space-y-6">
          <ResumenSuscripcion
            suscripcion={suscripcion}
            zonaHoraria={zonaHoraria}
            esPropietario={esPropietario}
            onPagar={() => setPanelPagar(true)}
            onCambiarPlan={() => setPanelCambiarPlan(true)}
            onCancelar={() => setPanelCancelar(true)}
            onRevertirCancelacion={() => setPanelRevertir(true)}
          />

          <UsoPlan uso={suscripcion.uso} limites={suscripcion.limites} />
        </div>
      )}

      {/* FormPanel para Pagar / Reactivar */}
      <FormPanel
        open={panelPagar}
        onOpenChange={setPanelPagar}
        title={suscripcion?.estado === "VENCIDA" ? "Reactivar suscripción" : "Pagar suscripción"}
        description="Elige el ciclo y procesa el pago simulado para activar tu tienda."
        footer={
          <>
            <Button
              type="button"
              variant="neutral"
              onClick={() => setPanelPagar(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" form={FORMULARIO_PAGAR_SUSCRIPCION}>
              Procesar pago
            </Button>
          </>
        }
      >
        {suscripcion && (
          <PagarSuscripcionForm
            suscripcion={suscripcion}
            onGuardado={alCompletarAccion}
          />
        )}
      </FormPanel>

      {/* FormPanel para Cambiar de Plan */}
      <FormPanel
        open={panelCambiarPlan}
        onOpenChange={setPanelCambiarPlan}
        title="Cambiar de plan"
        description="Selecciona un plan y confirma el cambio inmediato."
        footer={
          <>
            <Button
              type="button"
              variant="neutral"
              onClick={() => setPanelCambiarPlan(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" form={FORMULARIO_CAMBIAR_PLAN}>
              Confirmar cambio
            </Button>
          </>
        }
      >
        {suscripcion && (
          <CambiarPlanForm
            planes={planes}
            suscripcion={suscripcion}
            onGuardado={alCompletarAccion}
          />
        )}
      </FormPanel>

      {/* FormPanel para Cancelar Suscripción */}
      <FormPanel
        open={panelCancelar}
        onOpenChange={setPanelCancelar}
        title="Cancelar suscripción"
        description="Indica el motivo de la cancelación de tu suscripción."
        footer={
          <>
            <Button
              type="button"
              variant="neutral"
              onClick={() => setPanelCancelar(false)}
            >
              Volver
            </Button>
            <Button type="submit" form={FORMULARIO_CANCELAR_SUSCRIPCION} variant="danger">
              Confirmar cancelación
            </Button>
          </>
        }
      >
        {suscripcion && (
          <CancelarSuscripcionForm
            suscripcion={suscripcion}
            zonaHoraria={zonaHoraria}
            onGuardado={alCompletarAccion}
          />
        )}
      </FormPanel>

      {/* FormPanel para Revertir Cancelación */}
      <FormPanel
        open={panelRevertir}
        onOpenChange={setPanelRevertir}
        title="Revertir cancelación"
        description="Mantén tu suscripción activa para el siguiente período."
        footer={
          <>
            <Button
              type="button"
              variant="neutral"
              onClick={() => setPanelRevertir(false)}
            >
              Volver
            </Button>
            <Button type="submit" form={FORMULARIO_REVERTIR_CANCELACION}>
              Confirmar reversión
            </Button>
          </>
        }
      >
        {suscripcion && (
          <RevertirCancelacionForm
            suscripcion={suscripcion}
            zonaHoraria={zonaHoraria}
            onGuardado={alCompletarAccion}
          />
        )}
      </FormPanel>
    </div>
  )
}
