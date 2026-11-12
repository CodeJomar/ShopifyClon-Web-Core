import type { LucideIcon } from "lucide-react"
import {
  Boxes,
  ChartNoAxesColumn,
  CreditCard,
  FolderTree,
  House,
  LayoutDashboard,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Layers,
  Package,
  Plus,
  ReceiptText,
  Route,
  Settings,
  Ticket,
  Store,
  Truck,
  User,
  Users,
} from "lucide-react"

import { PERMISO, type Permiso, type Puede } from "./permisos"

/** Inicio del panel: tras iniciar sesión en una tienda y al elegir "Abrir" en el selector. */
export const HOME_HREF = "/panel"

/** Perfil de la cuenta (no está en el menú lateral: se abre desde el menú del usuario). */
export const PERFIL_HREF = "/cuenta"

/** Sección de "Mi cuenta" para las migas de pan (la cuenta es una sola pantalla; el detalle de una compra y crear tienda son rutas anidadas). */
export function seccionCuentaDe(pathname: string): string {
  if (pathname.startsWith("/cuenta/ordenes")) return "Mis compras"
  if (pathname.startsWith("/cuenta/tiendas")) return "Mis tiendas"
  if (pathname.startsWith("/cuenta/direcciones")) return "Direcciones"
  return "Perfil"
}

/**
 * Mapa único de navegación del panel. De aquí salen el menú lateral, las migas de pan y la protección de cada ruta.
 * Para añadir una sección, se agrega UNA entrada aquí. Se muestra solo si el rol tiene el permiso (ver permisos.ts).
 */
export interface NavItem {
  id: string
  /** Texto del menú lateral. */
  label: string
  icon: LucideIcon
  /** Ruta de la sección. */
  href?: string
  /** Permiso para ver la sección. Sin permiso no aparece en el menú. */
  permiso?: Permiso
  /** Migas de pan [sección, pantalla]; por defecto [label, label]. */
  migas?: [string, string]
  hijos?: NavItem[]
  /** No se dibuja en el menú lateral, pero sí cuenta para migas y rutas. */
  oculto?: boolean
}

/** Entradas del panel en el orden del menú (docs/orquestacion-frontend/tareas/W-007). */
export const NAVEGACION: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: ChartNoAxesColumn,
    href: "/panel",
    permiso: PERMISO.METRICAS_VER,
    migas: ["Panel", "Dashboard"],
  },
  { id: "productos", label: "Productos", icon: Package, href: "/panel/productos", permiso: PERMISO.CATALOGO_GESTIONAR, migas: ["Catálogo", "Productos"] },
  { id: "categorias", label: "Categorías", icon: FolderTree, href: "/panel/categorias", permiso: PERMISO.CATALOGO_GESTIONAR, migas: ["Catálogo", "Categorías"] },
  { id: "inventario", label: "Inventario", icon: Boxes, href: "/panel/inventario", permiso: PERMISO.INVENTARIO_AJUSTAR, migas: ["Catálogo", "Inventario"] },
  { id: "ordenes", label: "Órdenes", icon: ReceiptText, href: "/panel/ordenes", permiso: PERMISO.ORDENES_VER, migas: ["Ventas", "Órdenes"] },
  { id: "cupones", label: "Cupones", icon: Ticket, href: "/panel/cupones", permiso: PERMISO.CUPONES_GESTIONAR, migas: ["Ventas", "Cupones"] },
  { id: "rutas", label: "Rutas", icon: Route, href: "/panel/rutas", permiso: PERMISO.ORDENES_GESTIONAR, migas: ["Ventas", "Rutas"] },
  { id: "envios", label: "Envíos", icon: Truck, href: "/panel/envios", permiso: PERMISO.ENVIOS_CONFIGURAR, migas: ["Ventas", "Envíos"] },
  { id: "personal", label: "Personal", icon: Users, href: "/panel/personal", permiso: PERMISO.PERSONAL_GESTIONAR, migas: ["Tienda", "Personal"] },
  { id: "configuracion", label: "Configuración", icon: Settings, href: "/panel/configuracion", permiso: PERMISO.TIENDA_CONFIGURAR, migas: ["Tienda", "Configuración"], oculto: true }, // vive en el menú del usuario (QW-011)
  { id: "suscripcion", label: "Suscripción", icon: CreditCard, href: "/panel/suscripcion", permiso: PERMISO.SUSCRIPCION_GESTIONAR, migas: ["Tienda", "Suscripción"] },
]

/** Menú lateral cuando la persona aún no tiene tienda activa: su cuenta, elegir una de sus tiendas o crear una. */
export const NAVEGACION_SIN_TIENDA: NavItem[] = [
  { id: "mi-cuenta", label: "Mi cuenta", icon: User, href: "/cuenta" },
  { id: "mis-tiendas", label: "Mis tiendas", icon: Store, href: "/cuenta/tiendas" },
  { id: "crear-tienda", label: "Crear mi tienda", icon: Plus, href: "/cuenta/tiendas/nueva" },
]

