import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductoInteractivo } from "@/modules/mercado/components/producto-interactivo"
import { TarjetaProducto } from "@/modules/mercado/components/tarjeta-producto"
import { listarProductos, obtenerProducto, obtenerTienda } from "@/modules/mercado/datos"
import { claseContenedor } from "@/shared/components/marketing/estilos"
import { cn } from "@/shared/utils/cn"
import { SeccionResenas } from "@/modules/resenas/components/seccion-resenas"
import type { ProductoMercado } from "@/dtos/mercado"

type Props = { params: Promise<{ subdominio: string; slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { subdominio, slug } = await params
  const producto = await obtenerProducto(subdominio, slug)
  return { title: producto ? `${producto.titulo} | OTemu` : "Producto | OTemu", description: producto?.descripcion ?? undefined }
}

export default async function DetalleProducto({ params }: Props) {
  const { subdominio, slug } = await params
  const [detalle, tienda] = await Promise.all([obtenerProducto(subdominio, slug), obtenerTienda(subdominio)])
  if (!detalle || !tienda) notFound()
  const { datos: otros } = await listarProductos({ tienda: subdominio, tamano: 4 })
  const masDeLaTienda = otros.filter((p) => p.identificador_url !== detalle.identificador_url).slice(0, 3)

  const variantes = detalle.variantes
  const base = variantes.find((v) => v.disponible) ?? variantes[0]
  const aNumero = (x: number | string | null | undefined) => (x == null ? null : Number(x))
  const precio = aNumero(base?.precio) ?? 0
  const comparacion = aNumero(base?.precio_comparacion)
  const esDigital = variantes.length > 0 && variantes.every((v) => !v.requiere_envio)
  const imagen = [...detalle.imagenes].sort((a, b) => a.posicion - b.posicion)[0]
  const moneda = tienda.moneda
  const productoBase: ProductoMercado = {
    id: base?.id ?? slug,
    titulo: detalle.titulo,
    identificador_url: detalle.identificador_url,
    precio_desde: precio,
    precio_comparacion_desde: comparacion,
    moneda,
    imagen_url: imagen?.url_imagen,
    es_digital: esDigital,
    hay_stock: variantes.some((v) => v.disponible),
    tienda: { nombre: tienda.nombre, subdominio: tienda.subdominio, logo_url: tienda.logo_url },
  }
  const producto = { ...productoBase, tienda: productoBase.tienda }

  return (
    <div className={cn(claseContenedor, "py-8 sm:py-12")}>
      <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
        <Link href="/mercado" className="hover:text-foreground hover:underline">Mercado</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/mercado/tienda/${producto.tienda.subdominio}`} className="hover:text-foreground hover:underline">{producto.tienda.nombre}</Link>
      </nav>

      <ProductoInteractivo
        subdominio={subdominio}
        tienda={producto.tienda}
        titulo={detalle.titulo}
        descripcion={detalle.descripcion}
        moneda={moneda}
        variantes={variantes}
        imagenes={detalle.imagenes}
        calificacion={detalle.calificacion_promedio}
        resenas={detalle.cantidad_resenas}
      />

      <SeccionResenas subdominio={subdominio} slug={slug} />

      {masDeLaTienda.length > 0 && (
        <section className="mt-16" aria-labelledby="mas-titulo">
          <h2 id="mas-titulo" className="text-[24px] font-extrabold tracking-tight text-foreground">Más de {producto.tienda.nombre}</h2>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
            {masDeLaTienda.map((p) => (
              <li key={p.id}>
                <TarjetaProducto producto={p} className="h-full" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
