import { BaseResponse } from "./baseResponse.dto";
import type { ApiMensajeCodigo } from "./mensajeCodigo";

/**
 * Respuesta de una operación o de un listado corto (no paginado): estado, mensajes y, opcionalmente, `data`.
 * Sin tipo genérico es una confirmación sin datos (`CheckStatus`); con él, el listado o resultado tipado
 * (`CheckStatus<CargoDto[]>`).
 */
export class CheckStatus<
  T = unknown,
  AMC extends ApiMensajeCodigo = ApiMensajeCodigo,
> extends BaseResponse<AMC> {
  data?: T;

  constructor(response?: Record<string, unknown>) {
    super(response);
    if (response && "data" in response) this.data = response.data as T;
  }
}
