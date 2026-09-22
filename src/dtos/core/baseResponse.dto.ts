import type { AxiosError } from "axios";
import { AXIOS_ERRORS_MAPPER } from "@/shared/utils/axios";
import { API_RESPONSE_STATUS, type ApiResponseStatus } from "./const";
import type { UUID } from "./helpers";
import { type ApiMensajeCodigo, splitApiMensajeCodigo } from "./mensajeCodigo";

export type BaseResponseMensaje<
  AMC extends ApiMensajeCodigo,
  OnlyAMC extends boolean = boolean,
> = {
  codigo: OnlyAMC extends true
  ? AMC
  : AMC | "AXIOS_ERROR" | "UNKNOWN_ERROR" | `AXIOS_CODE_${string}`;
  descripcion: string;
};

export class BaseResponse<AMC extends ApiMensajeCodigo = ApiMensajeCodigo> {
  status: ApiResponseStatus = API_RESPONSE_STATUS.Error;
  mensajes: BaseResponseMensaje<AMC>[] = [];
  trace: UUID = "";

  unknownError: unknown;
  httpStatusCode?: number;

  constructor(response?: Record<string, unknown>) {
    if (!response) return;
    this.fillFromResponse(response);
  }

  private fillFromResponse(response: Record<string, unknown>): boolean {
    if (!response.status && !response.mensajes && !response.trace) {
      return false;
    }

    this.status = (response.status ??
      API_RESPONSE_STATUS.Error) as ApiResponseStatus;
    this.mensajes = (response.mensajes ?? []) as {
      codigo: AMC;
      descripcion: string;
    }[];
    this.trace = (response.trace ?? "") as string;

    return true;
  }

  setAxiosError(error: AxiosError) {
    if (error.response?.status) {
      this.httpStatusCode = error.response.status;
    }

    const response = error.response?.data as Record<string, unknown>;
    if (response) {
      const filled = this.fillFromResponse(response ?? {});
      if (filled) return this;
    }

    if (error.code) {
      const mappedDescription = AXIOS_ERRORS_MAPPER[error.code];
      if (mappedDescription) {
        this.mensajes.push({
          codigo: `AXIOS_CODE_${error.code}` || "AXIOS_ERROR",
          descripcion: mappedDescription,
        });
      }
      return this;
    }

    return this;
  }

  setUnknownError(error: unknown) {
    this.unknownError = error;
    this.status = API_RESPONSE_STATUS.Error;
    this.mensajes = [
      {
        codigo: "UNKNOWN_ERROR",
        descripcion: "Ha ocurrido un error desconocido",
      },
    ];
    return this;
  }

  isError(): boolean {
    return this.status === API_RESPONSE_STATUS.Error;
  }

  isOk(): boolean {
    return this.status === API_RESPONSE_STATUS.Ok;
  }

  isNoData(): boolean {
    if (this.httpStatusCode === 404) return true;
    if (!this.isError()) return false;
    return this.mensajes.some((msg) => {
      const parts = (msg.codigo ?? "").split(".");
      return parts[parts.length - 1] === "114";
    });
  }

  getMensajeCodigoApiValidos() {
    const onlyApiMensajeCodigo = (codigo: string): codigo is AMC => {
      const parts = codigo.split(".");
      if (parts.length !== 3) return false;
      return parts.every((part) => !Number.isNaN(Number(part)));
    };

    return this.mensajes
      .filter((msg): msg is BaseResponseMensaje<AMC, true> =>
        onlyApiMensajeCodigo(msg.codigo),
      )
      .map((msg) => ({
        codigo: splitApiMensajeCodigo(msg.codigo),
        descripcion: msg.descripcion,
      }));
  }

  getMessage(): string {
    if (this.mensajes.length === 0 && this.isError()) {
      return "Error desconocido";
    }
    return this.mensajes.map((msg) => msg.descripcion).join(" ");
  }
}