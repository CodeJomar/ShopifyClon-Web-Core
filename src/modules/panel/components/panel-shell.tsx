"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AppSidebar } from "@/shared/components/layout/app-sidebar"
import { WorkspaceHeader } from "@/shared/components/layout/workspace-header"
import { useWorkspaceLayout } from "@/shared/context/workspace-layout-context"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/sheet"
import { Card, CardContent } from "@/shared/components/ui/card"
import { NAVEGACION, filtrarNavegacion, permisoDeRuta } from "@/shared/constants/navegacion"
import { ROL } from "@/shared/constants/permisos"
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
 * Armazón del panel: barra lateral y encabezado de la plantilla (sin reestructurar), con las secciones del rol,
 * el nombre de la tienda activa y el aviso de suscripción (SUS-017).
 */
export function PanelShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isCollapsed, toggleSidebar, isDrawerOpen, setIsDrawerOpen, isMobile } = useWorkspaceLayout()
  const { tienda, rol, nombres, puede, cargando, error } = usePanel()

  const items = React.useMemo(() => filtrarNavegacion(NAVEGACION, puede), [puede])
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
      userName={nombres || "Usuario"}
      userRole={etiquetaRol}
      userInitials={iniciales}
    />
  )

  return (
    <div className="flex min-h-screen bg-background">
      {!isMobile && (
        <aside className={cn("sticky top-0 h-screen shrink-0 p-3 transition-[width] duration-200", isCollapsed ? "w-[88px]" : "w-[264px]")}>
          {menu}
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

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
        <WorkspaceHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
          onLogout={cerrarSesion}
          etiquetaCuenta={etiquetaRol}
        />

        {tienda && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-muted-foreground">
              Tienda: <span className="font-bold text-foreground">{tienda.nombre}</span>
            </p>
            <Link href="/cuenta/tiendas" className="text-[12.5px] font-bold text-brand-text hover:underline">
              Cambiar de tienda
            </Link>
          </div>
        )}

        {tienda && !tienda.operativa && (
          <Alert className="mt-4">
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
              Cargando tu tienda…
            </p>
          )}
          {error && (
            <Card>
              <CardContent>
                <EstadoVacio titulo="No pudimos cargar tu tienda" descripcion={error.message} />
              </CardContent>
            </Card>
          )}
          {!cargando && !error && tienda && (permitida ? children : (
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
