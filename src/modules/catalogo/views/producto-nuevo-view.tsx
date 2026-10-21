"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { toast } from "@/shared/components/ui/toast"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { PERMISO } from "@/shared/constants/permisos"
import { categoriasAction, crearProductoAction } from "../actions/catalogo.actions"
import { CategoriasCheck, ProductoDatosForm } from "../components/producto-datos-form"
import { VarianteForm, payloadVariante } from "../components/variante-form"
import type { ProductoDatosValues, VarianteValues } from "../schema"
import type { CategoriaDto } from "@/dtos/catalogo"
import type { ErrorApi } from "@/lib/api/error-api"

const FORM_DATOS = "formulario-producto-datos"
const FORM_VARIANTE = "formulario-producto-variante"

/** Crear producto en dos pasos: datos y categorías, y después la primera variante. Nace como borrador. */
export function ProductoNuevoView() {
  const router = useRouter()
  const { puede } = usePanel()
  const [paso, setPaso] = React.useState<1 | 2>(1)
  const [datos, setDatos] = React.useState<ProductoDatosValues | null>(null)
  const [categoriaIds, setCategoriaIds] = React.useState<string[]>([])
  const [categorias, setCategorias] = React.useState<CategoriaDto[]>([])
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const verCosto = puede(PERMISO.CATALOGO_GESTIONAR)

  React.useEffect(() => {
    let cancelado = false
    categoriasAction().then((res) => {
      if (!cancelado && res.ok) setCategorias(res.datos)
    })
    return () => {
      cancelado = true
    }
  }, [])

  const guardarVariante = async (variante: VarianteValues) => {
    if (!datos) return { error: undefined }
    setError(null)
    const res = await crearProductoAction({
      titulo: datos.titulo,
      identificador_url: datos.identificador_url || undefined,
      descripcion: datos.descripcion || undefined,
      proveedor: datos.proveedor || undefined,
      es_digital: datos.es_digital,
      categoria_ids: categoriaIds,
      variantes: [payloadVariante(variante, true)],
    })
    if (!res.ok) {
      setError(res.error)
      return { error: res.error }
    }
    toast.add({ type: "success", title: "Producto creado", description: "Quedó como borrador. Publícalo cuando esté listo." })
    router.replace(`/panel/productos/${res.datos.id}`)
    return {}
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/panel/productos" className="text-[12px] font-bold text-brand-text hover:underline">
          ← Productos
        </Link>
        <h1 className="mt-1 text-[18px] font-extrabold tracking-tight text-foreground">Nuevo producto</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Paso {paso} de 2: {paso === 1 ? "datos del producto" : "primera variante"}.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos crear el producto</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {paso === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Datos del producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProductoDatosForm
              formId={FORM_DATOS}
              inicial={datos ?? undefined}
              onEnviar={(valores) => {
                setDatos(valores)
                setPaso(2)
              }}
            />
            <div className="space-y-2">
              <p className="text-[13px] font-bold text-foreground">Categorías</p>
              <CategoriasCheck categorias={categorias} seleccionadas={categoriaIds} onCambiar={setCategoriaIds} />
            </div>
            <Button type="submit" form={FORM_DATOS} className="w-full">
              Continuar
            </Button>
          </CardContent>
        </Card>
      )}

      {paso === 2 && datos && (
        <Card>
          <CardHeader>
            <CardTitle>Primera variante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <VarianteForm
              formId={FORM_VARIANTE}
              digital={datos.es_digital}
              verCosto={verCosto}
              mostrarCantidadInicial
              onEnviar={async (valores) => {
                const r = await guardarVariante(valores)
                return { error: r.error }
              }}
            />
            <div className="flex gap-3">
              <Button type="button" variant="neutral" className="flex-1" onClick={() => setPaso(1)}>
                Volver a los datos
              </Button>
              <Button type="submit" form={FORM_VARIANTE} className="flex-1">
                Crear producto
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
