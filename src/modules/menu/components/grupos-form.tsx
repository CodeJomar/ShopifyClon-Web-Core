"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { FormPanel } from "@/shared/components/composed/form-panel"
import { Button } from "@/shared/components/ui/button"
import { useConfirm } from "@/shared/providers/confirm-provider"

import type { GrupoFormValues, GrupoMenu, OpcionFormValues, OpcionMenu } from "../schema"
import { GrupoFila } from "./grupo-fila"
import { GrupoSheet } from "./grupo-sheet"
import { OpcionSheet } from "./opcion-sheet"

interface GruposFormProps {
  grupos: GrupoMenu[]
  puedeCrear: boolean
  puedeEditar: boolean
  puedeEliminar: boolean
  onGuardarGrupo: (values: GrupoFormValues, id?: string) => Promise<boolean>
  onEliminarGrupo: (grupo: GrupoMenu) => Promise<boolean>
  onGuardarOpcion: (idGrupo: string, values: OpcionFormValues, idOpcion?: string) => Promise<boolean>
  onAlternarOpcion: (idOpcion: string, nombre: string, disponible: boolean) => Promise<boolean>
  onEliminarOpcion: (idOpcion: string, nombre: string) => Promise<boolean>
  onClose: () => void
}

// Panel secundario abierto sobre la lista: crear/editar un grupo o una opción
type Secundario =
  | { tipo: "grupo"; grupo?: GrupoMenu }
  | { tipo: "opcion"; idGrupo: string; opcion?: OpcionMenu }
  | null

/**
 * Panel lateral para administrar los grupos de personalización. La lista solo muestra y ordena; cada alta o edición
 * (de un grupo o de una opción) se hace en su propio panel para que no se vea todo junto.
 */
export function GruposForm({
  grupos,
  puedeCrear,
  puedeEditar,
  puedeEliminar,
  onGuardarGrupo,
  onEliminarGrupo,
  onGuardarOpcion,
  onAlternarOpcion,
  onEliminarOpcion,
  onClose,
}: GruposFormProps) {
  const confirm = useConfirm()
  const [abiertoId, setAbiertoId] = React.useState<string | null>(null)
  const [secundario, setSecundario] = React.useState<Secundario>(null)
  const cerrarSecundario = React.useCallback(() => setSecundario(null), [])

  // El grupo de la opción se busca en la lista viva: al guardar, el panel muestra los datos al día
  const grupoDeOpcion = secundario?.tipo === "opcion" ? grupos.find((g) => g.id_grupo === secundario.idGrupo) : undefined

  return (
    <>
      <FormPanel
        open
        onOpenChange={(abierto) => {
          if (!abierto && !secundario) onClose()
        }}
        title="Personalización"
        description="Grupos de opciones que el cliente elige al pedir: leche, endulzante, temperatura…"
        footer={
          <Button type="button" variant="neutral" size="md" onClick={onClose}>
            Cerrar
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          {puedeCrear && (
            <Button type="button" size="md" onClick={() => setSecundario({ tipo: "grupo" })} leftIcon={<Plus className="size-4" />} className="self-start">
              Nuevo grupo
            </Button>
          )}

          <ul className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100 dark:divide-stone-800 dark:border-stone-800">
            {grupos.length === 0 && <li className="p-4 text-center text-sm text-slate-500 dark:text-stone-400">Aún no hay grupos.</li>}
            {grupos.map((grupo) => (
              <GrupoFila
                key={grupo.id_grupo}
                grupo={grupo}
                abierto={abiertoId === grupo.id_grupo}
                puedeCrear={puedeCrear}
                puedeEditar={puedeEditar}
                puedeEliminar={puedeEliminar}
                onAlternar={() => setAbiertoId((actual) => (actual === grupo.id_grupo ? null : grupo.id_grupo))}
                onEditarGrupo={() => setSecundario({ tipo: "grupo", grupo })}
                onEliminarGrupo={async () => {
                  if (await confirm({ variant: "destructive" })) await onEliminarGrupo(grupo)
                }}
                onNuevaOpcion={() => setSecundario({ tipo: "opcion", idGrupo: grupo.id_grupo })}
                onEditarOpcion={(opcion) => setSecundario({ tipo: "opcion", idGrupo: grupo.id_grupo, opcion })}
                onAlternarOpcion={(idOpcion, nombre, disponible) => void onAlternarOpcion(idOpcion, nombre, disponible)}
                onEliminarOpcion={async (idOpcion, nombre) => {
                  if (await confirm({ variant: "destructive" })) await onEliminarOpcion(idOpcion, nombre)
                }}
              />
            ))}
          </ul>
        </div>
      </FormPanel>

      {secundario?.tipo === "grupo" && (
        <GrupoSheet
          key={secundario.grupo?.id_grupo ?? "nuevo"}
          grupo={secundario.grupo}
          onGuardar={(values) => onGuardarGrupo(values, secundario.grupo?.id_grupo)}
          onClose={cerrarSecundario}
        />
      )}

      {secundario?.tipo === "opcion" && grupoDeOpcion && (
        <OpcionSheet
          key={secundario.opcion?.id_opcion ?? "nueva"}
          grupo={grupoDeOpcion}
          opcion={secundario.opcion}
          onGuardar={async (values) => {
            const guardada = await onGuardarOpcion(grupoDeOpcion.id_grupo, values, secundario.opcion?.id_opcion)
            if (guardada) setAbiertoId(grupoDeOpcion.id_grupo)
            return guardada
          }}
          onClose={cerrarSecundario}
        />
      )}
    </>
  )
}
