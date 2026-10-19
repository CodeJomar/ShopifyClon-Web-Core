"use client"

import * as React from "react"
import { LogOut, Mail, User } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { toast } from "@/shared/components/ui/toast"
import { useConfirm } from "@/shared/providers/confirm-provider"

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Demostración del estándar de overlays: toast (feedback), confirm (decisión) y panel (formularios). */
export function OverlaysDemo() {
  const confirm = useConfirm()
  const [panelAbierto, setPanelAbierto] = React.useState(false)

  const probarConfirm = async (tipo: "default" | "destructive" | "personalizado") => {
    const aceptado = await confirm(
      tipo === "personalizado"
        ? {
            variant: "warning",
            icon: LogOut,
            title: "¿Cerrar sesión?",
            description: "Tendrás que volver a ingresar tus credenciales.",
            confirmText: "Sí, salir",
          }
        : { variant: tipo },
    )
    toast.add({
      type: aceptado ? "success" : "info",
      title: aceptado ? "Acción confirmada" : "Acción cancelada",
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-3xl shadow-sm border">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">Toast — resultado de una acción</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="success-outline" size="sm" onClick={() => toast.add({ type: "success", title: "Producto guardado", description: "Los cambios ya están en el menú." })}>
            Éxito
          </Button>
          <Button variant="danger-outline" size="sm" onClick={() => toast.add({ type: "error", title: "No se pudo guardar", description: "Revisa tu conexión e inténtalo de nuevo." })}>
            Error
          </Button>
          <Button variant="warning-outline" size="sm" onClick={() => toast.add({ type: "warning", title: "Stock bajo", description: "Quedan 3 unidades de Croissant." })}>
            Advertencia
          </Button>
          <Button variant="info-outline" size="sm" onClick={() => toast.add({ type: "info", title: "Nueva comanda en KDS" })}>
            Info
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.promise(esperar(1800), {
                loading: { title: "Guardando pedido..." },
                success: { title: "Pedido enviado a cocina" },
                error: { title: "No se pudo enviar" },
              })
            }
          >
            Promise (éxito)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.promise(esperar(1800).then(() => Promise.reject(new Error("fallo simulado"))), {
                loading: { title: "Guardando pedido..." },
                success: { title: "Pedido enviado a cocina" },
                error: { title: "No se pudo enviar", description: "El servidor no respondió." },
              })
            }
          >
            Promise (error)
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">Confirm — decisión del usuario (AlertDialog)</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="default" size="sm" onClick={() => probarConfirm("default")}>
            Confirmación normal
          </Button>
          <Button variant="danger" size="sm" onClick={() => probarConfirm("destructive")}>
            Confirmación destructiva
          </Button>
          <Button variant="warning" size="sm" onClick={() => probarConfirm("personalizado")}>
            Confirmación personalizada
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">Panel — formularios (crear, editar, ver detalle)</p>
        <Button variant="ghost" size="sm" onClick={() => setPanelAbierto(true)}>
          Abrir panel lateral
        </Button>
      </div>

      <FormPanel
        open={panelAbierto}
        onOpenChange={setPanelAbierto}
        title="Nuevo empleado"
        description="Recibirá un correo para activar su cuenta y definir su contraseña."
        footer={
          <>
            <Button variant="neutral" size="md" onClick={() => setPanelAbierto(false)}>
              Cancelar
            </Button>
            <Button
              variant="default"
              size="md"
              onClick={() => {
                setPanelAbierto(false)
                toast.add({ type: "success", title: "Empleado creado" })
              }}
            >
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FloatingInput label="Nombre completo" leftIcon={<User size={18} />} />
          <FloatingInput label="Correo Electrónico" type="email" leftIcon={<Mail size={18} />} />
        </div>
      </FormPanel>
    </div>
  )
}
