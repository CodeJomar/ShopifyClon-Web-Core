"use client"

import * as React from "react"
import { RefreshCw, ServerOff, WifiOff } from "lucide-react"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { Button } from "@/shared/components/ui/button"
import { toast } from "@/shared/components/ui/toast"
import { useVigilanciaConexion } from "@/shared/hooks/use-estado-conexion"

/**
 * Informe a pantalla completa cuando la web está encendida pero no puede trabajar:
 *  - sin internet en este equipo, o
 *  - hay internet, pero el servidor (API) no responde.
 * No se puede cerrar a mano: desaparece solo cuando la conexión vuelve (se reintenta cada 5 s). Los datos que ya
 * estaban en pantalla no se pierden. Los errores puntuales (403, 404, 429, 500 de la API…) NO pasan por aquí: esos
 * se muestran como aviso o con las páginas de error.
 */
export function EstadoConexionModal() {
  const { estado, hayProblema, reintentando, reintentar, reconectado } = useVigilanciaConexion()

  React.useEffect(() => {
    if (reconectado) toast.add({ type: "success", title: "Conexión restablecida" })
  }, [reconectado])

  const sinInternet = estado.sinInternet
  const Icono = sinInternet ? WifiOff : ServerOff

  return (
    <AlertDialog open={hayProblema} onOpenChange={() => undefined}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-amber-50 text-amber-600 ring-amber-50/60 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-950/30">
            <Icono strokeWidth={1.75} />
          </AlertDialogMedia>
          <AlertDialogTitle>{sinInternet ? "Sin conexión a internet" : "No hay conexión con el servidor"}</AlertDialogTitle>
          <AlertDialogDescription>
            {sinInternet
              ? "Este equipo perdió su conexión. Revisa el Wi‑Fi o el cable de red; seguiremos intentando y esta ventana se cerrará sola."
              : "El sistema está encendido, pero el servidor no responde. Seguiremos intentando y esta ventana se cerrará sola cuando vuelva."}
          </AlertDialogDescription>
          <p className="text-xs text-slate-500 dark:text-stone-400">Lo que ya tenías en pantalla no se pierde.</p>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            type="button"
            variant="neutral"
            size="sm"
            disabled={reintentando}
            onClick={() => void reintentar()}
            leftIcon={<RefreshCw className={reintentando ? "size-4 animate-spin" : "size-4"} />}
            className="cursor-pointer"
          >
            {reintentando ? "Comprobando…" : "Reintentar ahora"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
