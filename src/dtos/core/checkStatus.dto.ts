import { BaseResponse } from "./baseResponse.dto";
import type { ApiMensajeCodigo } from "./mensajeCodigo";

export class CheckStatus<
  AMC extends ApiMensajeCodigo = ApiMensajeCodigo,
> extends BaseResponse<AMC> { }