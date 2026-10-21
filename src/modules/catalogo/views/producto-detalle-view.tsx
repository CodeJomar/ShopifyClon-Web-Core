"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { useConfirm } from "@/shared/providers/confirm-provider"
import { toast } from "@/shared/components/ui/toast"
import { formatearDinero } from "@/shared/utils/dinero"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { PERMISO } from "@/shared/constants/permisos"
import {
  categoriasAction,
  categoriasDeProductoAction,
  crearImagenAction,
  crearVarianteAction,
  editarImagenAction,
  editarProductoAction,
  editarVarianteAction,
  eliminarImagenAction,
  eliminarProductoAction,
  eliminarVarianteAction,
  productoAction,
  publicarProductoAction,
} from "../actions/catalogo.actions"
import { CategoriasCheck, ProductoDatosForm } from "../components/producto-datos-form"
import { VarianteForm, payloadVariante } from "../components/variante-form"
import { imagenSchema, type ImagenValues, type ProductoDatosValues, type VarianteValues } from "../schema"
import type { CategoriaDto, ProductoDetalleDto, VarianteDto } from "@/dtos/catalogo"
import type { ErrorApi } from "@/lib/api/error-api"

const FORM_DATOS = "producto-datos"
const FORM_VARIANTE = "producto-variante"

