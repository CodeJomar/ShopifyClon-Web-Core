"use client"

import * as React from "react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { formatearDinero } from "@/shared/utils/dinero"
import { formatearFecha } from "@/shared/utils/fechas"
import type { EstadoSuscripcion, SuscripcionPanelDto } from "@/dtos/suscripcion"
import { CalendarClock, CheckCircle2, ShieldAlert } from "lucide-react"

interface ResumenSuscripcionProps {
  suscripcion: SuscripcionPanelDto
  zonaHoraria?: string
  esPropietario: boolean
  onPagar: () => void
  onCambiarPlan: () => void
  onCancelar: () => void
  onRevertirCancelacion: () => void
}

const ETIQUETA_ESTADO: Record<EstadoSuscripcion, string> = {
  PRUEBA: "Prueba gratis",
  ACTIVA: "Activa",
  VENCIDA: "Vencida",
  CANCELADA: "Cancelada",
  SUSPENDIDA: "Suspendida",
}

const TONO_ESTADO: Record<EstadoSuscripcion, "aviso" | "marca" | "peligro" | "contorno"> = {
  PRUEBA: "aviso",
  ACTIVA: "marca",
  VENCIDA: "peligro",
  CANCELADA: "contorno",
  SUSPENDIDA: "peligro",
}

export function ResumenSuscripcion({
  suscripcion,
  zonaHoraria = "America/Lima",
  esPropietario,
  onPagar,
  onCambiarPlan,
  onCancelar,
  onRevertirCancelacion,
}: ResumenSuscripcionProps) {
  const puedePagar = esPropietario && (suscripcion.estado === "PRUEBA" || suscripcion.estado === "VENCIDA")
  const puedeCambiarPlan = esPropietario && (suscripcion.estado === "ACTIVA" || suscripcion.estado === "PRUEBA")
  const puedeCancelar = esPropietario && (suscripcion.estado === "ACTIVA" || suscripcion.estado === "PRUEBA") && !suscripcion.cancelar_al_finalizar_periodo
  const puedeRevertir = esPropietario && suscripcion.cancelar_al_finalizar_periodo

  return (
    <div className="space-y-4">
      {suscripcion.cancelar_al_finalizar_periodo && (
        <Alert variant="warning">
          <CalendarClock className="size-4" aria-hidden="true" />
          <AlertTitle>Cancelación programada</AlertTitle>
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Se cancelará el {formatearFecha(suscripcion.fin_periodo, zonaHoraria)}. Tu tienda seguirá operando hasta esa fecha.
            </span>
            {puedeRevertir && (
              <Button size="sm" variant="soft" onClick={onRevertirCancelacion}>
                Revertir cancelación
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {suscripcion.estado === "VENCIDA" && (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" aria-hidden="true" />
          <AlertTitle>Suscripción vencida</AlertTitle>
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Tu suscripción está vencida y la tienda no se encuentra operativa. Paga para reactivar las ventas.
            </span>
            {puedePagar && (
              <Button size="sm" variant="danger" onClick={onPagar}>
                Reactivar suscripción
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-[17px] font-bold text-foreground">
                Plan {suscripcion.nombre_plan}
              </CardTitle>
              <CardDescription className="text-[13px] text-muted-foreground">
                Ciclo {suscripcion.ciclo === "ANUAL" ? "anual" : "mensual"}
              </CardDescription>
            </div>
            <Badge variant="estado" tono={TONO_ESTADO[suscripcion.estado] ?? "contorno"}>
              {ETIQUETA_ESTADO[suscripcion.estado] ?? suscripcion.estado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-muted/20 p-3.5">
              <p className="text-[11.5px] font-medium text-muted-foreground">Precio pactado</p>
              <p className="mt-1 text-[17px] font-extrabold text-foreground">
                {formatearDinero(suscripcion.precio_pactado, suscripcion.moneda)}
                <span className="text-[12px] font-normal text-muted-foreground">
                  {" "}/ {suscripcion.ciclo === "ANUAL" ? "año" : "mes"}
                </span>
              </p>
            </div>

            <div className="rounded-xl border bg-muted/20 p-3.5">
              <p className="text-[11.5px] font-medium text-muted-foreground">Inicio de periodo</p>
              <p className="mt-1 text-[13.5px] font-bold text-foreground">
                {formatearFecha(suscripcion.inicio_periodo, zonaHoraria)}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/20 p-3.5">
              <p className="text-[11.5px] font-medium text-muted-foreground">Fin de periodo</p>
              <p className="mt-1 text-[13.5px] font-bold text-foreground">
                {formatearFecha(suscripcion.fin_periodo, zonaHoraria)}
              </p>
            </div>

            {suscripcion.fecha_fin_prueba ? (
              <div className="rounded-xl border bg-muted/20 p-3.5">
                <p className="text-[11.5px] font-medium text-muted-foreground">Fin de prueba gratuita</p>
                <p className="mt-1 text-[13.5px] font-bold text-foreground">
                  {formatearFecha(suscripcion.fecha_fin_prueba, zonaHoraria)}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/20 p-3.5">
                <p className="text-[11.5px] font-medium text-muted-foreground">Renovación</p>
                <p className="mt-1 flex items-center gap-1.5 text-[13.5px] font-bold text-foreground">
                  {suscripcion.cancelar_al_finalizar_periodo ? (
                    <span className="text-destructive-text">No se renovará</span>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
                      <span>Automática</span>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Acciones para el propietario */}
          {esPropietario && (
            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
              {puedePagar && (
                <Button onClick={onPagar}>
                  {suscripcion.estado === "VENCIDA" ? "Reactivar suscripción" : "Pagar suscripción"}
                </Button>
              )}
              {puedeCambiarPlan && (
                <Button variant="neutral" onClick={onCambiarPlan}>
                  Cambiar de plan
                </Button>
              )}
              {puedeCancelar && (
                <Button variant="neutral" onClick={onCancelar}>
                  Cancelar suscripción
                </Button>
              )}
              {puedeRevertir && (
                <Button variant="outline" onClick={onRevertirCancelacion}>
                  Revertir cancelación
                </Button>
              )}
            </div>
          )}

          {!esPropietario && (
            <p className="text-[12px] text-muted-foreground">
              Solo la persona con rol de Propietario puede pagar, cambiar de plan o cancelar la suscripción.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
