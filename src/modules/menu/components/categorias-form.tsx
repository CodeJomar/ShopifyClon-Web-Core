"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { useConfirm } from "@/shared/providers/confirm-provider"
import { categoriaFormSchema, type CategoriaFormValues, type CategoriaMenu, type ProductoMenu } from "../schema"
import { errorClass } from "./estilos"
import { CategoriaFila } from "./categoria-fila"

/* -------------------------------------------------------------------------- */
/*                   Administración de categorías del menú                    */
/* -------------------------------------------------------------------------- */

interface CategoriasFormProps {
  categorias: CategoriaMenu[]
  productos: ProductoMenu[]
  puedeCrear: boolean
  puedeEditar: boolean
  puedeEliminar: boolean
  onGuardar: (nombre: string, id?: string) => Promise<boolean>
  onEliminar: (categoria: CategoriaMenu) => Promise<boolean>
  // Guarda el orden nuevo (ids de las categorías, de la primera a la última)
  onOrdenar: (ids: string[]) => Promise<boolean>
  onClose: () => void
}

const FORM_ID = "menu-categoria-form"

/**
 * Panel lateral para crear, renombrar, ordenar y eliminar categorías.
 * Una categoría con productos asociados no se puede eliminar (también lo valida la API).
 */
export function CategoriasForm({
  categorias,
  productos,
  puedeCrear,
  puedeEditar,
  puedeEliminar,
  onGuardar,
  onEliminar,
  onOrdenar,
  onClose,
}: CategoriasFormProps) {
  const confirm = useConfirm()
  const [editandoId, setEditandoId] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaFormSchema),
    defaultValues: { nombre: "" },
  })

  const productosPorCategoria = React.useMemo(() => {
    const mapa = new Map<string, number>()
    for (const p of productos) mapa.set(p.id_categoria, (mapa.get(p.id_categoria) ?? 0) + 1)
    return mapa
  }, [productos])

  // Mueve una categoría una posición (-1 arriba, +1 abajo) y guarda el orden completo
  const mover = (indice: number, salto: -1 | 1) => {
    const ids = categorias.map((c) => c.id_categoria)
    const destino = indice + salto
    if (destino < 0 || destino >= ids.length) return
    ;[ids[indice], ids[destino]] = [ids[destino], ids[indice]]
    void onOrdenar(ids)
  }

  const onCrear = async ({ nombre }: CategoriaFormValues) => {
    if (await onGuardar(nombre)) reset({ nombre: "" })
  }

  return (
    <FormPanel
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
      title="Categorías del menú"
      description="Organiza la carta en bebidas, postres, piqueos y más."
      bodyClassName="flex flex-col overflow-hidden"
      footer={
        <>
          <Button type="button" variant="neutral" size="md" onClick={onClose}>
            Cerrar
          </Button>
          {puedeCrear && (
            <Button type="submit" form={FORM_ID} size="md" disabled={isSubmitting} leftIcon={<Plus className="size-4" />}>
              Agregar
            </Button>
          )}
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-5">
        {/* Nueva categoría: queda fija; solo el listado se desplaza */}
        {puedeCrear && (
          <form id={FORM_ID} onSubmit={handleSubmit(onCrear)} className="flex shrink-0 flex-col gap-1.5" noValidate>
            <FloatingInput
              id="menu-categoria-nueva"
              label="Nueva categoría"
              {...register("nombre")}
              maxLength={50}
              autoComplete="off"
              state={errors.nombre ? "error" : "default"}
              aria-invalid={Boolean(errors.nombre)}
            />
            {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
          </form>
        )}

        {/* Listado */}
        <ul className="no-scrollbar flex min-h-0 flex-1 flex-col divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-100 dark:divide-stone-800 dark:border-stone-800">
          {categorias.length === 0 && (
            <li className="p-4 text-center text-sm text-slate-500 dark:text-stone-400">Aún no hay categorías.</li>
          )}
          {categorias.map((categoria, indice) => (
            <CategoriaFila
              key={categoria.id_categoria}
              categoria={categoria}
              totalProductos={productosPorCategoria.get(categoria.id_categoria) ?? 0}
              editando={editandoId === categoria.id_categoria}
              puedeEditar={puedeEditar}
              puedeEliminar={puedeEliminar}
              puedeSubir={puedeEditar && indice > 0}
              puedeBajar={puedeEditar && indice < categorias.length - 1}
              onMover={(salto) => mover(indice, salto)}
              onEditar={() => setEditandoId(categoria.id_categoria)}
              onCancelarEdicion={() => setEditandoId(null)}
              onGuardar={async (nombre) => {
                if (await onGuardar(nombre, categoria.id_categoria)) setEditandoId(null)
              }}
              onEliminar={async () => {
                if (await confirm({ variant: "destructive" })) await onEliminar(categoria)
              }}
            />
          ))}
        </ul>
      </div>
    </FormPanel>
  )
}
