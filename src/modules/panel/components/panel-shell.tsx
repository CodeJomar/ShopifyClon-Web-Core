"use client"

import * as React from "react"
import { ShieldCheck, Store, TriangleAlert } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { AppSidebar } from "@/shared/components/layout/app-sidebar"
import { WorkspaceHeader } from "@/shared/components/layout/workspace-header"
import { useWorkspaceLayout } from "@/shared/context/workspace-layout-context"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/sheet"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  NAVEGACION,
  NAVEGACION_PLATAFORMA,
  NAVEGACION_PROPIETARIO,
  NAVEGACION_SIN_TIENDA,
  filtrarNavegacion,
  permisoDeRuta,
} from "@/shared/constants/navegacion"
import { PERMISO, ROL } from "@/shared/constants/permisos"
import { cerrarSesionAction } from "@/modules/auth"
import { misTiendasAction } from "@/modules/tienda/actions/tienda.actions"
import { cn } from "@/shared/utils/cn"
import { usePanel } from "../hooks/use-panel"
import { TiempoRealPanelProvider } from "../context/tiempo-real"

const ETIQUETA_ROL: Record<string, string> = {
  [ROL.PROPIETARIO]: "Propietario",
  [ROL.ADMINISTRADOR]: "Administrador",
  [ROL.GESTOR_CATALOGO]: "Gestor de catálogo",
  [ROL.GESTOR_PEDIDOS]: "Gestor de pedidos",
}

/** "Jomar Luis" → "Jomar L.": el primer nombre (o apellido) completo y la inicial del siguiente. */
function abreviar(texto: string): string {
  const [primero, segundo] = texto.trim().split(/\s+/)
  if (!primero) return ""
  return segundo ? `${primero} ${segundo[0].toUpperCase()}.` : primero
}

/**
 * Armazón compartido por el panel, la cuenta y la plataforma: barra lateral y encabezado con el menú del
 * usuario. Con `exigirTienda={false}` se muestra aunque no haya tienda activa (cuenta o plataforma).
 */
