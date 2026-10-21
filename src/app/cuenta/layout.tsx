import { WorkspaceLayoutProvider } from "@/shared/context/workspace-layout-context"
import { PanelProvider } from "@/modules/panel/hooks/use-panel"
import { PanelShell } from "@/modules/panel/components/panel-shell"
import { CuentaEncabezado } from "@/modules/cuenta"

// La cuenta vive en el mismo layout que el panel (barra lateral + encabezado) pero NO exige tienda activa.
export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayoutProvider>
      <PanelProvider exigirTienda={false}>
        <PanelShell exigirTienda={false}>
          <CuentaEncabezado />
          {children}
        </PanelShell>
      </PanelProvider>
    </WorkspaceLayoutProvider>
  )
}
