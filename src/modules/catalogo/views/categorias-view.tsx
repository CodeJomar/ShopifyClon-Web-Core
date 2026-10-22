"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { SearchInput } from "@/shared/components/composed/search-input"
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { useConfirm } from "@/shared/providers/confirm-provider"
import { toast } from "@/shared/components/ui/toast"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { PERMISO } from "@/shared/constants/permisos"
import { categoriasAction, crearCategoriaAction, editarCategoriaAction, eliminarCategoriaAction } from "../actions/catalogo.actions"
import { categoriaSchema, type CategoriaValues } from "../schema"
import type { CategoriaDto } from "@/dtos/catalogo"
import type { ErrorApi } from "@/lib/api/error-api"

const FORMULARIO_CATEGORIA = "formulario-categoria"

/** Categorías de la tienda: lista en islas, crear y editar en el panel lateral, eliminar con confirmación. */
export function CategoriasView() {
  const { puede } = usePanel()
  const puedeEscribir = puede(PERMISO.CATALOGO_GESTIONAR)
  const confirmar = useConfirm()
  const [categorias, setCategorias] = React.useState<CategoriaDto[] | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [panel, setPanel] = React.useState<{ abierto: boolean; editando?: CategoriaDto }>({ abierto: false })
  const [busqueda, setBusqueda] = React.useState("")

  const cargar = React.useCallback(async () => {
    const res = await categoriasAction()
    if (res.ok) {
      setError(null)
      setCategorias(res.datos)
    } else setError(res.error)
  }, [])

  React.useEffect(() => {
    let cancelado = false
    categoriasAction().then((res) => {
      if (cancelado) return
      if (res.ok) setCategorias(res.datos)
      else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [])

  const eliminar = async (categoria: CategoriaDto) => {
    const aceptado = await confirmar({
      variant: "destructive",
      title: "¿Eliminar esta categoría?",
      description: `Se quitará «${categoria.nombre}». Los productos que la usen dejarán de estar en ella.`,
      confirmText: "Sí, eliminar",
    })
    if (!aceptado) return
    const res = await eliminarCategoriaAction(categoria.id)
    if (!res.ok) return setError(res.error)
    toast.add({ type: "success", title: "Categoría eliminada" })
    cargar()
  }

  const visibles = (categorias ?? []).filter((c) => c.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Categorías"
        descripcion={categorias ? `${categorias.length} ${categorias.length === 1 ? "categoría" : "categorías"}. Organiza tus productos para que tus clientes los encuentren.` : "Organiza tus productos para que tus clientes los encuentren."}
        acciones={
          puedeEscribir && (
            <Button onClick={() => setPanel({ abierto: true })} leftIcon={<Plus aria-hidden="true" />}>
              Crear categoría
            </Button>
          )
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos completar la acción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!categorias && !error && (
        <div className="space-y-2" aria-busy="true" aria-label="Cargando categorías">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      )}

      {categorias && categorias.length === 0 && (
        <Card>
          <CardContent>
            <EstadoVacio
              icono={FolderTree}
              titulo="Aún no tienes categorías"
              descripcion="Crea tu primera categoría, por ejemplo «Ropa» o «Hogar», para agrupar tus productos."
              accion={puedeEscribir ? { texto: "Crear categoría", onClick: () => setPanel({ abierto: true }) } : undefined}
            />
          </CardContent>
        </Card>
      )}

      {categorias && categorias.length > 0 && (
        <Card className="gap-0 py-0">
          {categorias.length > 5 && (
            <div className="border-b border-border/60 p-4 sm:max-w-sm">
              <SearchInput value={busqueda} onValueChange={setBusqueda} placeholder="Buscar categoría" />
            </div>
          )}
          {visibles.length === 0 ? (
            <p className="p-6 text-center text-[13px] text-muted-foreground">Ninguna categoría coincide con la búsqueda.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {visibles.map((categoria) => (
                <li key={categoria.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/14 text-brand-text" aria-hidden="true">
                    <FolderTree className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1 basis-48">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[14px] font-extrabold text-foreground">{categoria.nombre}</p>
                      <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11.5px] text-muted-foreground">/{categoria.identificador_url}</span>
                    </div>
                    {categoria.descripcion && <p className="mt-0.5 line-clamp-2 text-[12.5px] text-muted-foreground">{categoria.descripcion}</p>}
                  </div>
                  {puedeEscribir && (
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="neutral" onClick={() => setPanel({ abierto: true, editando: categoria })} leftIcon={<Pencil aria-hidden="true" />}>
                        Editar
                      </Button>
                      <Button size="sm" variant="danger-outline" onClick={() => eliminar(categoria)} leftIcon={<Trash2 aria-hidden="true" />}>
                        Eliminar
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <FormPanel
        open={panel.abierto}
        onOpenChange={(abierto) => setPanel((estado) => ({ ...estado, abierto }))}
        title={panel.editando ? "Editar categoría" : "Crear categoría"}
        footer={
          <>
            <Button type="button" variant="neutral" onClick={() => setPanel({ abierto: false })}>
              Cancelar
            </Button>
            <Button type="submit" form={FORMULARIO_CATEGORIA}>
              Guardar
            </Button>
          </>
        }
      >
        <CategoriaForm
          key={panel.editando?.id ?? "nueva"}
          inicial={panel.editando}
          onGuardado={() => {
            setPanel({ abierto: false })
            cargar()
          }}
        />
      </FormPanel>
    </div>
  )
}

function CategoriaForm({ inicial, onGuardado }: { inicial?: CategoriaDto; onGuardado: () => void }) {
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const form = useForm<CategoriaValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nombre: inicial?.nombre ?? "",
      identificador_url: inicial?.identificador_url ?? "",
      descripcion: inicial?.descripcion ?? "",
    },
  })

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const datos = {
      nombre: valores.nombre,
      identificador_url: valores.identificador_url || undefined,
      descripcion: valores.descripcion || undefined,
    }
    const res = inicial ? await editarCategoriaAction(inicial.id, datos) : await crearCategoriaAction(datos)
    if (!res.ok) {
      for (const [campo, mensaje] of Object.entries(res.error.validaciones ?? {})) {
        form.setError(campo as keyof CategoriaValues, { message: mensaje })
      }
      return setError(res.error)
    }
    toast.add({ type: "success", title: inicial ? "Categoría actualizada" : "Categoría creada" })
    onGuardado()
  })

  return (
    <form id={FORMULARIO_CATEGORIA} onSubmit={guardar} noValidate className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos guardar la categoría</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <FloatingInput label="Nombre" state={form.formState.errors.nombre ? "error" : "default"} mensajeError={form.formState.errors.nombre?.message} {...form.register("nombre")} />
      <FloatingInput label="Identificador en la tienda (opcional)" state={form.formState.errors.identificador_url ? "error" : "default"} mensajeError={form.formState.errors.identificador_url?.message} ayuda="Si lo dejas vacío, se genera del nombre." {...form.register("identificador_url")} />
      <FloatingTextarea label="Descripción (opcional)" rows={3} state={form.formState.errors.descripcion ? "error" : "default"} {...form.register("descripcion")} />
      {form.formState.errors.descripcion && <p className="text-[11px] font-bold text-destructive-text">{form.formState.errors.descripcion.message}</p>}
    </form>
  )
}
