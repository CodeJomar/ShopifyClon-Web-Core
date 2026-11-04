"use client"

import * as React from "react"
import type { Map as MapaLeaflet, Marker as MarcadorLeaflet } from "leaflet"
import "leaflet/dist/leaflet.css"
import { LocateFixed, MapPin } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"

export interface Ubicacion {
  latitud: number
  longitud: number
}

/** Lima: punto de partida cuando todavía no hay nada marcado. */
const CENTRO_INICIAL: [number, number] = [-12.0464, -77.0428]
const ZOOM_INICIAL = 12
const ZOOM_PUNTO = 16
const TESELAS = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
const ATRIBUCION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

/** Pin de la marca, sin imágenes externas (los iconos por defecto de Leaflet no sobreviven al empaquetado). */
function crearIcono(L: typeof import("leaflet")) {
  return L.divIcon({
    className: "",
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    html: `<svg width="34" height="44" viewBox="0 0 34 44" aria-hidden="true"><path d="M17 1C8.7 1 2 7.5 2 15.6 2 26.4 17 42 17 42s15-15.6 15-26.4C32 7.5 25.3 1 17 1Z" fill="var(--primary)" stroke="var(--brand-strong)" stroke-width="2"/><circle cx="17" cy="15.5" r="5.5" fill="#fff"/></svg>`,
  })
}

interface BaseMapaProps {
  valor: Ubicacion | null
  /** Si se pasa, el mapa es interactivo: clic o arrastre del pin. */
  alCambiar?: (u: Ubicacion) => void
  className?: string
}

function BaseMapa({ valor, alCambiar, className }: BaseMapaProps) {
  const contenedor = React.useRef<HTMLDivElement>(null)
  const mapa = React.useRef<MapaLeaflet | null>(null)
  const marcador = React.useRef<MarcadorLeaflet | null>(null)
  const libreria = React.useRef<typeof import("leaflet") | null>(null)
  const callback = React.useRef(alCambiar)
  const valorActual = React.useRef(valor)
  const [listo, setListo] = React.useState(false)
  const interactivo = Boolean(alCambiar)

  React.useEffect(() => {
    callback.current = alCambiar
    valorActual.current = valor
  })

  // Crea el mapa una sola vez (Leaflet necesita `window`, por eso se importa aquí y no arriba).
  React.useEffect(() => {
    let cancelado = false
    void import("leaflet").then((L) => {
      if (cancelado || !contenedor.current || mapa.current) return
      libreria.current = L
      const inicial = valorActual.current
      const m = L.map(contenedor.current, {
        center: inicial ? [inicial.latitud, inicial.longitud] : CENTRO_INICIAL,
        zoom: inicial ? ZOOM_PUNTO : ZOOM_INICIAL,
        scrollWheelZoom: false,
        attributionControl: true,
      })
      L.tileLayer(TESELAS, { attribution: ATRIBUCION, maxZoom: 19 }).addTo(m)
      if (callback.current) {
        m.on("click", (e) => callback.current?.({ latitud: e.latlng.lat, longitud: e.latlng.lng }))
      }
      mapa.current = m
      setListo(true)
    })
    return () => {
      cancelado = true
      mapa.current?.remove()
      mapa.current = null
      marcador.current = null
    }
  }, [])

  // Sincroniza el pin con el valor.
  React.useEffect(() => {
    const m = mapa.current
    const L = libreria.current
    if (!listo || !m || !L) return
    if (!valor) {
      marcador.current?.remove()
      marcador.current = null
      return
    }
    const punto: [number, number] = [valor.latitud, valor.longitud]
    if (!marcador.current) {
      const pin = L.marker(punto, { icon: crearIcono(L), draggable: interactivo, keyboard: interactivo }).addTo(m)
      if (interactivo) {
        pin.on("dragend", () => {
          const p = pin.getLatLng()
          callback.current?.({ latitud: p.lat, longitud: p.lng })
        })
      }
      marcador.current = pin
    } else {
      marcador.current.setLatLng(punto)
    }
    m.setView(punto, Math.max(m.getZoom(), ZOOM_PUNTO), { animate: true })
  }, [valor, listo, interactivo])

  return (
    <div
      ref={contenedor}
      className={cn("relative z-0 h-64 w-full overflow-hidden rounded-xl border border-border bg-muted", className)}
      role="application"
      aria-label={interactivo ? "Mapa para marcar el punto de entrega" : "Mapa del punto de entrega"}
    />
  )
}

interface SelectorUbicacionProps {
  valor: Ubicacion | null
  alCambiar: (u: Ubicacion) => void
  /** Mensaje de error de validación (p. ej. falta marcar el punto). */
  error?: string
  className?: string
}

/** Mapa para que el comprador marque el punto de entrega: clic, arrastrar el pin o usar su ubicación. */
export function SelectorUbicacion({ valor, alCambiar, error, className }: SelectorUbicacionProps) {
  const [buscando, setBuscando] = React.useState(false)
  const [aviso, setAviso] = React.useState<string | null>(null)

  const usarMiUbicacion = () => {
    if (!("geolocation" in navigator)) {
      setAviso("Tu navegador no permite obtener la ubicación. Marca el punto en el mapa.")
      return
    }
    setBuscando(true)
    setAviso(null)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setBuscando(false)
        alCambiar({ latitud: p.coords.latitude, longitud: p.coords.longitude })
      },
      () => {
        setBuscando(false)
        setAviso("No pudimos obtener tu ubicación. Marca el punto en el mapa.")
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <MapPin className="size-4 text-brand-text" aria-hidden="true" />
          Punto de entrega
        </p>
        <Button type="button" variant="outline" size="sm" onClick={usarMiUbicacion} disabled={buscando}>
          <LocateFixed aria-hidden="true" />
          {buscando ? "Buscando…" : "Usar mi ubicación"}
        </Button>
      </div>
      <BaseMapa valor={valor} alCambiar={alCambiar} className={cn(error && "border-destructive")} />
      <p className={cn("text-xs", error ? "font-semibold text-destructive-text" : "text-muted-foreground")} role={error ? "alert" : undefined}>
        {error ?? aviso ?? (valor ? "Arrastra el pin o toca el mapa para ajustar el punto exacto." : "Toca el mapa para marcar dónde recibirás el pedido.")}
      </p>
    </div>
  )
}

interface VisorUbicacionProps {
  valor: Ubicacion | null | undefined
  className?: string
}

/** Mapa de solo lectura con el punto de entrega. Sin coordenadas (órdenes antiguas) no muestra nada. */
export function VisorUbicacion({ valor, className }: VisorUbicacionProps) {
  if (!valor) return null
  return <BaseMapa valor={valor} className={className} />
}
