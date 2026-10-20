"use client"

import { ShieldAlert } from "lucide-react"

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

interface SesionActivaModalProps {
  open: boolean
  enviando: boolean
  /** Cierra la sesión anterior e inicia esta. */
  onContinuar: () => void
  /** Aborta el inicio de sesión. */
  onCancelar: () => void
  /** Lleva a cambiar la contraseña (por si quien intenta entrar no es el dueño de la cuenta). */
  onNoSoyYo: () => void
}

/** Se muestra cuando la cuenta ya tiene una sesión activa en otro navegador, dispositivo o ventana de incógnito. */
export function SesionActivaModal({ open, enviando, onContinuar, onCancelar, onNoSoyYo }: SesionActivaModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={() => undefined}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-warning/12 text-warning-text ring-warning/25   ">
            <ShieldAlert strokeWidth={1.75} />
          </AlertDialogMedia>
          <AlertDialogTitle>Esta cuenta ya tiene una sesión activa</AlertDialogTitle>
          <AlertDialogDescription>
            Hay una sesión abierta en otro dispositivo o navegador. Si continúas, esa sesión se cerrará y se iniciará una nueva aquí.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button type="button" variant="neutral" size="sm" disabled={enviando} onClick={onCancelar} className="cursor-pointer">
            Cancelar
          </Button>
          <Button type="button" size="sm" loading={enviando} onClick={onContinuar} className="cursor-pointer">
            Continuar
          </Button>
        </AlertDialogFooter>
        <button
          type="button"
          onClick={onNoSoyYo}
          disabled={enviando}
          className="mt-1 w-full cursor-pointer text-center text-xs font-medium text-muted-foreground underline-offset-2 hover:text-brand-text hover:underline disabled:opacity-50 "
        >
          ¿No eres tú? Cambiar contraseña
        </button>
      </AlertDialogContent>
    </AlertDialog>
  )
}
