"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Categorías</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">Organiza tus productos para que tus clientes los encuentren.</p>
        </div>
        {puedeEscribir && <Button onClick={() => setPanel({ abierto: true })}>Crear categoría</Button>}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos completar la acción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!categorias && !error && <p className="text-[13px] text-muted-foreground" aria-live="polite">Cargando categorías…</p>}

      {categorias && categorias.length === 0 && (
        <Card>
          <CardContent>
            <EstadoVacio
              titulo="Aún no tienes categorías"
              descripcion="Crea tu primera categoría para agrupar tus productos."
              accion={puedeEscribir ? { texto: "Crear categoría", onClick: () => setPanel({ abierto: true }) } : undefined}
            />
          </CardContent>
        </Card>
      )}

      {categorias && categorias.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {categorias.map((categoria) => (
            <li key={categoria.id}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="truncate text-[15px]">{categoria.nombre}</CardTitle>
                  <CardDescription className="font-mono text-[12px]">{categoria.identificador_url}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoria.descripcion && <p className="text-[13px] text-muted-foreground">{categoria.descripcion}</p>}
                  {puedeEscribir && (
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="neutral" onClick={() => setPanel({ abierto: true, editando: categoria })}>
                        Editar
                      </Button>
                      <Button size="sm" variant="danger-outline" onClick={() => eliminar(categoria)}>
                        Eliminar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
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
