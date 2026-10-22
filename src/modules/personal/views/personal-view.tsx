"use client"

import * as React from "react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { Pencil, Plus, UserMinus, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { formatearFecha } from "@/shared/utils/fechas"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { PERMISO, ROL } from "@/shared/constants/permisos"
import type { MiembroPersonalDto } from "@/dtos/personal"
import type { ErrorApi } from "@/lib/api/error-api"
import { personalAction } from "../actions/personal.actions"
import { AgregarPersonalForm, FORMULARIO_AGREGAR_PERSONAL } from "../components/agregar-personal-form"
import { CambiarRolForm, FORMULARIO_CAMBIAR_ROL } from "../components/cambiar-rol-form"
import { QuitarPersonalForm, FORMULARIO_QUITAR_PERSONAL } from "../components/quitar-personal-form"

const NOMBRE_ROL: Record<string, string> = {
  PROPIETARIO: "Propietario",
  ADMINISTRADOR: "Administrador",
  GESTOR_CATALOGO: "Gestor de catálogo",
  GESTOR_PEDIDOS: "Gestor de pedidos",
}

const QUE_PUEDE: Record<string, string> = {
  PROPIETARIO: "Todo: tienda, suscripción, personal, catálogo, órdenes y métricas.",
  ADMINISTRADOR: "Configurar la tienda, gestionar personal, catálogo, inventario, cupones, envíos y órdenes.",
  GESTOR_CATALOGO: "Productos, categorías e inventario.",
  GESTOR_PEDIDOS: "Ver y gestionar órdenes, y cancelarlas.",
}

const iniciales = (m: MiembroPersonalDto) => ((m.nombres.trim()[0] ?? "") + (m.apellidos.trim()[0] ?? "")).toUpperCase() || "?"

