import type { LucideIcon } from "lucide-react"

import type { Puede, Requisito } from "./permisos"

// TODO(W-007): la navegación del panel se define al rehacer el layout del panel. Vacía tras W-001.

/** Pantalla de inicio. TODO(W-007): sin pantallas de workspace todavía; la raíz "/" es el marcador. */
export const HOME_HREF = "/"

/**
 * Mapa único de navegación del workspace. De aquí salen: el menú lateral, las migas de pan, la protección de
 * cada ruta y la página inicial tras el login. Para añadir una pantalla se agrega UNA entrada aquí.
 */
export interface NavItem {
  id: string
  /** Texto del menú lateral. */
  label: string
  icon: LucideIcon
  /** Ruta de la pantalla. Un grupo no tiene ruta propia, solo hijos. */
  href?: string
  /** Permiso mínimo para ver la pantalla. Un grupo se muestra si el usuario ve al menos un hijo. */
  permiso?: Requisito
  /** Migas de pan [sección, pantalla]; por defecto [label del grupo o del ítem, label]. */
  migas?: [string, string]
  hijos?: NavItem[]
  /** No se dibuja en el menú lateral (se llega por otro lado, p. ej. el logo), pero sí cuenta para migas y rutas. */
  oculto?: boolean
}

// TODO(W-007): entradas del panel (Q-W-001: lista vacía hasta que el diseño y los módulos se definan)
export const NAVEGACION: NavItem[] = []

/** Mi perfil: no está en el menú; se abre desde el usuario al pie de la barra lateral y no pide permiso. */
// TODO(W-007): la ruta /perfil se define al rehacer la cuenta; hoy no existe.
export const PERFIL_HREF = "/perfil"

/** Una pantalla encontrada en el mapa, junto con el grupo al que pertenece (si lo tiene). */
export interface RutaEncontrada {
  item: NavItem
  grupo?: NavItem
}

function hojas(items: NavItem[], grupo?: NavItem): RutaEncontrada[] {
  return items.flatMap((item) => (item.hijos ? hojas(item.hijos, item) : item.href ? [{ item, grupo }] : []))
}

/** Todas las pantallas con ruta, en el orden del menú. */
export const RUTAS: RutaEncontrada[] = hojas(NAVEGACION)

/** Pantalla que corresponde a una URL (exacta o anidada: /menu/123 → /menu). */
export function rutaDe(pathname: string): RutaEncontrada | undefined {
  return RUTAS.find(({ item }) => pathname === item.href || pathname.startsWith(`${item.href}/`))
}

/** Permiso que exige una URL; undefined si la ruta no está en el mapa o no pide permiso. */
export function permisoDeRuta(pathname: string): Requisito | undefined {
  return rutaDe(pathname)?.item.permiso
}

/** Migas de pan [sección, pantalla] de una URL. */
export function migasDe(pathname: string): [string, string] {
  if (pathname === PERFIL_HREF) return ["Cuenta", "Mi perfil"]
  const ruta = rutaDe(pathname)
  if (!ruta) return ["Workspace", "General"]
  return ruta.item.migas ?? [ruta.grupo?.label ?? ruta.item.label, ruta.item.label]
}

const permitido = (item: NavItem, puede: Puede) => !item.permiso || puede(item.permiso)

/** Menú que ve este usuario: sin las pantallas que no puede abrir y sin grupos vacíos. */
export function filtrarNavegacion(items: NavItem[], puede: Puede): NavItem[] {
  return items.flatMap((item) => {
    if (item.hijos) {
      const hijos = filtrarNavegacion(item.hijos, puede)
      return hijos.length > 0 ? [{ ...item, hijos }] : []
    }
    return permitido(item, puede) && !item.oculto ? [item] : []
  })
}

/** Pantalla a la que se vuelve cuando no hay otra mejor: la primera que el usuario puede abrir. */
export function rutaInicial(puede: Puede): string | null {
  return RUTAS.find(({ item }) => permitido(item, puede))?.item.href ?? null
}
