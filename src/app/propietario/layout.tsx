import { WorkspaceLayoutProvider } from "@/shared/context/workspace-layout-context"
import { PanelProvider } from "@/modules/panel/hooks/use-panel"
import { PanelShell } from "@/modules/panel/components/panel-shell"

// El panel general del propietario usa el mismo armazón (barra lateral + encabezado) que el panel de una tienda,
// pero NO exige una tienda activa: es el resumen de todas.
export default function PropietarioLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayoutProvider>
      <PanelProvider exigirTienda={false}>
        <PanelShell exigirTienda={false}>{children}</PanelShell>
      </PanelProvider>
    </WorkspaceLayoutProvider>
  )
}
