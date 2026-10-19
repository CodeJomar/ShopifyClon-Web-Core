"use client"

import * as React from "react"

import { ERRORES, ErrorView, type CodigoError } from "@/modules/errors"
import { Button } from "@/shared/components/ui/button"

const CODIGOS = Object.keys(ERRORES).map(Number) as CodigoError[]

/** Vista previa de las pantallas de error del catálogo: un solo componente, el código decide el contenido. */
export function ErroresDemo() {
  const [codigo, setCodigo] = React.useState<CodigoError>(404)

  return (
    <div className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {CODIGOS.map((c) => (
          <Button key={c} type="button" size="sm" variant={c === codigo ? "default" : "outline"} onClick={() => setCodigo(c)}>
            {c}
          </Button>
        ))}
      </div>
      <div className="h-[520px] overflow-hidden rounded-2xl border">
        <ErrorView codigo={codigo} embebido onReintentar={() => undefined} />
      </div>
    </div>
  )
}
