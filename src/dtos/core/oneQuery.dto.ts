import { BaseResponse } from "./baseResponse.dto";
import type { OptionalData } from "./helpers";
import type { ApiMensajeCodigo } from "./mensajeCodigo";

export class OneQuery<
  T,
  AMC extends ApiMensajeCodigo = ApiMensajeCodigo,
> extends BaseResponse<AMC> {
  #data: OptionalData<T>;

  get data(): OptionalData<T> {
    return this.#data;
  }

  set data(value: OptionalData<T>) {
    this.#data = value;
  }

  constructor(response?: Record<string, unknown>) {
    super(response);
    if (!response) return;
    this.#data = response.data as T;
  }

  isOk(): this is this & { data: T } {
    return super.isOk() && this.#data !== undefined && this.#data !== null;
  }
}