export function PanelShell({ children, exigirTienda = true }: { children: React.ReactNode; exigirTienda?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isCollapsed, toggleSidebar, isDrawerOpen, setIsDrawerOpen, isMobile } = useWorkspaceLayout()
  const { tienda, rol, nombres, apellidos, esAdministradorPlataforma, permisosPlataforma, rolPlataforma, puede, cargando, error } = usePanel()

  const esRutaPlataforma = pathname.startsWith("/plataforma")
  const esRutaPropietario = pathname.startsWith("/propietario")

  // Un administrador que además tiene tiendas propias ve «Mi negocio» en el menú de la plataforma.
  const [tieneNegocio, setTieneNegocio] = React.useState(false)
  React.useEffect(() => {
    if (!esRutaPlataforma) return
    let cancelado = false
    void misTiendasAction().then((res) => {
      if (!cancelado && res.ok) setTieneNegocio(res.datos.length > 0)
    })
    return () => {
      cancelado = true
    }
  }, [esRutaPlataforma])

  const items = React.useMemo(() => {
    if (esRutaPlataforma) {
      // Cada sección pide su permiso de plataforma (B9): un administrador con rol de soporte o de finanzas ve solo lo suyo.
      const base = NAVEGACION_PLATAFORMA.filter((i) => !i.permisoPlataforma || permisosPlataforma.includes(i.permisoPlataforma))
      if (!tieneNegocio) return base
      const negocio = { id: "plataforma-mi-negocio", label: "Mi negocio", icon: Store, href: "/cuenta/mi-negocio" }
      const i = base.findIndex((x) => x.id === "plataforma-mercado")
      return i === -1 ? [...base, negocio] : [...base.slice(0, i), negocio, ...base.slice(i)]
    }
    if (esRutaPropietario) return NAVEGACION_PROPIETARIO
    const base = tienda ? filtrarNavegacion(NAVEGACION, puede) : [...NAVEGACION_SIN_TIENDA]
    if (esAdministradorPlataforma) {
      base.push({
        id: "plataforma",
        label: "Plataforma",
        icon: ShieldCheck,
        href: "/plataforma/planes",
      })
    }
    return base
  }, [tienda, puede, esRutaPlataforma, esRutaPropietario, esAdministradorPlataforma, permisosPlataforma, tieneNegocio])

  const etiquetaRol = esRutaPlataforma
    ? (rolPlataforma ?? "Administrador de plataforma")
    : esRutaPropietario
    ? "Propietario"
    : rol
    ? (ETIQUETA_ROL[rol] ?? rol)
    : esAdministradorPlataforma
    ? "Administrador"
    : ""
  const iniciales = ((nombres.trim()[0] ?? "") + (apellidos.trim()[0] ?? "") || "U").toUpperCase()
  const nombreCorto = [abreviar(nombres), abreviar(apellidos)].filter(Boolean).join(" ")
  const permiso = permisoDeRuta(pathname)
  const seccionPlataforma = NAVEGACION_PLATAFORMA.find((i) => i.href && i.href !== "/plataforma" && pathname.startsWith(i.href))
  const permitida = esRutaPlataforma
    ? esAdministradorPlataforma && (!seccionPlataforma?.permisoPlataforma || permisosPlataforma.includes(seccionPlataforma.permisoPlataforma))
    : (!permiso || puede(permiso))
  // Tiempo real (W-022): solo en el panel de una tienda y para quien puede ver sus órdenes.
  const tiempoRealActivo = !esRutaPlataforma && pathname.startsWith("/panel") && Boolean(tienda) && puede(PERMISO.ORDENES_VER)

  const cerrarSesion = async () => {
    await cerrarSesionAction()
    router.replace("/login")
  }

  const menu = (
    <AppSidebar
      items={items}
      isCollapsed={isCollapsed && !isMobile}
      nombreMarca={esRutaPlataforma ? "Administración" : esRutaPropietario ? "Mis tiendas" : (tienda?.nombre ?? "OTemu")}
      tieneTienda={!esRutaPlataforma && Boolean(tienda)}
    />
  )

  return (
    <TiempoRealPanelProvider tiendaId={tienda?.id} activo={tiempoRealActivo}>
    <div className="otemu-app-shell flex h-screen overflow-hidden bg-background">
      {!isMobile && (
        <aside className={cn("otemu-rail sticky top-0 h-screen shrink-0 p-3 transition-[width] duration-200", isCollapsed ? "w-[88px]" : "w-[264px]")}>
          {menu}
        </aside>
      )}
      {isMobile && (
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetContent side="left" className="otemu-mobile-rail w-[280px] p-3">
            <SheetTitle className="sr-only">Menú del panel</SheetTitle>
            {menu}
          </SheetContent>
        </Sheet>
      )}

      <div className="otemu-workspace flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Encabezado fijo: solo se desplaza el contenido de abajo */}
        <div className="otemu-header-holder shrink-0 px-4 sm:px-6">
        <WorkspaceHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
          onLogout={cerrarSesion}
          userName={nombreCorto || "Usuario"}
          userRole={etiquetaRol}
          userInitials={iniciales}
          puedeConfigurar={!esRutaPlataforma && Boolean(tienda) && puede(PERMISO.TIENDA_CONFIGURAR)}
          tieneTienda={!esRutaPlataforma && Boolean(tienda)}
        />
        </div>

        <div className="otemu-main-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">

        {!esRutaPlataforma && tienda && !tienda.operativa && (
          <Alert variant="warning" className="mt-1 sm:mt-3">
            <TriangleAlert aria-hidden="true" />
            <AlertTitle>Tu suscripción no está activa</AlertTitle>
            <AlertDescription>
              Puedes ver tu tienda, pero no hacer cambios.
              {rol === ROL.PROPIETARIO && (
                <Button variant="soft" size="sm" className="ml-0 mt-2 sm:ml-3 sm:mt-0" onClick={() => router.push("/panel/suscripcion")}>
                  Pagar suscripción
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <main className={cn("flex flex-1 flex-col", !esRutaPlataforma && tienda && !tienda.operativa ? "mt-4 sm:mt-6" : "mt-1 sm:mt-3")}>
          {cargando && (
            <p className="text-[13px] text-muted-foreground" aria-live="polite">
              {exigirTienda ? "Cargando tu tienda…" : "Cargando…"}
            </p>
          )}
          {error && (
            <Card>
              <CardContent>
                <EstadoVacio titulo="No pudimos cargar tu información" descripcion={error.message} />
              </CardContent>
            </Card>
          )}
          {!cargando && !error && (tienda || !exigirTienda) && (permitida ? children : (
            <Card>
              <CardContent>
                <EstadoVacio
                  titulo="No tienes acceso a esta sección"
                  descripcion={
                    esRutaPlataforma
                      ? "Esta sección es exclusiva para administradores de la plataforma."
                      : "Tu rol no incluye este permiso. Pide a la propietaria o al propietario que te lo asigne."
                  }
                />
              </CardContent>
            </Card>
          ))}
        </main>
        </div>
      </div>
    </div>
    </TiempoRealPanelProvider>
  )
}
