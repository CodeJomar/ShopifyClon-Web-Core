"use client"

import { ERRORES, type CodigoError } from "../catalogo"
import { ErrorLayout } from "../components/error-layout"
import { codigoDeError } from "../detectar-error"

interface ErrorViewProps {
  /** Código a mostrar; si no se envía, se deduce de `error`. */
  codigo?: CodigoError
  /** Error capturado (boundary, respuesta de la API…) del que se deduce el código. */
  error?: unknown
  /** Se ofrece «Reintentar» solo si el error es de los que pueden cambiar al repetir (429, 500). */
  onReintentar?: () => void
  rutaInicio?: string
  embebido?: boolean
}

/**
 * Pantalla de error única y dinámica: el contenido sale del catálogo según el código. Se usa en los límites de
 * error de Next (`error.tsx`, `not-found.tsx`), en el acceso denegado del workspace y en cualquier sección que
 * quiera mostrar un fallo con `embebido`.
 */
export function ErrorView({ codigo, error, onReintentar, rutaInicio, embebido }: ErrorViewProps) {
  const codigoFinal = codigo ?? codigoDeError(error)
  const definicion = ERRORES[codigoFinal]
  const Ilustracion = definicion.ilustracion

  return (
    <ErrorLayout
      codigo={codigoFinal}
      titulo={definicion.titulo}
      descripcion={definicion.descripcion}
      ilustracion={<Ilustracion />}
      rutaInicio={rutaInicio}
      onReintentar={definicion.reintentable ? onReintentar : undefined}
      embebido={embebido}
    />
  )
}
