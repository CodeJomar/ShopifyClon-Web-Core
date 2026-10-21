import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type {
  AjusteStockRequest,
  ConfiguracionStockRequest,
  MovimientoInventarioDto,
  StockVarianteDto,
} from "@/dtos/inventario"

// Inventario de la tienda activa (X-Tienda-Id lo pone el proxy). Las cantidades solo cambian por el backend.

export const stockVarianteAction = (varianteId: string) =>
  resultado(peticionApi<StockVarianteDto>({ method: "GET", url: `/panel/inventario/variantes/${varianteId}` }))

export const ajustarStockAction = (varianteId: string, datos: AjusteStockRequest) =>
  resultado(peticionApi<StockVarianteDto>({ method: "PUT", url: `/panel/inventario/variantes/${varianteId}`, data: datos }))

export const configurarStockAction = (varianteId: string, datos: ConfiguracionStockRequest) =>
  resultado(
    peticionApi<StockVarianteDto>({ method: "PUT", url: `/panel/inventario/variantes/${varianteId}/configuracion`, data: datos }),
  )

export const movimientosAction = (varianteId: string, pagina: number) =>
  resultado(
    peticionApi<Paginado<MovimientoInventarioDto>>({
      method: "GET",
      url: `/panel/inventario/variantes/${varianteId}/movimientos`,
      params: { pagina },
    }),
  )
