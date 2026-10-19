import { toast } from "@/shared/components/ui/toast"
import { BaseResponse } from "@/dtos/core/baseResponse.dto"

interface ToastResponseOptions<R> {
  /** Título mientras la petición está en curso. */
  loading: string
  /** Título al terminar bien; puede depender de la respuesta. */
  success: string | ((respuesta: R) => string)
  /** Descripción opcional del toast de éxito. */
  successDescription?: string
  /** Título cuando la API responde con error; puede depender de la respuesta (p. ej. por código HTTP). */
  error?: string | ((respuesta: R) => string)
  /** Detalle del error. Por defecto, los mensajes que devuelve el backend. */
  errorDescription?: (respuesta: R) => string
}

/**
 * Muestra el ciclo completo de una petición a la API en un toast (cargando → éxito / error) y devuelve la
 * respuesta para que quien llama continúe con su flujo (`respuesta.isOk()`). El detalle del error sale de los
 * mensajes del backend, así que no hay que repetirlo en cada formulario.
 */
export async function toastResponse<R extends BaseResponse>(
  peticion: Promise<R>,
  {
    loading,
    success,
    successDescription,
    error = "No se pudo completar la acción",
    errorDescription = (respuesta) => respuesta.getMessage(),
  }: ToastResponseOptions<R>,
): Promise<R> {
  // Las respuestas de error de la API se convierten en rechazo para que toast.promise las muestre como error.
  const evaluada = peticion.then((respuesta) => {
    if (!respuesta.isOk()) throw respuesta
    return respuesta
  })

  toast
    .promise(evaluada, {
      loading: { title: loading },
      success: (respuesta) => ({
        title: typeof success === "function" ? success(respuesta) : success,
        description: successDescription,
      }),
      error: (causa: unknown) => {
        if (!(causa instanceof BaseResponse)) return { title: error as string, description: "Ocurrió un error inesperado." }
        const respuesta = causa as R
        return {
          title: typeof error === "function" ? error(respuesta) : error,
          description: errorDescription(respuesta),
        }
      },
    })
    .catch(() => undefined) // el rechazo ya se muestra en el toast; el flujo continúa abajo con la respuesta

  try {
    return await evaluada
  } catch (causa) {
    return causa as R
  }
}
