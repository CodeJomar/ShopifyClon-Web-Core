"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import type { LimitesSuscripcionDto, UsoSuscripcionDto } from "@/dtos/suscripcion"
import { Package, Users } from "lucide-react"

interface UsoPlanProps {
  uso: UsoSuscripcionDto
  limites: LimitesSuscripcionDto
}

export function UsoPlan({ uso, limites }: UsoPlanProps) {
  const productosIlimitados = limites.productos == null
  const personalIlimitado = limites.personal == null

  const porcentajeProductos = !productosIlimitados && limites.productos && limites.productos > 0
    ? Math.min(100, Math.round((uso.productos / limites.productos) * 100))
    : 0

  const porcentajePersonal = !personalIlimitado && limites.personal && limites.personal > 0
    ? Math.min(100, Math.round((uso.personal / limites.personal) * 100))
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[16px] font-bold text-foreground">Uso del plan</CardTitle>
        <CardDescription className="text-[13px] text-muted-foreground">
          Consumo actual frente a los límites máximos permitidos por tu plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Productos */}
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-[13.5px] font-semibold text-foreground">Productos activos</span>
              </div>
              <span className="text-[13px] font-extrabold text-foreground">
                {uso.productos} / {productosIlimitados ? "Ilimitados" : (limites.productos?.toLocaleString("es-PE") ?? "0")}
              </span>
            </div>
            {!productosIlimitados && limites.productos != null && (
              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${porcentajeProductos}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {porcentajeProductos} % utilizado
                </p>
              </div>
            )}
            {productosIlimitados && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Tu plan actual te permite crear catálogo ilimitado.
              </p>
            )}
          </div>

          {/* Personal */}
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-[13.5px] font-semibold text-foreground">Equipo de trabajo</span>
              </div>
              <span className="text-[13px] font-extrabold text-foreground">
                {uso.personal} / {personalIlimitado ? "Ilimitado" : (limites.personal ?? "0")}
              </span>
            </div>
            {!personalIlimitado && limites.personal != null && (
              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${porcentajePersonal}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {porcentajePersonal} % utilizado
                </p>
              </div>
            )}
            {personalIlimitado && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Tu plan actual te permite invitar colaboradores ilimitados.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
