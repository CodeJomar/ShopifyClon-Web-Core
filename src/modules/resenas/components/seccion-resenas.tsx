"use client"

import * as React from "react"
import Link from "next/link"
import { BadgeCheck, MessageSquareText, Star } from "lucide-react"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { toast } from "@/shared/components/ui/toast"
import { claseBotonContorno, claseBotonMarca } from "@/shared/components/marketing/estilos"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import { formatearFecha } from "@/shared/utils/fechas"
import { cn } from "@/shared/utils/cn"
import type { OrdenResenas, RespuestaResenas } from "@/dtos/resenas"
import { Estrellas } from "./estrellas"

const ORDENES: { valor: OrdenResenas; etiqueta: string }[] = [
  { valor: "recientes", etiqueta: "Más recientes" },
  { valor: "mejores", etiqueta: "Mejor calificadas" },
  { valor: "peores", etiqueta: "Peor calificadas" },
]
const llamar = <T,>(c: Parameters<typeof peticionApi<T>>[0]) => resultado(peticionApi<T>({ ...c, sinRedireccion401: true }))

/** Reseñas de un producto: resumen con la distribución, formulario para quien compró y lista paginada. */
export function SeccionResenas({ subdominio, slug }: { subdominio: string; slug: string }) {
  const base = `/vitrina/${encodeURIComponent(subdominio)}/productos/${encodeURIComponent(slug)}/resenas`
  const [pagina, setPagina] = React.useState(0)
  const [orden, setOrden] = React.useState<OrdenResenas>("recientes")
  const [datos, setDatos] = React.useState<RespuestaResenas | null>(null)
  const [fallo, setFallo] = React.useState(false)
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    let cancelado = false
    void llamar<RespuestaResenas>({ method: "GET", url: base, params: { pagina, orden } }).then((res) => {
      if (cancelado) return
      if (res.ok) {
        setDatos(res.datos)
        setFallo(false)
      } else setFallo(true)
    })
    return () => {
      cancelado = true
    }
  }, [base, pagina, orden, version])

  const recargar = () => {
    setPagina(0)
    setVersion((v) => v + 1)
  }

  return (
    <section className="mt-16" aria-labelledby="resenas-titulo">
      <h2 id="resenas-titulo" className="text-[24px] font-extrabold tracking-tight text-foreground">Reseñas</h2>

      {fallo ? (
        <p className="mt-4 text-[14px] text-muted-foreground">Por ahora no podemos mostrar las reseñas de este producto.</p>
      ) : !datos ? (
        <Skeleton className="mt-5 h-40 rounded-3xl" aria-busy="true" aria-label="Cargando reseñas" />
      ) : (
        <div className="mt-5 grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="space-y-5">
            <Resumen datos={datos} />
            <Formulario base={base} datos={datos} alGuardar={recargar} />
          </div>
          <div>
            {datos.pagina.total === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-14 text-center">
                <MessageSquareText aria-hidden="true" className="size-10 text-muted-foreground" strokeWidth={1.4} />
                <p className="mt-3 text-[16px] font-extrabold text-foreground">Aún no hay reseñas</p>
                <p className="mt-1 max-w-sm text-[13.5px] text-muted-foreground">Quien compre este producto podrá calificarlo y contar su experiencia.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Ordenar reseñas">
                  {ORDENES.map((o) => (
                    <button
                      key={o.valor}
                      type="button"
                      aria-pressed={orden === o.valor}
                      onClick={() => {
                        setOrden(o.valor)
                        setPagina(0)
                      }}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                        orden === o.valor ? "border-transparent bg-primary text-sobre-marca" : "border-white/12 bg-white/[0.06] text-foreground backdrop-blur-md hover:border-primary",
                      )}
                    >
                      {o.etiqueta}
                    </button>
                  ))}
                </div>
                <ul className="mt-4 space-y-3">
                  {datos.pagina.datos.map((r) => (
                    <li key={r.id} className="rounded-2xl vidrio p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Estrellas promedio={r.calificacion} cantidad={1} mostrarNumero={false} />
                        <span className="text-[12.5px] font-medium text-muted-foreground">{formatearFecha(r.fecha)}</span>
                      </div>
                      {r.comentario && <p className="mt-2.5 whitespace-pre-line text-[14.5px] leading-relaxed text-foreground">{r.comentario}</p>}
                      <p className="mt-3 flex items-center gap-2 text-[12.5px] font-semibold text-muted-foreground">
                        {r.autor}
                        {r.compra_verificada && (
                          <span className="inline-flex items-center gap-1 text-brand-text"><BadgeCheck aria-hidden="true" className="size-3.5" /> Compra verificada</span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
                {datos.pagina.total_paginas > 1 && (
                  <nav aria-label="Paginación de reseñas" className="mt-5 flex items-center justify-center gap-3">
                    <button type="button" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)} className={cn(claseBotonContorno, "h-10 px-4 disabled:opacity-40")}>Anterior</button>
                    <span className="text-[13.5px] font-semibold text-muted-foreground">Página {pagina + 1} de {datos.pagina.total_paginas}</span>
                    <button type="button" disabled={pagina + 1 >= datos.pagina.total_paginas} onClick={() => setPagina((p) => p + 1)} className={cn(claseBotonContorno, "h-10 px-4 disabled:opacity-40")}>Siguiente</button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function Resumen({ datos }: { datos: RespuestaResenas }) {
  const { promedio, total, distribucion } = datos.resumen
  return (
    <div className="rounded-3xl vidrio p-6">
      {promedio == null || total === 0 ? (
        <p className="text-[14px] font-semibold text-muted-foreground">Sin calificaciones todavía.</p>
      ) : (
        <>
          <p className="text-[44px] font-extrabold leading-none tracking-tight text-foreground">{promedio.toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</p>
          <Estrellas promedio={promedio} cantidad={total} tamano="lg" mostrarNumero={false} className="mt-2" />
          <p className="mt-1 text-[13px] font-medium text-muted-foreground">{total} {total === 1 ? "reseña" : "reseñas"}</p>
          <ul className="mt-4 space-y-1.5" aria-label="Distribución de calificaciones">
            {[5, 4, 3, 2, 1].map((n) => {
              const cantidad = distribucion[String(n)] ?? 0
              return (
                <li key={n} className="flex items-center gap-2.5 text-[12.5px]">
                  <span className="w-8 shrink-0 font-semibold text-foreground">{n} ★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${total ? (cantidad / total) * 100 : 0}%` }} />
                  </span>
                  <span className="w-6 shrink-0 text-right font-medium text-muted-foreground">{cantidad}</span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

function Formulario({ base, datos, alGuardar }: { base: string; datos: RespuestaResenas; alGuardar: () => void }) {
  const mia = datos.mi_resena
  const [calificacion, setCalificacion] = React.useState(mia?.calificacion ?? 0)
  const [comentario, setComentario] = React.useState(mia?.comentario ?? "")
  const [error, setError] = React.useState<string | null>(null)
  const [enviando, setEnviando] = React.useState(false)

  if (!datos.puedo_resenar && !mia) {
    return (
      <p className="rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 text-[13px] font-medium leading-relaxed text-muted-foreground backdrop-blur-xl">
        Solo quien compró este producto puede calificarlo. <Link href="/login" className="font-bold text-brand-text hover:underline">Inicia sesión</Link> si ya lo compraste.
      </p>
    )
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (calificacion < 1) return setError("Elige de 1 a 5 estrellas.")
    setEnviando(true)
    setError(null)
    const res = mia
      ? await llamar<unknown>({ method: "PUT", url: `/cuenta/resenas/${encodeURIComponent(mia.id)}`, data: { calificacion, comentario: comentario.trim() || undefined } })
      : await llamar<unknown>({ method: "POST", url: base, data: { calificacion, comentario: comentario.trim() || undefined } })
    setEnviando(false)
    if (!res.ok) return setError(res.error.message)
    toast.add({ type: "success", title: mia ? "Reseña actualizada" : "Gracias por tu reseña" })
    alGuardar()
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4 rounded-3xl vidrio p-6">
      <h3 className="text-[16px] font-extrabold tracking-tight text-foreground">{mia ? "Tu reseña" : "Cuéntanos qué te pareció"}</h3>
      <fieldset>
        <legend className="sr-only">Tu calificación</legend>
        <div className="flex gap-1" role="radiogroup" aria-label="Tu calificación">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={calificacion === n}
              aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
              onClick={() => setCalificacion(n)}
              className="flex size-11 items-center justify-center rounded-xl outline-none transition-colors hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              <Star aria-hidden="true" className={cn("size-7 text-warning", n <= calificacion ? "fill-warning" : "fill-transparent")} strokeWidth={1.8} />
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block space-y-1.5">
        <span className="text-[12.5px] font-bold text-muted-foreground">Comentario (opcional)</span>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          maxLength={1000}
          rows={4}
          className="w-full resize-y rounded-xl border-[1.8px] border-input bg-transparent px-3.5 py-3 text-[14px] text-foreground outline-none transition-colors hover:border-border-hover focus-visible:border-primary focus-visible:ring-[3.5px] focus-visible:ring-primary/18"
        />
        <span className="block text-right text-[11.5px] text-muted-foreground">{comentario.length} / 1000</span>
      </label>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <button type="submit" disabled={enviando} className={cn(claseBotonMarca, "w-full disabled:opacity-60")}>
        {enviando ? "Enviando…" : mia ? "Guardar cambios" : "Publicar reseña"}
      </button>
    </form>
  )
}
