# W-010 — Cupones y tarifas de envío (base funcional)

| Campo | Valor |
|---|---|
| Ejecutor | Antigravity (sin navegador), en worktree `Desarrollo/wt/W-010`, puerto 3100 |
| Rama | `tarea/W-010-cupones-y-envios` desde `develop` |
| Depende de | W-007-C1 (mergeada) |
| Tamaño | M (dos CRUD parecidos) |

## Objetivo
El comerciante crea, edita, activa/desactiva y elimina **cupones** de descuento y **tarifas de envío**, que luego usarán el carrito y el checkout (W-015, W-016). Prioridad: **que funcione e integre con la API**. Sin pulido visual y **sin capturas**.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md`
- `docs/negocio/modulos/cupones.md` (CUP-001…009) y `docs/negocio/modulos/envios.md` (ENV-001, ENV-002)
- Código a imitar: `src/modules/catalogo/` (categorías: lista + `FormPanel` + confirmación; lista con filtros y paginación), `src/modules/panel/hooks/use-panel.tsx` (`puede`, moneda de la tienda), marcadores `src/app/panel/{cupones,envios}/page.tsx`

## Contrato de la API (verificado por Opus; JSON en `snake_case`; con `X-Tienda-Id`)
**Cupones** (permiso `CUPONES_GESTIONAR`)
| Acción | Endpoint | Cuerpo / respuesta |
|---|---|---|
| Listar | `GET /panel/cupones?pagina=0&texto=&activo=` | `Paginado<Cupon>` (página desde 0) |
| Ver | `GET /panel/cupones/{id}` | `Cupon` (confirmar campos en Swagger: incluye los usos realizados) |
| Crear / editar | `POST /panel/cupones` · `PUT /panel/cupones/{id}` | `{ codigo (≤ 50, ^[A-Z0-9_-]{3,50}$), tipo_descuento: "PORCENTAJE" \| "MONTO_FIJO" \| "ENVIO_GRATIS", valor_descuento, monto_minimo_compra?, limite_usos_total?, fecha_inicio (ISO con hora), fecha_fin?, esta_activo? }` |
| Eliminar | `DELETE /panel/cupones/{id}` | lógico (CUP-008) |

Reglas que la UI refleja (la API decide): código en mayúsculas (normalizar mientras se escribe); `PORCENTAJE` 0 < valor ≤ 100, `MONTO_FIJO` valor > 0, `ENVIO_GRATIS` valor = 0 (ocultar el campo valor y enviar 0); `fecha_fin` > `fecha_inicio`; un cupón con usos no cambia de tipo ni de valor (CUP-008: mostrar el `mensaje` de la API).

**Tarifas de envío** (permiso `ENVIOS_CONFIGURAR`)
| Acción | Endpoint | Cuerpo |
|---|---|---|
| Listar | `GET /panel/envios/tarifas` | lista (confirmar en Swagger si es paginada) |
| Crear / editar | `POST /panel/envios/tarifas` · `PUT /panel/envios/tarifas/{id}` | `{ nombre (≤ 100), descripcion? (≤ 255), precio (≥ 0), monto_minimo_gratis?, esta_activa?, orden? }` |
| Eliminar | `DELETE /panel/envios/tarifas/{id}` | — |

## Pantallas
| Ruta | Muestra / permite |
|---|---|
| `/panel/cupones` | Filtros (texto, Todos/Activos/Inactivos), lista con código, tipo y valor legible ("10 %", "S/ 20.00", "Envío gratis"), compra mínima, usos / límite, vigencia (`formatearFecha`) e insignia Activo/Inactivo; `BarraPaginacion`; crear y editar en `FormPanel`; eliminar con confirmación; vacío "Aún no tienes cupones" |
| `/panel/envios` | Lista de tarifas ordenada por `orden`: nombre, descripción, precio (`formatearDinero`), "Gratis desde {monto}" si aplica, insignia Activa/Inactiva; crear y editar en `FormPanel`; eliminar con confirmación; vacío "Aún no tienes tarifas de envío" con la nota "Sin tarifas activas, los productos que requieren envío no se podrán comprar" (ENV-001) |

- Fechas: en el formulario, un campo de fecha y hora local que se convierte a ISO UTC al enviar; mostrar en la zona horaria de la tienda.
- Sin el permiso: solo lectura.
- Errores: `validaciones` en los campos; el resto, `mensaje` de la API.
- Botones del pie de `FormPanel` directos, sin `div`. No crear ni modificar nada en `src/shared/components/**` ni `globals.css`. Límites de campos según los DTO de la API.

## Fuera de alcance
- Aplicar cupones y elegir tarifa (W-015, W-016). Pulido visual.

## Verificación sin navegador (Antigravity)
Iniciar sesión **a través de la web** y usar la cookie para llamar al proxy, igual que lo hará la interfaz:
```bash
curl -s -c sesion.txt -X POST http://localhost:3100/api/auth/login -H "Content-Type: application/json" -d "{\"correo_electronico\":\"<correo>\",\"contrasena\":\"<contraseña>\"}"
curl -s -b sesion.txt -X PUT http://localhost:3100/api/sesion -H "Content-Type: application/json" -d "{\"tienda_id\":\"826d8c0c-0b3d-4578-88cd-d57d608156e5\"}"
curl -s -b sesion.txt http://localhost:3100/api/panel/cupones
```
(`826d8c0c-…` es "Tienda W006 Prueba"). Con esa cookie, ejecutar cada criterio enviando **exactamente el cuerpo que arma el formulario** (sacado de las acciones y esquemas de la tarea). Las páginas `/panel/cupones` y `/panel/envios` deben responder 200 con la cookie. **Borrar `sesion.txt` al terminar y no copiar la contraseña ni la cookie al reporte.** La prueba de los formularios en pantalla la hace Opus al revisar.

## Criterios de aceptación (con la API real, en "Tienda W006 Prueba")
- [ ] Crear un cupón de cada tipo (PORCENTAJE 10, MONTO_FIJO 20, ENVIO_GRATIS), editar uno, desactivarlo, eliminar otro.
- [ ] Código con minúsculas se normaliza; código repetido → error de la API en el campo; porcentaje 150 → error; `fecha_fin` anterior a `fecha_inicio` → error.
- [ ] Filtros de cupones (texto y activo) sin errores.
- [ ] Crear dos tarifas (una con "gratis desde"), editar una, desactivarla, eliminar otra.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Reporte con cada flujo probado y su resultado (**sin capturas**). Datos de prueba anotados.
- [ ] **No detener la API** al terminar (puede haber otro agente en paralelo).
