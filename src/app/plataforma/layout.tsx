import { WorkspaceLayoutProvider } from "@/shared/context/workspace-layout-context"
import { PanelProvider } from "@/modules/panel/hooks/use-panel"
import { PanelShell } from "@/modules/panel/components/panel-shell"

// El panel de plataforma vive en el mismo layout que el panel y la cuenta pero NO exige tienda activa.
export default function PlataformaLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayoutProvider>
      <PanelProvider exigirTienda={false}>
        <PanelShell exigirTienda={false}>
          {children}
        </PanelShell>
      </PanelProvider>
    </WorkspaceLayoutProvider>
  )
}
