export type ApiMensajeCodigo<
  CodigoModulo extends string = string,
  CodigoMenu extends string = string,
  CodigoMensaje extends string = string,
> = `${CodigoModulo}.${CodigoMenu}.${CodigoMensaje}`;

export type ParsedApiMensajeCodigo<AMC extends ApiMensajeCodigo> =
  AMC extends ApiMensajeCodigo<infer M, infer N, infer C>
  ? { modulo: M; menu: N; mensaje: C }
  : never;

/**
 * Divide un código de error estructurado manteniendo los tipos literales
 */
export function splitApiMensajeCodigo<AMC extends ApiMensajeCodigo>(
  code: AMC,
): ParsedApiMensajeCodigo<AMC> {
  const parts = code.split(".");
  return {
    modulo: parts[0],
    menu: parts[1],
    mensaje: parts[2],
  } as ParsedApiMensajeCodigo<AMC>;
}