export function PersonalView() {
  const { tienda, rol: rolSesion, puede } = usePanel()
  const puedeGestionar = puede(PERMISO.PERSONAL_GESTIONAR)
  const zonaHoraria = tienda?.zona_horaria ?? "America/Lima"

  const [personal, setPersonal] = React.useState<MiembroPersonalDto[] | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const [panelAgregar, setPanelAgregar] = React.useState(false)
  const [panelEditar, setPanelEditar] = React.useState<{ abierto: boolean; miembro?: MiembroPersonalDto }>({
    abierto: false,
  })
  const [panelQuitar, setPanelQuitar] = React.useState<{ abierto: boolean; miembro?: MiembroPersonalDto }>({
    abierto: false,
  })

  const cargar = React.useCallback(async () => {
    const res = await personalAction()
    if (res.ok) {
      setError(null)
      setPersonal(res.datos)
    } else {
      setError(res.error)
    }
  }, [])

  React.useEffect(() => {
    let cancelado = false
    personalAction().then((res) => {
      if (cancelado) return
      if (res.ok) {
        setError(null)
        setPersonal(res.datos)
      } else {
        setError(res.error)
      }
    })
    return () => {
      cancelado = true
    }
  }, [])

  // Determina si el usuario en sesión puede modificar a este miembro
  const puedeGestionarMiembro = (miembro: MiembroPersonalDto) => {
    if (!puedeGestionar) return false
    // Nadie puede modificar al propietario (PER-003)
    if (miembro.rol === ROL.PROPIETARIO) return false

    // Si el usuario en sesión es administrador, solo puede gestionar gestores (PER-004)
    if (rolSesion === ROL.ADMINISTRADOR) {
      return miembro.rol === ROL.GESTOR_CATALOGO || miembro.rol === ROL.GESTOR_PEDIDOS
    }

    // El propietario puede gestionar a todos salvo a sí mismo
    if (rolSesion === ROL.PROPIETARIO) {
      return true
    }

    return false
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Personal"
        descripcion={personal ? `${personal.length} ${personal.length === 1 ? "persona" : "personas"} con acceso a tu tienda.` : "Quién puede entrar a administrar tu tienda y con qué permisos."}
        acciones={
          puedeGestionar && (
            <Button onClick={() => setPanelAgregar(true)} leftIcon={<Plus aria-hidden="true" />}>
              Agregar personal
            </Button>
          )
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar el personal</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!personal && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Cargando personal">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {personal && personal.length === 0 && (
        <Card>
          <CardContent>
            <EstadoVacio
              icono={Users}
              titulo="No hay miembros del personal"
              descripcion="Agrega colaboradores a tu tienda para delegar responsabilidades."
              accion={puedeGestionar ? { texto: "Agregar personal", onClick: () => setPanelAgregar(true) } : undefined}
            />
          </CardContent>
        </Card>
      )}

      {personal && personal.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {personal.map((miembro) => {
            const tieneAcciones = puedeGestionarMiembro(miembro)
            const esDueno = miembro.rol === ROL.PROPIETARIO

            return (
              <li key={miembro.usuario_id}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-12">
                        <AvatarFallback>{iniciales(miembro)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-extrabold text-foreground">
                          {miembro.nombres} {miembro.apellidos}
                        </p>
                        <p className="truncate text-[12.5px] text-muted-foreground">{miembro.correo_electronico}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Badge variant="estado" tono={esDueno ? "marca" : "contorno"}>
                        {NOMBRE_ROL[miembro.rol] ?? miembro.rol}
                      </Badge>
                      <p className="text-[12.5px] leading-snug text-muted-foreground">{QUE_PUEDE[miembro.rol] ?? ""}</p>
                    </div>
                    <p className="text-[12px] text-muted-foreground">Desde el {formatearFecha(miembro.desde, zonaHoraria)}</p>

                    {tieneAcciones && (
                      <div className="mt-auto flex flex-wrap gap-2 border-t border-border/60 pt-3">
                        <Button size="sm" variant="neutral" onClick={() => setPanelEditar({ abierto: true, miembro })} leftIcon={<Pencil aria-hidden="true" />}>
                          Cambiar rol
                        </Button>
                        <Button size="sm" variant="danger-outline" onClick={() => setPanelQuitar({ abierto: true, miembro })} leftIcon={<UserMinus aria-hidden="true" />}>
                          Quitar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      {/* Panel Agregar */}
      <FormPanel
        open={panelAgregar}
        onOpenChange={setPanelAgregar}
        title="Agregar personal"
        footer={
          <>
            <Button type="button" variant="neutral" onClick={() => setPanelAgregar(false)}>
              Cancelar
            </Button>
            <Button type="submit" form={FORMULARIO_AGREGAR_PERSONAL}>
              Guardar
            </Button>
          </>
        }
      >
        <AgregarPersonalForm
          rolUsuarioActual={rolSesion}
          onGuardado={() => {
            setPanelAgregar(false)
            cargar()
          }}
        />
      </FormPanel>

      {/* Panel Cambiar Rol */}
      <FormPanel
        open={panelEditar.abierto}
        onOpenChange={(abierto) => setPanelEditar((prev) => ({ ...prev, abierto }))}
        title="Cambiar rol de personal"
        footer={
          <>
            <Button
              type="button"
              variant="neutral"
              onClick={() => setPanelEditar({ abierto: false })}
            >
              Cancelar
            </Button>
            <Button type="submit" form={FORMULARIO_CAMBIAR_ROL}>
              Guardar cambios
            </Button>
          </>
        }
      >
        {panelEditar.miembro && (
          <CambiarRolForm
            miembro={panelEditar.miembro}
            rolUsuarioActual={rolSesion}
            onGuardado={() => {
              setPanelEditar({ abierto: false })
              cargar()
            }}
          />
        )}
      </FormPanel>

      {/* Panel Quitar Personal */}
      <FormPanel
        open={panelQuitar.abierto}
        onOpenChange={(abierto) => setPanelQuitar((prev) => ({ ...prev, abierto }))}
        title="¿Quitar a esta persona del personal?"
        footer={
          <>
            <Button
              type="button"
              variant="neutral"
              onClick={() => setPanelQuitar({ abierto: false })}
            >
              Cancelar
            </Button>
            <Button type="submit" form={FORMULARIO_QUITAR_PERSONAL} variant="danger">
              Confirmar y quitar
            </Button>
          </>
        }
      >
        {panelQuitar.miembro && (
          <QuitarPersonalForm
            miembro={panelQuitar.miembro}
            onGuardado={() => {
              setPanelQuitar({ abierto: false })
              cargar()
            }}
          />
        )}
      </FormPanel>
    </div>
  )
}
