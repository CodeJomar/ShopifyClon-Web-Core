# W-019 — Rutas de reparto, guía de remisión, seguimiento y punto de entrega

| Campo | Valor |
|---|---|
| Ejecutor | Opus (sesión del frontend) |
| Rama | `tarea/W-019-rutas-y-seguimiento` desde `integracion/ui-companera` (decisión del usuario: la UI integrada de la compañera es la base) |
| Depende de | **A-004** (backend, `docs/orquestacion/ajustes/A-004-rutas-y-seguimiento.md`, sesión "ShopifyClon Backend - Sonnet") |
| Tamaño | L (se entrega por bloques) |

Contrato de la API: **A-004**. Si algo cambia, se corrige allí primero y se avisa a la otra sesión por mensaje.

## Objetivo
El profesor pidió guía de remisión, hoja de ruta y seguimiento de pedidos. Todo vive **dentro del dashboard** (no hay web de chofer): el dueño arma la ruta, imprime la guía y cambia el estado de cada parada; el comprador marca su punto de entrega en un mapa y puede seguir su pedido.

## Decisiones
- **Mapa obligatorio al comprar con envío** (decisión delegada por el usuario). Sin punto marcado no se confirma la compra (el backend lo exige con `ENV-007`). Las direcciones guardadas antiguas sin punto piden marcarlo al elegirlas. En el panel, las órdenes antiguas sin coordenadas muestran la dirección sin mapa.
- **Mapa**: Leaflet + OpenStreetMap, sin clave de API ni costo. Solo marcador (selector y visor), **sin rutas ni optimización**.
- **Guía de remisión**: página con estilos de impresión (`@media print`) que se guarda como PDF desde el navegador; sin librería de PDF. Es un documento simplificado, **no** una guía electrónica válida ante la SUNAT; se indica en el pie del documento.

## Pantallas y flujos
| Ruta | Quién | Qué muestra / permite | Endpoints (A-004) |
|---|---|---|---|
| `/checkout` y libreta de direcciones de `/cuenta` | Comprador | Selector de punto en mapa (arrastrar marcador, "usar mi ubicación"); obligatorio si hay envío | `POST checkout`, direcciones |
| `/panel/rutas` | Dueño/personal con `ORDENES_GESTIONAR` | Tabla de rutas (código, fecha, chofer, placa, paradas, estado) con columna **Acciones**: Ver detalle, Imprimir guía, Iniciar/Finalizar. Botón "Nueva ruta" | `GET /rutas`, `iniciar`, `finalizar` |
| Nueva ruta / editar (en `BORRADOR`) | ídem | Fecha, chofer, placa y selección y orden de los envíos disponibles | `POST/PUT /rutas`, `GET /envios/disponibles-para-ruta` |
| Detalle de ruta | ídem | Paradas con destinatario, dirección, mapa del punto de entrega, productos y **cambio de estado** del envío (Entregado con foto opcional, No entregado con motivo) | `GET /rutas/{id}`, `POST /envios/{id}/eventos` |
| Impresión de la guía | ídem | Guía de remisión de la ruta lista para imprimir | `GET /rutas/{id}` |
| Detalle de orden (panel y cuenta) | ídem | Línea de tiempo del envío (`ProgresoOrden` ampliado) y mapa del punto de entrega | `GET /envios/{id}/eventos` |
| `/seguimiento` (pública, último) | Cualquiera | Número de guía → línea de tiempo del envío | `GET /seguimiento/{guia}` |

## Estados obligatorios por pantalla
Cargando · vacío · error (mensaje de la API) · sin permiso (403) · éxito.

## Errores de la API que se manejan
| Código | Comportamiento en la UI |
|---|---|
| `ENV-007` | Resalta el mapa del checkout y pide marcar el punto de entrega |
| `RUT-002` | "Ese envío ya está en otra ruta" en la selección de paradas |
| Transición inválida de envío | Mensaje de la API en el detalle de la parada |

## Orden de entrega (alineado con A-004)
1. Componentes de mapa (selector y visor) y punto de entrega en checkout y direcciones — sigue a ENV-007.
2. Línea de tiempo del envío y cambio de estado con foto — sigue a los eventos.
3. Pantalla de rutas, detalle y guía imprimible — sigue a las rutas.
4. Seguimiento público — sigue al último bloque del backend.

## Componentes nuevos (se documentan en el reporte)
Selector y visor de ubicación, línea de tiempo del envío, guía de remisión imprimible, tabla y formulario de rutas.

## Fuera de alcance
GPS en vivo, rutas trazadas en el mapa, optimización, firma de entrega, vista aparte para chofer.

## Criterios de aceptación
- [ ] Comprar con envío sin marcar el punto no es posible; marcándolo, la orden se crea y el panel muestra el mapa con el marcador en ese punto.
- [ ] Crear ruta con varios envíos, iniciarla, marcar una parada como entregada (con y sin foto) y otra como no entregada con motivo; la línea de tiempo lo refleja.
- [ ] La guía imprime en una hoja A4 limpia (sin menú, barra lateral ni botones) en claro y oscuro.
- [ ] Los colores y la tipografía siguen las de OTemu (`#00E699`, `#E91E63`, Montserrat).
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores (el aviso de seguridad de Next 16.4.0 ya conocido no cuenta como falla de la tarea); revisión a 375 / 768 / 1280 px.
- [ ] Reporte en `docs/orquestacion-frontend/reportes/` con cada flujo probado contra la API real.
