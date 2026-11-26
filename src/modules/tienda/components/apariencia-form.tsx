"use client"

import * as React from "react"
import { Check, ImageUp, Palette, Trash2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { toast } from "@/shared/components/ui/toast"
import { cn } from "@/shared/utils/cn"
import {
  APARIENCIA_POR_DEFECTO,
  DISENOS,
  MODOS,
  PALETAS,
  TAMANOS,
  TIPOGRAFIAS,
  atributosApariencia,
  normalizarApariencia,
  type AparienciaTienda,
  type Diseno,
  type Opcion,
} from "@/modules/apariencia/catalogo"
import type { TiendaActivaDto } from "@/dtos/tienda"
import { subirImagenAction } from "@/modules/catalogo/actions/catalogo.actions"
import { LogoTienda } from "@/modules/vitrina/components/logo-tienda"
import { actualizarAparienciaAction } from "../actions/tienda.actions"

/** Un grupo de opciones fijas: una tarjeta por opción, con teclado (flechas) y la elegida marcada. */
function Grupo<T extends string>({
  titulo,
  opciones,
  valor,
  onCambiar,
  deshabilitado,
  extra,
}: {
  titulo: string
  opciones: Opcion<T>[]
  valor: T
  onCambiar: (v: T) => void
  deshabilitado: boolean
  extra?: (o: Opcion<T>) => React.ReactNode
}) {
  return (
    <fieldset className="space-y-2.5" disabled={deshabilitado}>
      <legend className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">{titulo}</legend>
      <div role="radiogroup" aria-label={titulo} className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {opciones.map((o) => {
          const elegida = o.codigo === valor
          return (
            <button
              key={o.codigo}
              type="button"
              role="radio"
              aria-checked={elegida}
              onClick={() => onCambiar(o.codigo)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border-[1.8px] p-3.5 text-left outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60",
                elegida ? "border-primary bg-primary/8" : "border-input hover:border-border-hover",
              )}
            >
              {extra?.(o)}
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold text-foreground">{o.nombre}</span>
                <span className="block text-[12.5px] text-muted-foreground">{o.descripcion}</span>
              </span>
              {elegida && <Check className="mt-0.5 size-4 shrink-0 text-brand-text" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Esquema de cada diseño (bloques grises) para elegirlo de un vistazo. */
function MiniDiseno({ diseno }: { diseno: Diseno }) {
  const bloque = "rounded-[3px] bg-muted-foreground/35"
  return (
    <span aria-hidden="true" className="grid h-10 w-14 shrink-0 gap-0.5 rounded-md bg-secondary p-1">
      {diseno === "CUADRICULA" && <span className="grid grid-cols-4 gap-0.5">{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <i key={i} className={bloque} />)}</span>}
      {diseno === "REVISTA" && (
        <span className="grid grid-cols-3 grid-rows-2 gap-0.5">
          <i className={cn(bloque, "col-span-2 row-span-2")} />
          <i className={bloque} />
          <i className={bloque} />
        </span>
      )}
      {diseno === "LISTA" && <span className="grid grid-cols-2 gap-0.5">{[0, 1, 2, 3].map((i) => <i key={i} className={cn(bloque, "h-3.5")} />)}</span>}
      {diseno === "PORTADA" && (
        <span className="grid grid-rows-[1.2fr_1fr] gap-0.5">
          <i className={cn(bloque, "bg-primary/60")} />
          <span className="grid grid-cols-3 gap-0.5">{[0, 1, 2].map((i) => <i key={i} className={bloque} />)}</span>
        </span>
      )}
    </span>
  )
}

/** Vista previa en vivo: una vitrina en miniatura con la apariencia que se está eligiendo. */
function VistaPrevia({ a, nombre }: { a: AparienciaTienda; nombre: string }) {
  const tile = "rounded-lg border border-border bg-card"
  const filas = a.diseno === "LISTA" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-3"
  return (
    <div {...atributosApariencia(a)} className="apariencia-tienda overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center gap-2 border-b border-border bg-card px-3.5 py-2.5">
        <LogoTienda nombre={nombre} logoUrl={a.logo_url} className="size-6 rounded-md text-[12px]" />
        <span className="text-[13px] font-extrabold">{nombre}</span>
        <span className="ml-auto text-[11px] text-muted-foreground">Inicio · Productos</span>
      </div>
      <div className="space-y-3 p-3.5">
        <div className={cn("rounded-xl border border-border bg-card p-3.5", a.diseno === "PORTADA" ? "py-7 text-center" : a.diseno === "LISTA" ? "py-2" : "")}>
          <p className="text-[15px] font-extrabold tracking-tight">{nombre}</p>
          <p className="text-[12px] text-muted-foreground">Descubre lo nuevo de la tienda y compra en pocos pasos.</p>
          <span className="mt-2 inline-flex rounded-lg bg-primary px-3 py-1.5 text-[12px] font-bold text-primary-foreground">Explorar catálogo</span>
        </div>
        <p className="text-[12px] font-extrabold text-brand-text">Productos recientes</p>
        <div className={cn("grid gap-2", a.diseno === "REVISTA" ? "grid-cols-3 grid-rows-2" : filas)}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={cn(tile, "p-2", a.diseno === "REVISTA" && i === 0 && "col-span-2 row-span-2")}>
              <div className="mb-1.5 h-10 rounded-md bg-secondary" />
              <p className="text-[11.5px] font-bold">Producto {i + 1}</p>
              <p className="text-[11.5px] font-extrabold text-brand-text">S/ {(29 + i * 10).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Apariencia de la vitrina: paleta, tipografía, tamaño de letra, diseño y modo, todas de listas fijas, con vista previa en vivo. */
export function AparienciaForm({ tienda, puedeEditar, onActualizado }: { tienda: TiendaActivaDto; puedeEditar: boolean; onActualizado: () => void }) {
  const guardada = React.useMemo(() => normalizarApariencia(tienda.apariencia), [tienda.apariencia])
  const [a, setA] = React.useState<AparienciaTienda>(guardada)
  const [guardando, setGuardando] = React.useState(false)
  const [subiendo, setSubiendo] = React.useState(false)
  const inputLogo = React.useRef<HTMLInputElement>(null)
  const cambiado = JSON.stringify(a) !== JSON.stringify(guardada)
  const poner = <K extends keyof AparienciaTienda>(k: K) => (v: AparienciaTienda[K]) => setA((x) => ({ ...x, [k]: v }))

  const elegirLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    e.target.value = ""
    if (!archivo) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) return void toast.add({ type: "error", title: "Formato no válido", description: "Sube una imagen JPG, PNG o WebP." })
    if (archivo.size > 5 * 1024 * 1024) return void toast.add({ type: "error", title: "La imagen pesa demasiado", description: "El máximo es 5 MB." })
    setSubiendo(true)
    const res = await subirImagenAction(archivo)
    setSubiendo(false)
    if (!res.ok) return void toast.add({ type: "error", title: "No se pudo subir el logo", description: res.error.message })
    setA((x) => ({ ...x, logo_url: res.datos.url }))
    toast.add({ type: "success", title: "Logo cargado", description: "Pulsa «Guardar apariencia» para publicarlo." })
  }

  const guardar = async () => {
    setGuardando(true)
    const res = await actualizarAparienciaAction(a)
    setGuardando(false)
    if (!res.ok) return void toast.add({ type: "error", title: "No se pudo guardar la apariencia", description: res.error.message })
    toast.add({ type: "success", title: "Apariencia guardada", description: "Tu vitrina ya se ve así." })
    onActualizado()
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Palette className="size-5 text-brand-text" aria-hidden="true" />
            <div>
              <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Apariencia de tu vitrina</h2>
              <p className="text-[13px] text-muted-foreground">Elige cómo se ve tu tienda para quienes la visitan. Solo afecta a tu vitrina pública.</p>
            </div>
          </div>
          {puedeEditar && (
            <div className="flex flex-wrap gap-2">
              <Button variant="neutral" size="sm" onClick={() => setA(APARIENCIA_POR_DEFECTO)} disabled={guardando}>Restablecer</Button>
              <Button size="sm" onClick={guardar} loading={guardando} disabled={!cambiado}>Guardar apariencia</Button>
            </div>
          )}
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div className="min-w-0 space-y-6">
            <fieldset className="space-y-2.5" disabled={!puedeEditar}>
              <legend className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">Logo de tu tienda</legend>
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border-[1.8px] border-input p-3.5">
                <LogoTienda nombre={tienda.nombre} logoUrl={a.logo_url} className="size-16 rounded-2xl text-[26px]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-foreground">{a.logo_url ? "Tu logo" : "Aún no tienes logo"}</p>
                  <p className="text-[12.5px] text-muted-foreground">Se ve en la cabecera y en la portada de tu vitrina. JPG, PNG o WebP, hasta 5 MB; mejor cuadrado.</p>
                </div>
                <input ref={inputLogo} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={elegirLogo} aria-label="Elegir archivo del logo" />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="soft" loading={subiendo} onClick={() => inputLogo.current?.click()} leftIcon={<ImageUp aria-hidden="true" />}>
                    {a.logo_url ? "Cambiar logo" : "Subir logo"}
                  </Button>
                  {a.logo_url && (
                    <Button type="button" size="sm" variant="danger-outline" onClick={() => setA((x) => ({ ...x, logo_url: null }))} leftIcon={<Trash2 aria-hidden="true" />}>
                      Quitar
                    </Button>
                  )}
                </div>
              </div>
            </fieldset>
            <Grupo titulo="Paleta de color" opciones={PALETAS} valor={a.paleta} onCambiar={poner("paleta")} deshabilitado={!puedeEditar}
              extra={(o) => <span aria-hidden="true" className="mt-0.5 size-6 shrink-0 rounded-full ring-1 ring-white/20" style={{ background: PALETAS.find((p) => p.codigo === o.codigo)?.muestra }} />} />
            <Grupo titulo="Tipografía" opciones={TIPOGRAFIAS} valor={a.tipografia} onCambiar={poner("tipografia")} deshabilitado={!puedeEditar}
              extra={(o) => <span aria-hidden="true" className={cn("mt-0.5 w-7 shrink-0 text-[22px] font-bold leading-none", TIPOGRAFIAS.find((t) => t.codigo === o.codigo)?.clase)}>Aa</span>} />
            <Grupo titulo="Tamaño de letra" opciones={TAMANOS} valor={a.tamano_letra} onCambiar={poner("tamano_letra")} deshabilitado={!puedeEditar} />
            <Grupo titulo="Diseño de la vitrina" opciones={DISENOS} valor={a.diseno} onCambiar={poner("diseno")} deshabilitado={!puedeEditar}
              extra={(o) => <MiniDiseno diseno={o.codigo} />} />
            <Grupo titulo="Modo" opciones={MODOS} valor={a.modo} onCambiar={poner("modo")} deshabilitado={!puedeEditar} />
            {!puedeEditar && <p className="text-[12.5px] text-muted-foreground">Solo quien puede configurar la tienda cambia su apariencia.</p>}
          </div>

          <div className="space-y-2 xl:sticky xl:top-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">Vista previa</p>
            <VistaPrevia a={a} nombre={tienda.nombre} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
