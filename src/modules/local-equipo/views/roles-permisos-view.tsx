"use client"

import * as React from "react"
import { Plus, Users } from "lucide-react"

import { useCan } from "@/modules/auth"
import { EstadoError } from "@/shared/components/composed/estado-error"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { Button } from "@/shared/components/ui/button"
import { BarraPaginacion, GrillaAjustada } from "@/shared/components/ui/pagination"
import { ACCION, MODULO } from "@/shared/constants/permisos"
import { usePaginacionAjustada } from "@/shared/hooks"

import { EncabezadoSeccion, GrillaSkeleton, RolCard, RolForm, botonPrimario } from "../components"
import { useRoles } from "../hooks"
import type { Rol, RolDetalle } from "../schema"
import { ALTO_ROL, vistaClass } from "./medidas"

type VistaRoles = { modo: "lista" } | { modo: "crear" } | { modo: "editar"; rol: RolDetalle }

/** Roles (cargos) y sus permisos. */
export function RolesPermisosView() {
  const { puede } = useCan()
  const puedeCrear = puede({ modulo: MODULO.ROLES, accion: ACCION.CREAR })
  const puedeEditar = puede({ modulo: MODULO.ROLES, accion: ACCION.EDITAR })
  const puedeEliminar = puede({ modulo: MODULO.ROLES, accion: ACCION.ELIMINAR })

  const roles = useRoles()
  const [vista, setVista] = React.useState<VistaRoles>({ modo: "lista" })
  const [abriendoId, setAbriendoId] = React.useState<string | null>(null)
  const volver = React.useCallback(() => setVista({ modo: "lista" }), [])

  // Ancho mínimo amplio: 2 columnas en escritorio como el diseño de referencia
  const paginacion = usePaginacionAjustada(roles.roles, { altoItem: ALTO_ROL, anchoMinimo: 400 })

  // Para ver o editar un rol hacen falta sus permisos, que vienen en el detalle
  const abrirRol = async (rol: Rol) => {
    setAbriendoId(rol.id_rol)
    const detalle = await roles.cargarDetalle(rol.id_rol)
    setAbriendoId(null)
    if (detalle) setVista({ modo: "editar", rol: detalle })
  }

  // Vista «Crear nuevo rol» / «Editar permisos» en la misma pantalla
  if (vista.modo !== "lista") {
    const rolEditado = vista.modo === "editar" ? vista.rol : undefined
    return (
      <RolForm
        key={rolEditado?.id_rol ?? "nuevo"}
        rol={rolEditado}
        catalogo={roles.catalogo}
        puedeEditar={rolEditado ? puedeEditar : puedeCrear}
        puedeEliminar={puedeEliminar}
        empleadosAsignados={rolEditado?.total_usuarios ?? 0}
        onGuardar={roles.guardarRol}
        onEliminar={roles.quitarRol}
        onVolver={volver}
      />
    )
  }

  return (
    <div className={vistaClass}>
      <EncabezadoSeccion
        titulo="Gestión de Roles"
        descripcion="Define las responsabilidades y niveles de acceso para tu equipo en Coffy Flow."
        acciones={
          puedeCrear && (
            <Button
              type="button"
              size="sm"
              onClick={() => setVista({ modo: "crear" })}
              disabled={!roles.cargado || roles.catalogo.length === 0}
              leftIcon={<Plus className="size-4" />}
              aria-label="Crear nuevo rol"
              className={botonPrimario}
            >
              <span className="hidden sm:inline">Crear Nuevo Rol</span>
            </Button>
          )
        }
      />

      {roles.error ? (
        <EstadoError mensaje={roles.error} onReintentar={roles.recargar} className="min-h-0 flex-1" />
      ) : !roles.cargado ? (
        <GrillaSkeleton />
      ) : roles.roles.length === 0 ? (
        <EstadoVacio titulo="Sin roles" descripcion="Aún no hay roles registrados." icono={Users} className="min-h-0 flex-1" />
      ) : (
        <>
          <GrillaAjustada paginacion={paginacion} etiqueta="Roles operativos">
            {paginacion.visibles.map((r) => (
              <li key={r.id_rol} className="min-h-0">
                <RolCard rol={r} editable={puedeEditar} abriendo={abriendoId === r.id_rol} onAbrir={() => void abrirRol(r)} />
              </li>
            ))}
          </GrillaAjustada>
          <BarraPaginacion paginacion={paginacion} etiqueta="roles" />
        </>
      )}
    </div>
  )
}
