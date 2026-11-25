"use client"

import * as React from "react"
import Link from "next/link"
import { Download, PackageCheck, Truck } from "lucide-react"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"
import { Estrellas } from "@/modules/resenas/components/estrellas"
import type { ImagenVitrina, VarianteVitrina } from "@/dtos/vitrina"
import { COLORES, gruposDe, valoresDe } from "../variantes"
import { tonoDe } from "../tono"
import { AgregarAlCarrito } from "./agregar-al-carrito"
import { ImagenProducto } from "./imagen-producto"
import { AvatarTienda } from "./tarjeta-tienda"

interface Props {
  subdominio: string
  tienda: { nombre: string; subdominio: string; logo_url?: string | null }
  titulo: string
  descripcion?: string | null
  moneda: string
  variantes: VarianteVitrina[]
  imagenes: ImagenVitrina[]
  calificacion?: number | null
  resenas?: number
}

/**
 * Detalle de producto interactivo: a la izquierda la galería (con las fotos de cada variante) y a la derecha, en un panel de vidrio, el
 * nombre, el precio, la descripción, las opciones (color, talla) y el botón de compra. Al elegir una variante cambian el precio, el stock
 * y, si tiene foto propia, la foto principal.
 */
export function ProductoInteractivo({ subdominio, tienda, titulo, descripcion, moneda, variantes, imagenes, calificacion, resenas }: Props) {
  const grupos = React.useMemo(() => gruposDe(variantes.map((v) => v.titulo)), [variantes])
  const valores = React.useMemo(() => variantes.map((v) => valoresDe(v.titulo)), [variantes])
  const fotos = React.useMemo(() => [...imagenes].sort((a, b) => a.posicion - b.posicion), [imagenes])

  const inicial = Math.max(0, variantes.findIndex((v) => v.disponible))
  const [indice, setIndice] = React.useState(inicial)
  const [foto, setFoto] = React.useState(0)
  const variante = variantes[indice]
  const seleccion = valores[indice] ?? []

  // La foto de la variante elegida tiene prioridad; si esa variante no tiene foto propia, sirve la de otra que comparta el valor recién elegido
  // (por ejemplo, la foto del «Negro / M» al elegir «Negro / S»).
  const irAFotoDe = (v: VarianteVitrina | undefined, grupo: number, valor: string) => {
    const propia = fotos.findIndex((f) => v && f.variante_id === v.id)
    const compartida = fotos.findIndex((f) => {
      const i = variantes.findIndex((x) => x.id === f.variante_id)
      return i >= 0 && valores[i][grupo] === valor
    })
    const i = propia >= 0 ? propia : compartida
    if (i >= 0) setFoto(i)
  }

  /** Elige un valor en un grupo: se busca la variante que conserve las otras elecciones; si no existe, la primera que tenga ese valor. */
  const elegir = (grupo: number, valor: string) => {
    const exacta = valores.findIndex((f, i) => f[grupo] === valor && f.every((x, g) => g === grupo || x === seleccion[g]) && variantes[i].disponible)
    const alguna = exacta >= 0 ? exacta : valores.findIndex((f, i) => f[grupo] === valor && variantes[i].disponible)
    const cualquiera = alguna >= 0 ? alguna : valores.findIndex((f) => f[grupo] === valor)
    if (cualquiera < 0) return
    setIndice(cualquiera)
    irAFotoDe(variantes[cualquiera], grupo, valor)
  }
  /** ¿Hay alguna variante disponible con este valor, dadas las demás elecciones? */
  const disponible = (grupo: number, valor: string) => valores.some((f, i) => f[grupo] === valor && f.every((x, g) => g === grupo || x === seleccion[g]) && variantes[i].disponible)

  const precio = Number(variante?.precio ?? 0)
  const comparacion = variante?.precio_comparacion == null ? null : Number(variante.precio_comparacion)
  const rebaja = comparacion && comparacion > precio ? comparacion : null
  const esDigital = variantes.length > 0 && variantes.every((v) => !v.requiere_envio)
  const actual = fotos[foto]

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
      {/* Galería */}
      <div className="space-y-3" data-tour="galeria">
        <div className="vidrio relative aspect-square overflow-hidden rounded-[28px]">
          <ImagenProducto tono={tonoDe(subdominio)} src={actual?.url_imagen} titulo={actual?.texto_alternativo ?? titulo} />
        </div>
        {fotos.length > 1 && (
          <ul className="grid grid-cols-5 gap-2.5 sm:grid-cols-6" aria-label="Fotos del producto">
            {fotos.map((f, i) => (
              <li key={`${f.url_imagen}-${i}`}>
                <button
                  type="button"
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={i === foto ? "true" : undefined}
                  onClick={() => setFoto(i)}
                  className={cn(
                    "aspect-square w-full overflow-hidden rounded-xl border-2 outline-none transition-all",
                    i === foto ? "border-primary shadow-[0_0_18px_-4px_rgb(0_230_153/0.8)]" : "border-white/10 opacity-70 hover:opacity-100",
                  )}
                >
                  <ImagenProducto tono={tonoDe(subdominio)} src={f.url_imagen} titulo={f.texto_alternativo ?? titulo} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Panel de compra */}
      <div className="vidrio flex flex-col rounded-[28px] p-6 sm:p-8 lg:self-start" data-tour="compra">
        <Link href={`/mercado/tienda/${tienda.subdominio}`} className="inline-flex w-fit items-center gap-2.5 rounded-xl pr-2 text-[14px] font-bold text-foreground outline-none hover:text-brand-text">
          <AvatarTienda tienda={tienda} className="size-9 rounded-xl text-[15px]" />
          {tienda.nombre}
        </Link>

        <h1 className="mt-4 text-balance text-[30px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[38px]">{titulo}</h1>
        <Estrellas promedio={calificacion} cantidad={resenas} tamano="lg" mostrarVacio className="mt-2" />

        <p className="mt-5 flex flex-wrap items-baseline gap-3">
          <span className="text-[38px] font-extrabold leading-none tracking-tight text-foreground">{formatearDinero(precio, moneda)}</span>
          {rebaja && <span className="text-[17px] font-medium text-muted-foreground line-through">{formatearDinero(rebaja, moneda)}</span>}
          {rebaja && <span className="rounded-lg bg-[#E91E63] px-2 py-1 text-[12px] font-extrabold text-white">-{Math.round((1 - precio / rebaja) * 100)}%</span>}
        </p>

        {descripcion && <p className="mt-5 max-w-xl whitespace-pre-line text-[15.5px] leading-relaxed text-muted-foreground">{descripcion}</p>}

        {grupos.length > 0 && (
          <div className="mt-6 space-y-5 border-t border-white/10 pt-6" data-tour="opciones">
            {grupos.map((g, gi) => (
              <fieldset key={g.nombre + gi}>
                <legend className="mb-2.5 text-[13px] font-bold text-muted-foreground">
                  {g.nombre}: <span className="text-foreground">{seleccion[gi] ?? "—"}</span>
                </legend>
                <div className="flex flex-wrap gap-2.5">
                  {g.valores.map((valor) => {
                    const elegido = seleccion[gi] === valor
                    const hay = disponible(gi, valor)
                    return g.esColor ? (
                      <button
                        key={valor}
                        type="button"
                        aria-label={valor}
                        aria-pressed={elegido}
                        title={hay ? valor : `${valor} (agotado)`}
                        onClick={() => elegir(gi, valor)}
                        className={cn(
                          "relative size-9 rounded-full border-2 outline-none transition-all",
                          elegido ? "border-primary shadow-[0_0_16px_-2px_rgb(0_230_153/0.9)]" : "border-white/20 hover:border-white/60",
                          !hay && "opacity-40",
                        )}
                        style={{ backgroundColor: COLORES[valor.toLowerCase()] }}
                      >
                        {!hay && <span aria-hidden="true" className="absolute inset-0 m-auto h-px w-[130%] -translate-x-[15%] rotate-45 bg-white/70" />}
                      </button>
                    ) : (
                      <button
                        key={valor}
                        type="button"
                        aria-pressed={elegido}
                        onClick={() => elegir(gi, valor)}
                        className={cn(
                          "min-w-11 rounded-xl border-[1.8px] px-3.5 py-2 text-[13.5px] font-bold outline-none transition-all",
                          elegido ? "border-primary bg-primary/12 text-foreground shadow-[0_0_16px_-4px_rgb(0_230_153/0.8)]" : "border-white/15 text-foreground hover:border-white/40",
                          !hay && "text-muted-foreground line-through opacity-60",
                        )}
                      >
                        {valor}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        )}

        <div className="mt-7">
          <AgregarAlCarrito titulo={titulo} variante={variante} hayStock={variantes.some((v) => v.disponible)} />
        </div>

        <ul className="mt-7 space-y-3 border-t border-white/10 pt-6 text-[14px] font-medium text-foreground">
          <li className="flex items-center gap-3">
            {esDigital ? <Download aria-hidden="true" className="size-5 shrink-0 text-brand-text" /> : <Truck aria-hidden="true" className="size-5 shrink-0 text-brand-text" />}
            {esDigital ? "Producto digital: lo recibes por correo, sin envío." : "Lo despacha la tienda y puedes seguir el envío en tu pedido."}
          </li>
          <li className="flex items-center gap-3">
            <PackageCheck aria-hidden="true" className="size-5 shrink-0 text-brand-text" />
            Pagas una sola vez aunque agregues productos de otras tiendas.
          </li>
        </ul>
      </div>
    </div>
  )
}