/** Detalle y edición de un producto: datos, variantes, imágenes por URL, categorías, publicación y eliminación. */
export function ProductoDetalleView({ id }: { id: string }) {
  const router = useRouter()
  const confirmar = useConfirm()
  const { tienda, puede } = usePanel()
  const puedeEscribir = puede(PERMISO.CATALOGO_GESTIONAR)
  const moneda = tienda?.moneda ?? "PEN"
  const [producto, setProducto] = React.useState<ProductoDetalleDto | null>(null)
  const [categorias, setCategorias] = React.useState<CategoriaDto[]>([])
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [categoriaIds, setCategoriaIds] = React.useState<string[]>([])
  const [panelVariante, setPanelVariante] = React.useState<{ abierto: boolean; editando?: VarianteDto }>({ abierto: false })

  const cargar = React.useCallback(async () => {
    const [p, c] = await Promise.all([productoAction(id), categoriasAction()])
    if (c.ok) setCategorias(c.datos)
    if (p.ok) {
      setError(null)
      setProducto(p.datos)
      setCategoriaIds(p.datos.categorias.map((cat) => cat.id))
    } else setError(p.error)
  }, [id])

  React.useEffect(() => {
    let cancelado = false
    Promise.all([productoAction(id), categoriasAction()]).then(([p, c]) => {
      if (cancelado) return
      if (c.ok) setCategorias(c.datos)
      if (p.ok) {
        setProducto(p.datos)
        setCategoriaIds(p.datos.categorias.map((cat) => cat.id))
      } else setError(p.error)
    })
    return () => {
      cancelado = true
    }
  }, [id])

  const aviso = (res: { ok: boolean }, titulo: string, exito: string) => {
    if (!res.ok) return false
    toast.add({ type: "success", title: exito })
    void titulo
    return true
  }

  if (error && !producto) {
    return (
      <div className="space-y-4">
        <Link href="/panel/productos" className="text-[12px] font-bold text-brand-text hover:underline">← Productos</Link>
        <Alert variant="destructive">
          <AlertTitle>No encontramos este producto</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!producto) return <p className="text-[13px] text-muted-foreground" aria-live="polite">Cargando el producto…</p>

  const guardarDatos = async (valores: ProductoDatosValues) => {
    setError(null)
    const res = await editarProductoAction(id, {
      titulo: valores.titulo,
      identificador_url: valores.identificador_url || undefined,
      descripcion: valores.descripcion || undefined,
      proveedor: valores.proveedor || undefined,
      es_digital: valores.es_digital,
    })
    if (!res.ok) return setError(res.error)
    aviso(res, "", "Datos guardados")
    cargar()
  }

  const guardarCategorias = async () => {
    setError(null)
    const res = await categoriasDeProductoAction(id, categoriaIds)
    if (!res.ok) return setError(res.error)
    aviso(res, "", "Categorías guardadas")
    cargar()
  }

  const cambiarPublicacion = async () => {
    setError(null)
    const publicar = !producto.esta_publicado
    const res = await publicarProductoAction(id, publicar)
    if (!res.ok) return setError(res.error) // CAT-007 y demás: el mensaje de la API en la alerta
    aviso(res, "", publicar ? "Producto publicado" : "Producto despublicado")
    cargar()
  }

  const eliminarProducto = async () => {
    const aceptado = await confirmar({
      variant: "destructive",
      title: "¿Eliminar este producto?",
      description: `Se quitará «${producto.titulo}» de tu tienda.`,
      confirmText: "Sí, eliminar",
    })
    if (!aceptado) return
    const res = await eliminarProductoAction(id)
    if (!res.ok) return setError(res.error)
    toast.add({ type: "success", title: "Producto eliminado" })
    router.replace("/panel/productos")
  }

  const eliminarVariante = async (variante: VarianteDto) => {
    const aceptado = await confirmar({
      variant: "destructive",
      title: "¿Eliminar esta variante?",
      description: `Se quitará «${variante.titulo}».`,
      confirmText: "Sí, eliminar",
    })
    if (!aceptado) return
    const res = await eliminarVarianteAction(variante.id)
    if (!res.ok) return setError(res.error) // CAT-001: no se puede eliminar la última
    toast.add({ type: "success", title: "Variante eliminada" })
    cargar()
  }

  const guardarVariante = async (valores: VarianteValues) => {
    const editando = panelVariante.editando
    const res = editando
      ? await editarVarianteAction(editando.id, payloadVariante(valores, false))
      : await crearVarianteAction(id, payloadVariante(valores, true))
    if (!res.ok) return { error: res.error }
    setPanelVariante({ abierto: false })
    toast.add({ type: "success", title: editando ? "Variante actualizada" : "Variante agregada" })
    cargar()
    return {}
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link href="/panel/productos" className="text-[12px] font-bold text-brand-text hover:underline">← Productos</Link>
          <h1 className="mt-1 truncate text-[18px] font-extrabold tracking-tight text-foreground">{producto.titulo}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {producto.esta_publicado ? <Badge variant="estado" tono="marca">Activo en tienda</Badge> : <Badge variant="estado" tono="contorno">Borrador</Badge>}
            {producto.es_digital && <Badge variant="estado" tono="info">Digital</Badge>}
          </div>
        </div>
        {puedeEscribir && (
          <div className="flex gap-2">
            <Button variant={producto.esta_publicado ? "neutral" : "default"} onClick={cambiarPublicacion}>
              {producto.esta_publicado ? "Despublicar" : "Publicar"}
            </Button>
            <Button variant="danger-outline" onClick={eliminarProducto}>Eliminar producto</Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos completar la acción</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ProductoDatosForm
            formId={FORM_DATOS}
            inicial={{
              titulo: producto.titulo,
              identificador_url: producto.identificador_url,
              descripcion: producto.descripcion ?? "",
              proveedor: producto.proveedor ?? "",
              es_digital: producto.es_digital,
            }}
            onEnviar={guardarDatos}
          />
          {puedeEscribir && (
            <Button type="submit" form={FORM_DATOS}>Guardar datos</Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {producto.variantes.map((variante) => (
              <li key={variante.id} className="flex flex-col gap-3 border-b border-island-border pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-bold text-foreground">{variante.titulo}</p>
                  <p className="font-mono text-[12px] text-muted-foreground">{variante.sku}</p>
                  <p className="text-[12.5px] text-muted-foreground">
                    {formatearDinero(variante.precio, moneda)}
                    {variante.precio_comparacion != null && <> · antes {formatearDinero(variante.precio_comparacion, moneda)}</>}
                    {" · "}Disponible: {variante.inventario.disponible} · Reservada: {variante.inventario.reservada}
                  </p>
                </div>
                {puedeEscribir && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="neutral" onClick={() => setPanelVariante({ abierto: true, editando: variante })}>Editar</Button>
                    <Button size="sm" variant="danger-outline" onClick={() => eliminarVariante(variante)}>Eliminar</Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {puedeEscribir && (
            <Button variant="soft" onClick={() => setPanelVariante({ abierto: true })}>Agregar variante</Button>
          )}
        </CardContent>
      </Card>

      <ImagenesSeccion producto={producto} puedeEscribir={puedeEscribir} onCambio={cargar} onError={setError} />

      <Card>
        <CardHeader>
          <CardTitle>Categorías</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CategoriasCheck categorias={categorias} seleccionadas={categoriaIds} onCambiar={setCategoriaIds} />
          {puedeEscribir && <Button variant="soft" onClick={guardarCategorias}>Guardar categorías</Button>}
        </CardContent>
      </Card>

      <FormPanel
        open={panelVariante.abierto}
        onOpenChange={(abierto) => setPanelVariante((s) => ({ ...s, abierto }))}
        title={panelVariante.editando ? "Editar variante" : "Agregar variante"}
        footer={
          <>
            <Button type="button" variant="neutral" onClick={() => setPanelVariante({ abierto: false })}>Cancelar</Button>
            <Button type="submit" form={FORM_VARIANTE}>Guardar</Button>
          </>
        }
      >
        <VarianteForm
          key={panelVariante.editando?.id ?? "nueva"}
          formId={FORM_VARIANTE}
          inicial={panelVariante.editando}
          digital={producto.es_digital}
          verCosto={puedeEscribir}
          mostrarCantidadInicial={!panelVariante.editando}
          onEnviar={async (valores) => {
            const r = await guardarVariante(valores)
            return { error: r.error }
          }}
        />
      </FormPanel>
    </div>
  )
}

function ImagenesSeccion({
  producto,
  puedeEscribir,
  onCambio,
  onError,
}: {
  producto: ProductoDetalleDto
  puedeEscribir: boolean
  onCambio: () => void
  onError: (error: ErrorApi | null) => void
}) {
  const confirmar = useConfirm()
  const [enviando, setEnviando] = React.useState(false)
  const form = useForm<ImagenValues>({
    resolver: zodResolver(imagenSchema),
    defaultValues: { url_imagen: "", texto_alternativo: "" },
  })

  const agregar = form.handleSubmit(async (valores) => {
    setEnviando(true)
    const res = await crearImagenAction(producto.id, {
      url_imagen: valores.url_imagen,
      texto_alternativo: valores.texto_alternativo || undefined,
    })
    setEnviando(false)
    if (!res.ok) {
      for (const [campo, mensaje] of Object.entries(res.error.validaciones ?? {})) {
        form.setError(campo as keyof ImagenValues, { message: mensaje })
      }
      return onError(res.error)
    }
    onError(null)
    form.reset()
    toast.add({ type: "success", title: "Imagen agregada" })
    onCambio()
  })

  const marcarPrincipal = async (imagenId: string, url: string, alt?: string | null) => {
    const res = await editarImagenAction(imagenId, { url_imagen: url, texto_alternativo: alt ?? undefined, es_principal: true })
    if (!res.ok) return onError(res.error)
    onError(null)
    onCambio()
  }

  const quitar = async (imagenId: string) => {
    const aceptado = await confirmar({ variant: "destructive", title: "¿Quitar esta imagen?", description: "La imagen dejará de mostrarse en el producto.", confirmText: "Sí, quitar" })
    if (!aceptado) return
    const res = await eliminarImagenAction(imagenId)
    if (!res.ok) return onError(res.error)
    onError(null)
    onCambio()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imágenes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {producto.imagenes.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">Aún no tiene imágenes. Un producto necesita una imagen principal para publicarse.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {producto.imagenes.map((imagen) => (
              <li key={imagen.id} className="space-y-2">
                {/* Imagen por URL que la persona comerciante pega. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagen.url_imagen} alt={imagen.texto_alternativo ?? ""} className="aspect-square w-full rounded-xl object-cover" />
                <div className="flex items-center justify-between gap-2">
                  {imagen.es_principal ? <Badge variant="estado" tono="marca">Principal</Badge> : <span className="text-[12px] text-muted-foreground">Posición {imagen.posicion}</span>}
                  {puedeEscribir && (
                    <div className="flex gap-2">
                      {!imagen.es_principal && <Button size="sm" variant="soft" onClick={() => marcarPrincipal(imagen.id, imagen.url_imagen, imagen.texto_alternativo)}>Principal</Button>}
                      <Button size="sm" variant="danger-outline" onClick={() => quitar(imagen.id)}>Quitar</Button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {puedeEscribir && (
          <form onSubmit={agregar} noValidate className="space-y-4 border-t border-island-border pt-5">
            <FloatingInput label="Dirección de la imagen (https://…)" state={form.formState.errors.url_imagen ? "error" : "default"} mensajeError={form.formState.errors.url_imagen?.message} {...form.register("url_imagen")} />
            <FloatingInput label="Texto alternativo (opcional)" state={form.formState.errors.texto_alternativo ? "error" : "default"} mensajeError={form.formState.errors.texto_alternativo?.message} {...form.register("texto_alternativo")} />
            <Button type="submit" variant="soft" loading={enviando}>Agregar imagen</Button>
            {/* TODO(A-001): subir un archivo desde el equipo; por ahora solo por URL. */}
          </form>
        )}
      </CardContent>
    </Card>
  )
}
