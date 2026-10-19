"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import type { AvisoSesionDto } from "@/dtos/auth"
import { toast } from "@/shared/components/ui/toast"

/**
 * Muestra los avisos que la API entrega a la sesión activa (latido de actividad y consulta de sesión). Hoy hay uno:
 * alguien con la contraseña intentó iniciar sesión en la cuenta. El aviso es de peligro y su texto «cambia tu
 * contraseña en tu perfil» es un enlace al perfil. Un intento NO cierra la sesión; si la otra persona confirma el
 * reemplazo, esta sesión se invalida y la web vuelve al login.
 */
export function useAvisosSesion(): (avisos: AvisoSesionDto[] | undefined) => void {
  const router = useRouter()
  return React.useCallback(
    (avisos) => {
      for (const aviso of avisos ?? []) {
        if (aviso.tipo !== "intento_inicio_sesion") continue
        const quien =
          aviso.intentos > 1
            ? `Alguien intentó entrar ${aviso.intentos} veces con tus datos mientras tienes la sesión abierta.`
            : "Alguien intentó entrar con tus datos mientras tienes la sesión abierta."
        toast.add({
          type: "error",
          title: "Intento de inicio de sesión en tu cuenta",
          description: (
            <>
              {quien} Si no fuiste tú,{" "}
              <button
                type="button"
                onClick={() => router.push("/perfil")}
                className="cursor-pointer font-semibold text-red-600 underline underline-offset-2 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                cambia tu contraseña en tu perfil
              </button>
              .
            </>
          ),
          timeout: 20000,
        })
      }
    },
    [router],
  )
}
