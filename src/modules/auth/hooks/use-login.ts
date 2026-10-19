"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { toast } from "@/shared/components/ui/toast"
import { permisoDeRuta, rutaInicial } from "@/shared/constants/navegacion"
import { puedeCon } from "@/shared/constants/permisos"
import { loginAction } from "../actions/auth.actions"
import { loginSchema, type LoginValues } from "../schema"

/**
 * A dónde ir tras iniciar sesión. Solo se aceptan rutas internas (evita redirecciones abiertas) y solo si el cargo
 * puede abrirlas; si no, a Inicio, que lista los accesos que su cargo sí puede usar.
 */
function destinoSeguro(siguiente: string | undefined, permisos: readonly string[]): string {
  const puede = puedeCon(permisos)
  const esInterna = Boolean(siguiente) && siguiente !== "/" && siguiente!.startsWith("/") && !siguiente!.startsWith("//") && !siguiente!.startsWith("/login")
  if (esInterna) {
    const requisito = permisoDeRuta(siguiente!.split("?")[0])
    if (!requisito || puede(requisito)) return siguiente!
  }
  return rutaInicial(puede) ?? "/dashboard"
}

export function useLogin(siguiente?: string) {
  const router = useRouter()
  // Segundos restantes del bloqueo temporal (429); el botón se habilita al llegar a 0.
  const [bloqueoSegundos, setBloqueoSegundos] = React.useState(0)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  // Credenciales que esperan la decisión del modal cuando la cuenta ya tiene una sesión activa (solo en memoria).
  const [pendiente, setPendiente] = React.useState<LoginValues | null>(null)
  const [reemplazando, setReemplazando] = React.useState(false)

  const bloqueoActivo = bloqueoSegundos > 0
  React.useEffect(() => {
    if (!bloqueoActivo) return
    const intervalo = setInterval(() => setBloqueoSegundos((s) => s - 1), 1000)
    return () => clearInterval(intervalo)
  }, [bloqueoActivo])

  /**
   * Inicia sesión. Si la cuenta ya tiene una sesión activa en otro navegador o dispositivo, la API responde 409 y no
   * muestra error: se abre el modal para que la persona decida (continuar, cancelar o cambiar la contraseña).
   */
  const intentar = async ({ email, password }: LoginValues, reemplazarSesion: boolean) => {
    const id = toast.add({ type: "loading", title: "Iniciando sesión...", timeout: 0 })
    const res = await loginAction(email, password, reemplazarSesion)

    if (res.isOk()) {
      toast.update(id, { type: "success", title: `Bienvenido, ${res.data.usuario.nombre ?? "de nuevo"}`, timeout: 5000 })
      setPendiente(null)
      router.replace(destinoSeguro(siguiente, res.data.usuario.permisos))
      return
    }

    if (res.httpStatusCode === 409) {
      toast.close(id)
      setPendiente({ email, password })
      return
    }

    const restantes = res.intentosRestantes
    const aviso =
      res.httpStatusCode === 401 && restantes !== undefined ? ` Te quedan ${restantes} intento${restantes === 1 ? "" : "s"}.` : ""
    toast.update(id, {
      type: "error",
      title: res.httpStatusCode === 429 ? "Acceso bloqueado temporalmente" : "No se pudo iniciar sesión",
      description: res.getMessage() + aviso,
      timeout: 5000,
    })
    setPendiente(null)
    if (res.httpStatusCode === 429) setBloqueoSegundos(res.retryAfterSegundos ?? 60)
    else form.resetField("password")
  }

  // Mientras se envía, el botón queda deshabilitado (impide también el envío con Enter).
  const submit = form.handleSubmit((valores) => intentar(valores, false))

  const sesionActiva = {
    abierta: pendiente !== null,
    enviando: reemplazando,
    /** Cierra la sesión anterior e inicia esta. */
    continuar: async () => {
      if (!pendiente) return
      setReemplazando(true)
      await intentar(pendiente, true)
      setReemplazando(false)
    },
    /** Aborta el inicio de sesión. */
    cancelar: () => {
      setPendiente(null)
      form.resetField("password")
    },
    /** Quien intenta entrar no es el dueño: va a recuperar la contraseña. */
    noSoyYo: () => {
      setPendiente(null)
      router.push("/forgot-password")
    },
  }

  return { form, submit, bloqueoSegundos, sesionActiva }
}
