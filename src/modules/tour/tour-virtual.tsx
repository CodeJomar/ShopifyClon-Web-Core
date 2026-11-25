"use client"

import { fijarTiendaAction, misTiendasAction, tiendaActivaAction } from "@/modules/tienda/actions/tienda.actions"
import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import { cn } from "@/shared/utils/cn"
import type { ProductoMercado, PaginaMercado } from "@/dtos/mercado"
import { armarPasos, zonaDeRuta, type PasoTour, type ZonaTour } from "./pasos"

const CLAVE = "otemu-tour"
const EVENTO_INICIAR = "otemu:tour-iniciar"

/** Pide el inicio del tour desde cualquier botón (o desde `?tour=1`). */
export function iniciarTour(zona?: ZonaTour) {
  window.dispatchEvent(new CustomEvent<ZonaTour | undefined>(EVENTO_INICIAR, { detail: zona }))
}

interface Guardado {
  pasos: PasoTour[]
  indice: number
}
const leer = (): Guardado | null => {
  try {
    const crudo = sessionStorage.getItem(CLAVE)
    return crudo ? (JSON.parse(crudo) as Guardado) : null
  } catch {
    return null
  }
}
const guardar = (g: Guardado | null) => {
  try {
    if (g) sessionStorage.setItem(CLAVE, JSON.stringify(g))
    else sessionStorage.removeItem(CLAVE)
  } catch {
    /* sin almacenamiento: el tour sigue en memoria */
  }
}

/** Recuadro (en coordenadas de la ventana) de la zona resaltada. */
interface Zona {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Tour virtual: recorre las pantallas con las flechas del teclado (→ siguiente, ← anterior, Esc cierra). Resalta una zona de cada
 * pantalla y explica qué hay en ella. El avance se guarda en la sesión del navegador, así que sobrevive al cambio de pantalla.
 */
export function TourVirtual() {
  const router = useRouter()
  const ruta = usePathname()
  const [estado, setEstado] = React.useState<Guardado | null>(null)
  const [zona, setZona] = React.useState<Zona | null>(null)
  /** La zona del paso no existe en la pantalla (todavía no hay datos): se muestra un aviso en la tarjeta. */
  const [sinDatos, setSinDatos] = React.useState(false)
  const montado = React.useRef(false)
  // El estado vigente se lee de una referencia para encadenar pulsaciones rápidas y navegar fuera de la actualización de estado.
  const vigente = React.useRef<Guardado | null>(null)

  // Recupera un tour en curso (tras navegar a otra pantalla).
  React.useEffect(() => {
    montado.current = true
    const t = window.setTimeout(() => {
      const guardado = leer()
      vigente.current = guardado
      setEstado(guardado)
    }, 0)
    return () => window.clearTimeout(t)
  }, [])

  const cerrar = React.useCallback(() => {
    vigente.current = null
    guardar(null)
    setEstado(null)
    setZona(null)
  }, [])

  const iniciar = React.useCallback(
    async (pedida?: ZonaTour) => {
      // Sin zona pedida, el recorrido es el de la zona donde se está (público, propietario o administración).
      const zona = pedida ?? zonaDeRuta(window.location.pathname)
      let rutaProducto: string | null = null
      if (zona === "publico") {
        const productos = await resultado(peticionApi<PaginaMercado<ProductoMercado>>({ method: "GET", url: "/mercado/productos", params: { tamano: 12 } }))
        const lista = productos.ok ? productos.datos.datos : []
        const ejemplo = [...lista].sort((a, b) => (b.cantidad_variantes ?? 0) - (a.cantidad_variantes ?? 0))[0]
        rutaProducto = ejemplo ? `/mercado/tienda/${ejemplo.tienda.subdominio}/${ejemplo.identificador_url}` : null
      }
      // Las pantallas del panel exigen una tienda activa: si no hay, se fija la primera de la persona; sin tiendas, el recorrido se acorta.
      let sinTiendas = false
      if (zona === "propietario") {
        const mis = await misTiendasAction()
        sinTiendas = mis.ok && mis.datos.length === 0
        if (!sinTiendas) {
          const activa = await tiendaActivaAction()
          if (!activa.ok && mis.ok) await fijarTiendaAction(mis.datos[0].tienda_id)
        }
      }
      const pasos = armarPasos({ rutaProducto, sinTiendas }, zona)
    const nuevo = { pasos, indice: 0 }
    vigente.current = nuevo
    guardar(nuevo)
    setEstado(nuevo)
      if (window.location.pathname !== pasos[0].ruta) router.push(pasos[0].ruta)
    },
    [router],
  )

  // Inicio por evento (botón) o por ?tour=1 en la dirección.
  React.useEffect(() => {
    const alIniciar = (e?: Event) => void iniciar((e as CustomEvent<ZonaTour | undefined> | undefined)?.detail)
    window.addEventListener(EVENTO_INICIAR, alIniciar)
    const autoinicio = new URLSearchParams(window.location.search).get("tour") === "1" && !leer() ? window.setTimeout(alIniciar, 0) : 0
    return () => {
      window.removeEventListener(EVENTO_INICIAR, alIniciar)
      window.clearTimeout(autoinicio)
    }
  }, [iniciar])

  const ir = React.useCallback(
    (delta: number) => {
      const actual = vigente.current
      if (!actual) return
      const indice = actual.indice + delta
      if (indice < 0) return
      if (indice >= actual.pasos.length) {
        vigente.current = null
        guardar(null)
        setEstado(null)
        return
      }
      const siguiente = { ...actual, indice }
      vigente.current = siguiente
      guardar(siguiente)
      setEstado(siguiente)
      if (window.location.pathname !== actual.pasos[indice].ruta) router.push(actual.pasos[indice].ruta)
    },
    [router],
  )

  // Teclado: → / ">" siguiente, ← / "<" anterior, Esc cierra.
  React.useEffect(() => {
    if (!estado) return
    const alPulsar = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return
      if (e.key === "ArrowRight" || e.key === ">" || e.key === ".") {
        e.preventDefault()
        ir(1)
      } else if (e.key === "ArrowLeft" || e.key === "<" || e.key === ",") {
        e.preventDefault()
        ir(-1)
      } else if (e.key === "Escape") cerrar()
    }
    window.addEventListener("keydown", alPulsar)
    return () => window.removeEventListener("keydown", alPulsar)
  }, [estado, ir, cerrar])

