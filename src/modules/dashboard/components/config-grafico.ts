import type { ChartConfig } from "@/shared/components/ui/chart"

// Configuración del gráfico de ventas: color corporativo en claro y uno legible en oscuro
export const ventasChartConfig = {
  ventas: {
    label: "Ventas",
    theme: { light: "#4C0107", dark: "#E7B7BC" },
  },
  pedidos: {
    label: "Pedidos",
    theme: { light: "#B08A8E", dark: "#78716C" },
  },
} satisfies ChartConfig
