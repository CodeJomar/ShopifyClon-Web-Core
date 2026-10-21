"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ContrasenaForm } from "../components/contrasena-form"

export function SeguridadView() {
  return (
    <div className="max-w-[720px]">
      <Card>
        <CardHeader>
          <CardTitle>Contraseña</CardTitle>
          <CardDescription>Cambia tu contraseña cuando lo necesites.</CardDescription>
        </CardHeader>
        <CardContent>
          <ContrasenaForm />
        </CardContent>
      </Card>
    </div>
  )
}