  const paso = estado ? estado.pasos[estado.indice] : null

  // Precarga las pantallas de los dos pasos que siguen: al avanzar con la flecha ya están listas.
  React.useEffect(() => {
    if (!estado) return
    for (const p of estado.pasos.slice(estado.indice + 1, estado.indice + 3)) router.prefetch(p.ruta)
  }, [estado, router])

  // Busca la zona resaltada (la pantalla puede tardar en cargar) y la mantiene al hacer scroll o cambiar el tamaño.
  React.useEffect(() => {
    if (!paso?.selector || ruta !== paso.ruta) return
    let cancelado = false
    let desplazado = false
    let intentos = 0
    // Pantalla sin datos (lista o tabla vacía): tras ~2 s se resalta el encabezado y se avisa que la zona aún está vacía.
    const RESPALDO = '[data-tour="encabezado"], main h1'
    const medir = () => {
      intentos += 1
      let el = document.querySelector<HTMLElement>(paso.selector as string)
      const vacia = !el && intentos > 14
      if (vacia) el = document.querySelector<HTMLElement>(RESPALDO)
      if (!cancelado) setSinDatos(vacia)
      if (!el) return false
      if (!desplazado) {
        el.scrollIntoView({ block: "center", behavior: "smooth" })
        desplazado = true
      }
      const r = el.getBoundingClientRect()
      if (!cancelado) setZona((z) => (z && z.x === r.left && z.y === r.top && z.w === r.width && z.h === r.height ? z : { x: r.left, y: r.top, w: r.width, h: r.height }))
      return true
    }
    const intervalo = window.setInterval(() => {
      if (medir()) {
        window.clearInterval(intervalo)
        seguir = window.setInterval(medir, 250)
      }
    }, 150)
    let seguir = 0
    const parar = window.setTimeout(() => window.clearInterval(intervalo), 5000)
    return () => {
      cancelado = true
      setZona(null)
      setSinDatos(false)
      window.clearInterval(intervalo)
      window.clearInterval(seguir)
      window.clearTimeout(parar)
    }
  }, [paso, ruta])

  if (!estado || !paso) return null
  const total = estado.pasos.length
  const margen = 10
  // La tarjeta se coloca arriba si la zona resaltada está en la mitad baja de la pantalla, para no taparla.
  const arriba = zona !== null && typeof window !== "undefined" && zona.y + zona.h / 2 > window.innerHeight * 0.55

  return (
    <div className="pointer-events-none fixed inset-0 z-[300]" role="dialog" aria-label="Tour virtual" aria-live="polite">
      {/* Oscurece la pantalla y deja a la vista la zona resaltada, con un borde de neón. */}
      {zona ? (
        <div
          aria-hidden="true"
          className="absolute rounded-2xl border-2 border-primary transition-[left,top,width,height] duration-300"
          style={{
            left: zona.x - margen,
            top: zona.y - margen,
            width: zona.w + margen * 2,
            height: zona.h + margen * 2,
            boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.62)",
          }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-black/30" />
      )}

      <div className={cn("absolute inset-x-0 flex justify-center px-4", arriba ? "top-24" : "bottom-0 pb-6 sm:pb-8")}>
        <div className={cn("w-full max-w-xl rounded-3xl border border-primary/60 bg-[#0b1519] p-5 shadow-2xl sm:p-6")}>
          <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            <span>Tour virtual</span>
            <span aria-label={`Paso ${estado.indice + 1} de ${total}`}>
              {estado.indice + 1} / {total}
            </span>
          </div>
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div className="h-full rounded-full bg-primary shadow-[0_0_10px_rgb(0_230_153/0.9)] transition-[width] duration-300" style={{ width: `${((estado.indice + 1) / total) * 100}%` }} />
          </div>
          <h2 className="mt-4 text-[22px] font-extrabold leading-tight tracking-tight text-white sm:text-[26px]">{paso.titulo}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/75">{paso.texto}</p>
          {sinDatos && <p className="mt-2 rounded-xl bg-white/8 px-3 py-2 text-[13px] font-semibold text-white/70">Esta zona aún no tiene datos en tu cuenta: aparecerá aquí cuando los haya.</p>}
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] font-semibold text-white/55">
            <span className="flex items-center gap-1.5">
              <Tecla>←</Tecla> anterior
            </span>
            <span className="flex items-center gap-1.5">
              <Tecla>→</Tecla> {estado.indice === total - 1 ? "terminar" : "siguiente"}
            </span>
            <span className="flex items-center gap-1.5">
              <Tecla>Esc</Tecla> salir
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

function Tecla({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-md border border-white/25 bg-white/10 px-1.5 py-0.5 font-sans text-[12px] font-bold text-white">{children}</kbd>
}
