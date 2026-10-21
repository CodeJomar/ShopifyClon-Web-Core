"use client"

import * as React from "react"
import { TriangleAlert } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { AppSidebar } from "@/shared/components/layout/app-sidebar"
import { WorkspaceHeader } from "@/shared/components/layout/workspace-header"
import { useWorkspaceLayout } from "@/shared/context/workspace-layout-context"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/sheet"
import { Card, CardContent } from "@/shared/components/ui/card"
import { NAVEGACION, NAVEGACION_SIN_TIENDA, filtrarNavegacion, permisoDeRuta } from "@/shared/constants/navegacion"
import { PERMISO, ROL } from "@/shared/constants/permisos"
import { cerrarSesionAction } from "@/modules/auth"
import { cn } from "@/shared/utils/cn"
import { usePanel } from "../hooks/use-panel"

const ETIQUETA_ROL: Record<string, string> = {
  [ROL.PROPIETARIO]: "Propietario",
  [ROL.ADMINISTRADOR]: "Administrador",
  [ROL.GESTOR_CATALOGO]: "Gestor de catálogo",
  [ROL.GESTOR_PEDIDOS]: "Gestor de pedidos",
}

/**
 * Armazón compartido por el panel y la cuenta: barra lateral (marca = tienda activa) y encabezado con el menú del
 * usuario, más el aviso de suscripción (SUS-017). Con `exigirTienda={false}` (la cuenta) se muestra aunque no haya
 * tienda activa, con la barra reducida a "Crear mi tienda".
 */
export function PanelShell({ children, exigirTienda = true }: { children: React.ReactNode; exigirTienda?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isCollapsed, toggleSidebar, isDrawerOpen, setIsDrawerOpen, isMobile } = useWorkspaceLayout()
  const { tienda, rol, nombres, puede, cargando, error } = usePanel()

  const items = React.useMemo(() => (tienda ? filtrarNavegacion(NAVEGACION, puede) : NAVEGACION_SIN_TIENDA), [tienda, puede])
  const etiquetaRol = rol ? (ETIQUETA_ROL[rol] ?? rol) : ""
  const iniciales = (nombres.trim()[0] ?? "U").toUpperCase()
  const permiso = permisoDeRuta(pathname)
  const permitida = !permiso || puede(permiso)

  const cerrarSesion = async () => {
    await cerrarSesionAction()
    router.replace("/login")
  }

  const menu = (
    <AppSidebar
      items={items}
      isCollapsed={isCollapsed && !isMobile}
      nombreMarca={tienda?.nombre ?? "OTemu"}
      tieneTienda={Boolean(tienda)}
    />
  )

  return (
    <div className="flex min-h-screen bg-background">
      {!isMobile && (
        <aside className={cn("sticky top-0 h-screen shrink-0 p-3 transition-[width] duration-200", isCollapsed ? "w-[88px]" : "w-[264px]")}>
          {menu}
          {/* Divisor vertical: arranca a la altura del divisor del encabezado (76 px), queda centrado entre el menú (12 px) y el main (24 px) y deja aire abajo */}
          <div aria-hidden="true" className="absolute -right-1.5 top-[76px] bottom-10 w-px bg-brand-strong/12" />
        </aside>
      )}
      {isMobile && (
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetContent side="left" className="w-[280px] p-3">
            <SheetTitle className="sr-only">Menú del panel</SheetTitle>
            {menu}
          </SheetContent>
        </Sheet>
      )}

      <div className="flex min-w-0 flex-1 flex-col px-4 pb-4 sm:px-6 sm:pb-6">
        <WorkspaceHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
          onLogout={cerrarSesion}
          userName={nombres || "Usuario"}
          userRole={etiquetaRol}
          userInitials={iniciales}
          puedeConfigurar={Boolean(tienda) && puede(PERMISO.TIENDA_CONFIGURAR)}
          tieneTienda={Boolean(tienda)}
        />

        {tienda && !tienda.operativa && (
          <Alert variant="warning" className="mt-4">
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

        <main className="mt-5 flex-1">
          {cargando && (
            <p className="text-[13px] text-muted-foreground" aria-live="polite">
              {exigirTienda ? "Cargando tu tienda…" : "Cargando…"}
            </p>
          )}
          {error && (
            <Card>
              <CardContent>
                <EstadoVacio titulo="No pudimos cargar tu tienda" descripcion={error.message} />
              </CardContent>
            </Card>
          )}
          {!cargando && !error && (tienda || !exigirTienda) && (permitida ? children : (
            <Card>
              <CardContent>
                <EstadoVacio titulo="No tienes acceso a esta sección" descripcion="Tu rol no incluye este permiso. Pide a la propietaria o al propietario que te lo asigne." />
              </CardContent>
            </Card>
          ))}
        </main>
      </div>
    </div>
  )
}
