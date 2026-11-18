import Link from "next/link"
import { notFound } from "next/navigation"
import { Download, PackageCheck, Truck } from "lucide-react"
import { AgregarAlCarrito } from "@/modules/mercado/components/agregar-al-carrito"
import { ImagenProducto } from "@/modules/mercado/components/imagen-producto"
import { AvatarTienda } from "@/modules/mercado/components/tarjeta-tienda"
import { TarjetaProducto } from "@/modules/mercado/components/tarjeta-producto"
import { listarProductos, obtenerProducto, obtenerTienda } from "@/modules/mercado/datos"
import { claseContenedor } from "@/shared/components/marketing/estilos"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"
import { tonoDe } from "@/modules/mercado/tono"
import { Estrellas } from "@/modules/resenas/components/estrellas"
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
  const { datos: otros } = await listarProductos({ tienda: subdominio, tamano: 5 })
  const masDeLaTienda = otros.filter((p) => p.identificador_url !== detalle.identificador_url).slice(0, 4)

  const variantes = detalle.variantes
  const base = variantes.find((v) => v.disponible) ?? variantes[0]
  const aNumero = (x: number | string | null | undefined) => (x == null ? null : Number(x))
  const precio = aNumero(base?.precio) ?? 0
  const comparacion = aNumero(base?.precio_comparacion)
  const rebaja = comparacion && comparacion > precio ? comparacion : null
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

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="aspect-square overflow-hidden rounded-[28px] border border-island-border shadow-isla">
          <ImagenProducto tono={tonoDe(subdominio)} src={imagen?.url_imagen} titulo={imagen?.texto_alternativo ?? producto.titulo} />
        </div>

        <div className="flex flex-col">
          <Link
            href={`/mercado/tienda/${producto.tienda.subdominio}`}
            className="inline-flex w-fit items-center gap-2.5 rounded-xl pr-2 text-[14px] font-bold text-foreground outline-none hover:text-brand-text focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <AvatarTienda tienda={producto.tienda} className="size-9 rounded-xl text-[15px]" />
            {producto.tienda.nombre}
          </Link>

          <h1 className="mt-4 text-balance text-[30px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[38px]">{producto.titulo}</h1>
          <Estrellas promedio={detalle.calificacion_promedio} cantidad={detalle.cantidad_resenas} tamano="lg" className="mt-2" />

          <p className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-[38px] font-extrabold leading-none tracking-tight text-foreground">{formatearDinero(precio, moneda)}</span>
            {rebaja && <span className="text-[17px] font-medium text-muted-foreground line-through">{formatearDinero(rebaja, moneda)}</span>}
            {rebaja && <span className="rounded-full bg-tono-peligro-bg px-2.5 py-1 text-[12px] font-extrabold text-tono-peligro-fg">-{Math.round((1 - precio / rebaja) * 100)}%</span>}
          </p>

          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-muted-foreground">{detalle.descripcion}</p>

          <div className="mt-8">
            <AgregarAlCarrito titulo={detalle.titulo} moneda={moneda} variantes={variantes} />
          </div>

          <ul className="mt-8 space-y-3 rounded-2xl vidrio p-5 text-[14px] font-medium text-foreground">
            <li className="flex items-center gap-3">
              {producto.es_digital ? <Download aria-hidden="true" className="size-5 text-brand-text" /> : <Truck aria-hidden="true" className="size-5 text-brand-text" />}
              {producto.es_digital ? "Producto digital: lo recibes por correo, sin envío." : "Lo despacha la tienda y puedes seguir el envío en tu pedido."}
            </li>
            <li className="flex items-center gap-3">
              <PackageCheck aria-hidden="true" className="size-5 text-brand-text" />
              Pagas una sola vez aunque agregues productos de otras tiendas.
            </li>
          </ul>
        </div>
      </div>

      <SeccionResenas subdominio={subdominio} slug={slug} />

      {masDeLaTienda.length > 0 && (
        <section className="mt-16" aria-labelledby="mas-titulo">
          <h2 id="mas-titulo" className="text-[24px] font-extrabold tracking-tight text-foreground">Más de {producto.tienda.nombre}</h2>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
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
