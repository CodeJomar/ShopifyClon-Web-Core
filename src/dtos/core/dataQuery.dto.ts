import { BaseResponse } from "./baseResponse.dto";
import type { ApiMensajeCodigo } from "./mensajeCodigo";
import { META_VACIA, type MetaPaginacion } from "./metaPaginacion";

/**
 * Respuesta de una lista. La API responde `{ data: T[], meta? }`: `meta` solo viene en las listas paginadas
 * (usuarios, productos, pedidos); en las demás, `total` es el tamaño de la lista recibida.
 */
export class DataQuery<
  T,
  AMC extends ApiMensajeCodigo = ApiMensajeCodigo,
> extends BaseResponse<AMC> {
  #data: T[] = [];
  #meta: MetaPaginacion = META_VACIA;

  get data(): T[] {
    return this.#data;
  }

  set data(value: T[]) {
    this.#data = value;
  }

  /** Datos de paginación (valores por defecto si la lista no es paginada). */
  get meta(): MetaPaginacion {
    return this.#meta;
  }

  /** Total de registros: el de la paginación si existe; si no, los recibidos. */
  get total(): number {
    return this.#meta === META_VACIA ? this.#data.length : this.#meta.total_registros;
  }

  constructor(response?: Record<string, unknown>) {
    super(response);
    if (!response) return;
    this.#data = Array.isArray(response.data) ? (response.data as T[]) : [];
    if (response.meta && typeof response.meta === "object") {
      this.#meta = { ...META_VACIA, ...(response.meta as Partial<MetaPaginacion>) };
    }
  }

  isOk(): this is this & { data: T[]; total: number } {
    return super.isOk();
  }
}
