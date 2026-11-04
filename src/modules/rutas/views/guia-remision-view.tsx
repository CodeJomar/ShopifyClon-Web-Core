"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Printer, Route } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import type { RutaDetalle } from "@/dtos/ruta"
import type { ErrorApi } from "@/lib/api/error-api"
import { rutaAction } from "../actions/rutas.actions"
import { formatearDia } from "../etiquetas"

/**
 * Guía de remisión de una ruta lista para imprimir (A4). Es un documento simplificado de uso interno:
 * no reemplaza a la guía electrónica de la SUNAT, y así se indica en el pie. La hoja siempre es clara
 * (papel blanco) aunque el panel esté en modo oscuro. El resto de la pantalla se oculta al imprimir (globals.css).
 */
export function GuiaRemisionView({ id }: { id: string }) {
  const router = useRouter()
  const [ruta, setRuta] = React.useState<RutaDetalle | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  React.useEffect(() => {
    let cancelado = false
    rutaAction(id).then((res) => {
      if (cancelado) return
      if (res.ok) setRuta(res.datos)
      else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [id])

  if (error) {
    return (
      <Card>
        <CardContent>
          <EstadoVacio icono={Route} titulo="No pudimos abrir la guía" descripcion={error.message} accion={{ texto: "Volver a las rutas", onClick: () => router.push("/panel/rutas") }} />
        </CardContent>
      </Card>
    )
  }
  if (!ruta) return <Skeleton className="h-[600px] rounded-xl" aria-busy="true" aria-label="Cargando la guía" />

  const unidades = ruta.paradas.reduce((suma, p) => suma + p.items.reduce((s, i) => s + i.cantidad, 0), 0)

  return (
    <div className="space-y-4">
      <div className="no-imprimir flex flex-wrap items-center justify-between gap-3">
        <Link href={`/panel/rutas/${ruta.id}`} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-text hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" /> Volver a la ruta
        </Link>
        <div className="flex items-center gap-2">
          <p className="hidden text-[12.5px] text-muted-foreground sm:block">Elige «Guardar como PDF» en la ventana de impresión para obtener el archivo.</p>
          <Button onClick={() => window.print()} leftIcon={<Printer aria-hidden="true" />}>
            Imprimir guía
          </Button>
        </div>
      </div>

      <article className="hoja-guia mx-auto w-full max-w-[820px] rounded-xl border border-border bg-white p-6 text-[12px] leading-snug text-neutral-900 shadow-isla sm:p-9" aria-label={`Guía de remisión ${ruta.codigo}`}>
        <header className="flex items-start justify-between gap-6 border-b-2 border-neutral-900 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Guía de remisión</p>
            <h1 className="mt-1 text-[22px] font-extrabold">{ruta.tienda.nombre}</h1>
            <p className="mt-1 text-neutral-600">
              {[ruta.tienda.direccion, ruta.tienda.telefono, ruta.tienda.correo_electronico].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="shrink-0 rounded-md border-2 border-neutral-900 px-4 py-2 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">N.º</p>
            <p className="font-mono text-[18px] font-extrabold">{ruta.codigo}</p>
          </div>
        </header>

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <Campo titulo="Fecha de traslado" valor={formatearDia(ruta.fecha)} />
          <Campo titulo="Chofer" valor={ruta.chofer} />
          <Campo titulo="Placa del vehículo" valor={ruta.placa} mono />
        </section>
        {ruta.nota && <p className="mt-3 rounded-md bg-neutral-100 px-3 py-2"><strong>Nota:</strong> {ruta.nota}</p>}

        <table className="mt-5 w-full border-collapse text-left">
          <thead>
            <tr className="bg-neutral-100 text-[10.5px] uppercase tracking-wide text-neutral-600">
              <th className="border border-neutral-300 px-2 py-1.5">#</th>
              <th className="border border-neutral-300 px-2 py-1.5">Orden</th>
              <th className="border border-neutral-300 px-2 py-1.5">Destinatario y dirección</th>
              <th className="border border-neutral-300 px-2 py-1.5">Productos</th>
            </tr>
          </thead>
          <tbody>
            {ruta.paradas.map((p) => (
              <tr key={p.envio_id} className="align-top">
                <td className="border border-neutral-300 px-2 py-2 font-bold">{p.posicion}</td>
                <td className="border border-neutral-300 px-2 py-2 font-mono font-bold">
                  {p.numero_orden}
                  {p.numero_guia && <span className="block text-[10.5px] font-normal text-neutral-500">{p.numero_guia}</span>}
                </td>
                <td className="border border-neutral-300 px-2 py-2">
                  <p className="font-bold">{p.destinatario}</p>
                  <p>
                    {p.direccion.direccion_linea1}
                    {p.direccion.direccion_linea2 ? ` (${p.direccion.direccion_linea2})` : ""}
                  </p>
                  <p>{[p.direccion.ciudad, p.direccion.estado_provincia, p.direccion.pais].filter(Boolean).join(", ")}</p>
                  {p.telefono && <p>Tel. {p.telefono}</p>}
                </td>
                <td className="border border-neutral-300 px-2 py-2">
                  {p.items.map((i, n) => (
                    <p key={n}>
                      {i.cantidad} × {i.titulo_producto}
                      {i.titulo_variante && i.titulo_variante !== "Predeterminada" ? ` · ${i.titulo_variante}` : ""}
                      {i.sku ? <span className="text-neutral-500"> ({i.sku})</span> : null}
                    </p>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="border border-neutral-300 px-2 py-1.5 text-right font-bold">
                {ruta.paradas.length} {ruta.paradas.length === 1 ? "parada" : "paradas"} · {unidades} {unidades === 1 ? "unidad" : "unidades"}
              </td>
            </tr>
          </tfoot>
        </table>

        <section className="mt-12 grid grid-cols-2 gap-10">
          <Firma titulo="Entregado por (tienda)" />
          <Firma titulo={`Recibido por (chofer ${ruta.chofer})`} />
        </section>

        <footer className="mt-8 border-t border-neutral-300 pt-3 text-[10.5px] text-neutral-500">
          Documento simplificado de uso interno generado por OTemu. No reemplaza a la guía de remisión electrónica exigida por la SUNAT.
        </footer>
      </article>
    </div>
  )
}

function Campo({ titulo, valor, mono }: { titulo: string; valor: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-neutral-300 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{titulo}</p>
      <p className={`mt-0.5 text-[13px] font-bold ${mono ? "font-mono" : ""}`}>{valor}</p>
    </div>
  )
}

function Firma({ titulo }: { titulo: string }) {
  return (
    <div>
      <div className="h-10 border-b border-neutral-900" />
      <p className="mt-1 text-center text-[11px] text-neutral-600">{titulo}</p>
    </div>
  )
}
