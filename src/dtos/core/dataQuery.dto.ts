import { BaseResponse } from "./baseResponse.dto";
import type { ApiMensajeCodigo } from "./mensajeCodigo";

export class DataQuery<
  T,
  AMC extends ApiMensajeCodigo = ApiMensajeCodigo,
> extends BaseResponse<AMC> {
  #data: { items: T[]; total: number } = { items: [], total: 0 };

  get data(): T[] {
    return this.#data.items;
  }

  set data(value: T[]) {
    this.#data.items = value;
  }

  get total(): number {
    return this.#data.total;
  }

  constructor(response?: Record<string, unknown>) {
    super(response);
    if (!response) return;
    this.#data = (response.data as { items: T[]; total: number }) ?? {
      items: [],
      total: 0,
    };
  }

  isOk(): this is this & { data: T[]; total: number } {
    return super.isOk() && Array.isArray(this.#data.items);
  }
}