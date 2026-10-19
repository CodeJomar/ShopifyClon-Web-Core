import type { LucideIcon } from "lucide-react"
import {
  Clock,
  Coins,
  FileText,
  Grid2X2,
  House,
  LayoutDashboard,
  ReceiptText,
  Refrigerator,
  ShieldCheck,
  Store,
  Users,
  UtensilsCrossed,
} from "lucide-react"

import { ACCION, MODULO, type Puede, type Requisito } from "./permisos"

/** Pantalla de inicio: la ven todos los usuarios con sesión. Se llega por el logo del menú y tras iniciar sesión. */
export const HOME_HREF = "/home"

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

export const NAVEGACION: NavItem[] = [
  { id: "home", label: "Inicio", icon: House, href: HOME_HREF, oculto: true, migas: ["Inicio", "Bienvenida"] },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    permiso: { modulo: MODULO.DASHBOARD, accion: ACCION.LEER },
    migas: ["Dashboard", "Resumen"],
  },
  {
    id: "pos",
    label: "POS",
    icon: ReceiptText,
    href: "/pos",
    permiso: { modulo: MODULO.ORDERS, accion: ACCION.CREAR },
    migas: ["Punto de Venta", "Terminal"],
  },
  {
    id: "kds",
    label: "KDS",
    icon: Refrigerator,
    href: "/kds",
    permiso: { modulo: MODULO.KDS, accion: ACCION.LEER },
    migas: ["KDS", "Comandas"],
  },
  {
    id: "menu",
    label: "Menú",
    icon: UtensilsCrossed,
    href: "/menu",
    permiso: { modulo: MODULO.MENU, accion: ACCION.LEER },
    migas: ["Menú", "Catálogo"],
  },
  {
    id: "local-equipo",
    label: "Local y Equipo",
    icon: Store,
    hijos: [
      {
        id: "personal",
        label: "Gestión de Empleados",
        icon: Users,
        href: "/local-equipo/personal",
        permiso: { modulo: MODULO.USERS, accion: ACCION.LEER },
      },
      {
        id: "roles-permisos",
        label: "Roles y Permisos",
        icon: ShieldCheck,
        href: "/local-equipo/roles-permisos",
        permiso: { modulo: MODULO.ROLES, accion: ACCION.LEER },
      },
      {
        id: "mesas",
        label: "Gestión de Mesas",
        icon: Grid2X2,
        href: "/local-equipo/mesas",
        permiso: { modulo: MODULO.TABLES, accion: ACCION.LEER },
      },
    ],
  },
  {
    id: "transacciones",
    label: "Transacciones",
    icon: FileText,
    hijos: [
      {
        id: "cajas",
        label: "Gestión de cajas",
        icon: Coins,
        href: "/transacciones/cajas",
        permiso: { modulo: MODULO.TRANSACTIONS, accion: ACCION.LEER },
      },
      {
        id: "pedidos",
        label: "Historial de Pedidos",
        icon: Clock,
        href: "/transacciones/pedidos",
        permiso: { modulo: MODULO.ORDERS, accion: ACCION.LEER },
      },
    ],
  },
]

/** Mi perfil: no está en el menú; se abre desde el usuario al pie de la barra lateral y no pide permiso. */
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

/** Pantalla a la que se vuelve cuando no hay otra mejor: la primera que el usuario puede abrir (Inicio, que todos pueden ver). */
export function rutaInicial(puede: Puede): string | null {
  return RUTAS.find(({ item }) => permitido(item, puede))?.item.href ?? null
}