/** Menú lateral exclusivo para el panel de plataforma (W-017). */
export const NAVEGACION_PLATAFORMA: NavItem[] = [
  { id: "plataforma-resumen", label: "Resumen", icon: LayoutDashboard, href: "/plataforma", migas: ["Administración", "Resumen"] },
  { id: "plataforma-tiendas", label: "Tiendas", icon: Store, href: "/plataforma/tiendas", migas: ["Administración", "Tiendas"] },
  { id: "plataforma-usuarios", label: "Usuarios", icon: Users, href: "/plataforma/usuarios", migas: ["Administración", "Usuarios"] },
  { id: "plataforma-administradores", label: "Administradores", icon: UserCog, href: "/plataforma/administradores", migas: ["Administración", "Administradores"] },
  { id: "plataforma-auditoria", label: "Auditoría", icon: ScrollText, href: "/plataforma/auditoria", migas: ["Administración", "Auditoría"] },
  { id: "plataforma-seguridad", label: "Seguridad", icon: ShieldAlert, href: "/plataforma/seguridad", migas: ["Administración", "Seguridad"] },
  { id: "plataforma-planes", label: "Planes", icon: Layers, href: "/plataforma/planes", migas: ["Plataforma", "Planes"] },
  { id: "plataforma-suscripciones", label: "Suscripciones", icon: CreditCard, href: "/plataforma/suscripciones", migas: ["Plataforma", "Suscripciones"] },
  { id: "plataforma-comisiones", label: "Comisiones", icon: ChartNoAxesColumn, href: "/plataforma/comisiones", migas: ["Plataforma", "Comisiones"] },
  { id: "plataforma-mercado", label: "Ir al mercado", icon: House, href: "/mercado" },
]

/** Menú de la zona del propietario: su resumen y el acceso a cada tienda; el panel de una tienda se abre desde ahí. */
export const NAVEGACION_PROPIETARIO: NavItem[] = [
  { id: "propietario-resumen", label: "Panel general", icon: LayoutDashboard, href: "/propietario", migas: ["Propietario", "Panel general"] },
  { id: "propietario-tiendas", label: "Mis tiendas", icon: Store, href: "/cuenta/tiendas", migas: ["Propietario", "Mis tiendas"] },
  { id: "propietario-compras", label: "Mis pedidos", icon: ReceiptText, href: "/mis-pedidos" },
  { id: "propietario-cuenta", label: "Mi cuenta", icon: ShieldCheck, href: "/cuenta" },
  { id: "propietario-mercado", label: "Ir al mercado", icon: House, href: "/mercado" },
]

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

/** Pantalla que corresponde a una URL (exacta o anidada: /panel/ordenes/123 → /panel/ordenes). */
export function rutaDe(pathname: string): RutaEncontrada | undefined {
  // Se toma la coincidencia más larga para que /panel/ordenes no caiga en /panel
  return RUTAS.filter(({ item }) => pathname === item.href || pathname.startsWith(`${item.href}/`)).sort(
    (a, b) => (b.item.href?.length ?? 0) - (a.item.href?.length ?? 0),
  )[0]
}

/** Permiso que exige una URL; undefined si la ruta no está en el mapa o no pide permiso. */
export function permisoDeRuta(pathname: string): Permiso | undefined {
  return rutaDe(pathname)?.item.permiso
}

/** Migas de pan [sección, pantalla] de una URL. */
export function migasDe(pathname: string): [string, string] {
  if (pathname === PERFIL_HREF || pathname.startsWith(`${PERFIL_HREF}/`)) return ["Mi cuenta", seccionCuentaDe(pathname)]
  if (pathname.startsWith("/propietario")) return ["Propietario", "Panel general"]
  if (pathname.startsWith("/plataforma")) {
    const encontrada = NAVEGACION_PLATAFORMA.filter((i) => i.href && i.href !== "/plataforma" && pathname.startsWith(i.href))[0]
    return encontrada?.migas ?? ["Administración", "Resumen"]
  }
  const ruta = rutaDe(pathname)
  if (!ruta) return ["Panel", "Dashboard"]
  return ruta.item.migas ?? [ruta.grupo?.label ?? ruta.item.label, ruta.item.label]
}

const permitido = (item: NavItem, puede: Puede) => !item.permiso || puede(item.permiso)

/** Menú que ve este usuario: sin las secciones que no puede abrir y sin grupos vacíos. */
export function filtrarNavegacion(items: NavItem[], puede: Puede): NavItem[] {
  return items.flatMap((item) => {
    if (item.hijos) {
      const hijos = filtrarNavegacion(item.hijos, puede)
      return hijos.length > 0 ? [{ ...item, hijos }] : []
    }
    return permitido(item, puede) && !item.oculto ? [item] : []
  })
}

/** Primera sección que el usuario puede abrir; null si no tiene ninguna. */
export function rutaInicial(puede: Puede): string | null {
  return RUTAS.find(({ item }) => permitido(item, puede))?.item.href ?? null
}
