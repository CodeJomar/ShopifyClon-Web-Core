import type { ComponentType } from "react"

import { Cup403Illustration, Cup404Illustration, Cup429Illustration, Cup500Illustration } from "./components/ilustraciones"

/** Códigos que tienen pantalla propia; cualquier otro error se muestra como 500. */
export type CodigoError = 403 | 404 | 429 | 500

export interface DefinicionError {
  titulo: string
  descripcion: string
  ilustracion: ComponentType<{ className?: string }>
  /** Si tiene sentido volver a intentar (un 403 o un 404 no cambian al reintentar). */
  reintentable: boolean
}

/**
 * Catálogo de errores: agregar una pantalla nueva es agregar una entrada aquí (y su ilustración).
 * No hay una ruta por error: `ErrorView` pinta la definición que corresponde al código.
 */
export const ERRORES: Record<CodigoError, DefinicionError> = {
  403: {
    titulo: "esta mesa está reservada.",
    descripcion: "Tu cargo no incluye el permiso para esta sección. Si crees que es un error, pídeselo al encargado del local.",
    ilustracion: Cup403Illustration,
    reintentable: false,
  },
  404: {
    titulo: "aquí también hay buen café.",
    descripcion: "Pero la página que buscas no existe o el enlace se preparó de forma incorrecta.",
    ilustracion: Cup404Illustration,
    reintentable: false,
  },
  429: {
    titulo: "la cafetera necesita un respiro.",
    descripcion: "Has enviado demasiadas solicitudes seguidas. Espera un momento antes de pedir otra taza.",
    ilustracion: Cup429Illustration,
    reintentable: true,
  },
  500: {
    titulo: "se nos derramó el espresso.",
    descripcion: "Ocurrió un fallo inesperado, pero ya estamos limpiando la barra. Intenta de nuevo en unos segundos.",
    ilustracion: Cup500Illustration,
    reintentable: true,
  },
}

export const esCodigoConocido = (codigo: number): codigo is CodigoError => codigo in ERRORES
