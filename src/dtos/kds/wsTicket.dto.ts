/** `POST /auth/ws-ticket`: ticket de un solo uso (30 s) para abrir el WebSocket sin enviar cookies a otro origen. */
export type WsTicketDto = {
  ticket: string
  expira_en_segundos: number
}
