## Qué cambia
<!-- Resumen en 1–3 líneas. Enlaza la tarea si existe. -->

## Tipo
- [ ] feature  - [ ] fix  - [ ] refactor  - [ ] docs / ci  - [ ] release (develop → prod)  - [ ] hotfix

## Checklist
- [ ] Compila y pasa lint (`npm run build` / `npm run lint`)
- [ ] Probé el flujo afectado (adjunto evidencia: respuesta, captura o log, **sin secretos**)
- [ ] Si cambia el **contrato con la API** (endpoint, cabeceras como `Idempotency-Key`, eventos WS): coincide con el backend y con `docs/domain` del kit
- [ ] Errores y carga por toast; overlays con los componentes estándar (Toast / Confirm / Panel)
- [ ] Si hay **variables nuevas**: documentadas y cargadas en Railway
- [ ] Sin datos sensibles en respuestas (ni UUID de usuarios) ni secretos en el código

## Riesgos y reversa
<!-- ¿Qué podría salir mal en producción y cómo se revierte? -->
