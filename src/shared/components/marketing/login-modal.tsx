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
        <div className="vidrio neon-anim max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[28px] bg-[#0b1519]/85 p-7 backdrop-blur-2xl sm:p-8">
          <DialogTitle className="sr-only">Iniciar sesión</DialogTitle>
          <DialogDescription className="sr-only">Entra a tu cuenta de OTemu.</DialogDescription>
          <LoginView
            alEntrar={() => {
              setAbierto(false)
              alEntrar?.()
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
