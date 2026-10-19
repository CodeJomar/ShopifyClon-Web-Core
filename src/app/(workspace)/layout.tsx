"use client"

import * as React from "react"
import { cn } from "@/shared/utils/cn"
import { AppSidebar } from "@/shared/components/layout/app-sidebar"
import { WorkspaceHeader } from "@/shared/components/layout/workspace-header"
import { usePathname } from "next/navigation"
import { useIsMobile } from "@/shared/hooks/use-mobile"
import { ErrorView } from "@/modules/errors"
import { filtrarNavegacion, NAVEGACION, permisoDeRuta, rutaInicial } from "@/shared/constants/navegacion"
import { SessionProvider, useSession, useCan, useLogout, etiquetaCuenta, etiquetaRol, iniciales } from "@/modules/auth"

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </SessionProvider>
  )
}

function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const usuario = useSession()
  const { puede } = useCan()
  const pathname = usePathname()
  // Menú y protección de ruta salen del mismo mapa y de los permisos reales de la sesión.
  const menu = React.useMemo(() => filtrarNavegacion(NAVEGACION, puede), [puede])
  const requisito = permisoDeRuta(pathname)
  const puedeVerRuta = !requisito || puede(requisito)
  const { logout } = useLogout()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  // Hasta 1024 px el menú es un cajón (oculto; el botón del encabezado lo abre y lo cierra); desde 1025 px es fijo y se contrae.
  const esCajon = useIsMobile()

  // Al cambiar entre cajón y menú fijo (al girar la tablet o redimensionar) el cajón vuelve a quedar cerrado
  const [modoPrevio, setModoPrevio] = React.useState(esCajon)
  if (modoPrevio !== esCajon) {
    setModoPrevio(esCajon)
    setIsMobileOpen(false)
  }

  const handleToggleSidebar = () => {
    if (esCajon) {
      setIsMobileOpen((prev) => !prev)
    } else {
      setIsCollapsed((prev) => !prev)
    }
  }

  return (
    <div className="h-screen w-full bg-[#EDE5E6]/40 dark:bg-stone-950 p-2 sm:p-3 lg:p-4 overflow-hidden relative transition-colors duration-200">

      {/* BACKDROP OSCURO: Solo visible en mobile/tablet cuando isMobileOpen es true */}
      {isMobileOpen && (
        <div
          role="presentation"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 min-[1025px]:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      <div className="flex h-full gap-3 lg:gap-4 overflow-hidden relative">

        {/* ASIDE / SIDEBAR */}
        <aside
          className={cn(
            "flex flex-col rounded-3xl bg-white dark:bg-stone-900 p-4 border border-slate-100 dark:border-stone-800 overflow-hidden shrink-0 transition-colors duration-200",
            // Comportamiento Tablet/Mobile: Oculto por defecto a la izquierda (-translate-x-[120%]),
            // con márgenes simétricos (top-2 bottom-2 left-2) para respetar la separación arriba y abajo
            "fixed top-2 bottom-2 left-2 z-50 w-72 shadow-2xl transition-transform duration-300 ease-in-out min-[1025px]:shadow-sm",
            isMobileOpen ? "translate-x-0" : "-translate-x-[120%]",
            // Comportamiento Desktop: integrado estáticamente en el flex
            "min-[1025px]:static min-[1025px]:top-auto min-[1025px]:bottom-auto min-[1025px]:left-auto min-[1025px]:z-auto min-[1025px]:h-full min-[1025px]:translate-x-0",
            "min-[1025px]:transition-[width,padding] min-[1025px]:duration-300 will-change-[width,transform]",
            isCollapsed ? "min-[1025px]:w-20 min-[1025px]:items-center min-[1025px]:px-2" : "min-[1025px]:w-64 xl:w-72 min-[1025px]:px-4"
          )}
        >
          <div className="flex-1 w-full overflow-hidden flex flex-col">
            <AppSidebar
              items={menu}
              isCollapsed={isCollapsed && !esCajon}
              userName={usuario.nombre}
              userRole={etiquetaRol(usuario)}
              userInitials={iniciales(usuario.nombre)}
            />
          </div>
        </aside>

        {/* MAIN CONTAINER */}
        <main className="flex-1 flex flex-col rounded-3xl bg-white dark:bg-stone-900 p-4 lg:p-6 shadow-sm border border-slate-100 dark:border-stone-800 h-full overflow-hidden min-w-0 transition-colors duration-200">
          <WorkspaceHeader
            isCollapsed={esCajon ? !isMobileOpen : isCollapsed}
            onToggleCollapse={handleToggleSidebar}
            onLogout={logout}
            etiquetaCuenta={etiquetaCuenta(usuario)}
          />

          <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
            {puedeVerRuta ? children : <ErrorView codigo={403} embebido rutaInicio={rutaInicial(puede) ?? "/home"} />}
          </div>
        </main>

      </div>
    </div>
  )
}