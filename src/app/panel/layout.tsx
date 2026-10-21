import { WorkspaceLayoutProvider } from "@/shared/context/workspace-layout-context"
import { PanelProvider } from "@/modules/panel/hooks/use-panel"
import { PanelShell } from "@/modules/panel/components/panel-shell"

// Layout del panel: la plantilla (barra lateral + encabezado) con las secciones del rol de la tienda activa.
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayoutProvider>
      <PanelProvider>
        <PanelShell>{children}</PanelShell>
      </PanelProvider>
    </WorkspaceLayoutProvider>
  )
}
