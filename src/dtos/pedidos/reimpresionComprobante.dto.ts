import type { ComprobanteDto } from "./comprobante.dto"

/** `POST /orders/:id/comprobante/reimprimir`: el comprobante marcado como copia (`reimpresiones` ya incluye esta). */
export type ReimpresionComprobanteDto = ComprobanteDto & {
  es_copia: true
}
