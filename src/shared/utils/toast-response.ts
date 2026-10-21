import { toast } from "@/shared/components/ui/toast"
import type { Resultado } from "@/lib/api/resultado"
import type { ErrorApi } from "@/lib/api/error-api"

interface ToastResponseOptions<T> {
  /** Título mientras la petición está en curso. */
  loading: string
  /** Título al terminar bien; puede depender de los datos. */
  success: string | ((datos: T) => string)
  /** Descripción opcional del toast de éxito. */
  successDescription?: string
  /** Título cuando la API responde con error; puede depender del error (p. ej. por código HTTP). */
  error?: string | ((error: ErrorApi) => string)
  /** Detalle del error. Por defecto, el mensaje que devuelve el backend. */
  errorDescription?: (error: ErrorApi) => string
}

/**
 * Muestra el ciclo completo de una petición en un toast (cargando → éxito / error) y devuelve el resultado para que
 * quien llama continúe su flujo (`if (res.ok)`). El detalle del error sale del mensaje del backend.
 */
export async function toastResponse<T>(
  peticion: Promise<Resultado<T>>,
  {
    loading,
    success,
    successDescription,
    error = "No se pudo completar la acción",
    errorDescription = (causa) => causa.message,
  }: ToastResponseOptions<T>,
): Promise<Resultado<T>> {
  const evaluada = peticion.then((res) => {
    if (!res.ok) throw res
    return res
  })

  toast
    .promise(evaluada, {
      loading: { title: loading },
      success: (res) => ({
        title: typeof success === "function" ? success(res.ok ? res.datos : (undefined as T)) : success,
        description: successDescription,
      }),
      error: (causa: unknown) => {
        const res = causa as Resultado<T>
        if (!res || res.ok) return { title: error as string, description: "Ocurrió un error inesperado." }
        return {
          title: typeof error === "function" ? error(res.error) : error,
          description: errorDescription(res.error),
        }
      },
    })
    .catch(() => undefined) // el rechazo ya se muestra en el toast; el flujo continúa abajo con el resultado

  try {
    return await evaluada
  } catch (causa) {
    return causa as Resultado<T>
  }
}
