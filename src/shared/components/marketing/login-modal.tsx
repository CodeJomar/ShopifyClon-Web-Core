"use client"

import * as React from "react"
import { LogIn } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog"
import { LoginView } from "@/modules/auth"

/** Icono de acceso de la cabecera: abre el inicio de sesión en una ventana de vidrio sobre la página actual. */
export function LoginModal({ alEntrar }: { alEntrar?: () => void }) {
  const [abierto, setAbierto] = React.useState(false)
  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger
        aria-label="Iniciar sesión o crear cuenta"
        title="Iniciar sesión"
        className="flex size-10 items-center justify-center rounded-xl border-[1.8px] border-input text-foreground outline-none transition-colors hover:border-primary hover:text-brand-text focus-visible:border-primary"
      >
        <LogIn className="size-[18px]" aria-hidden="true" />
      </DialogTrigger>
      {/* El contenedor del modal conserva su posición fija; el vidrio y el neón van en un div interior (neon-anim fija position: relative). */}
      <DialogContent showCloseButton={false} className="overflow-visible border-0 bg-transparent p-0 shadow-none sm:max-w-[420px]">
        <div className="vidrio neon-anim flex max-h-[calc(100dvh-2rem)] flex-col rounded-[28px] bg-[#0b1519]/85 backdrop-blur-2xl">
          <DialogTitle className="sr-only">Iniciar sesión</DialogTitle>
          <DialogDescription className="sr-only">Entra a tu cuenta de OTemu.</DialogDescription>
          {/* Solo el cuerpo se desplaza (y solo en vertical); el vidrio y el neón no. */}
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-7 sm:p-8">
            <LoginView
              alEntrar={() => {
                setAbierto(false)
                alEntrar?.()
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
