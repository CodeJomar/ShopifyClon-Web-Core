# T-012 — `CalculadoraTotales` (cálculo puro de montos)

| Campo | Valor |
|---|---|
| Modelo | **Haiku** (lógica pura; los resultados esperados están dados abajo) |
| Rama | `tarea/T-012-calculadora-totales` desde `develop` |
| Depende de | T-010, T-011 |
| Tamaño | S |

## Objetivo
Un único componente sin base de datos ni Spring que calcula subtotal, descuento, envío, impuestos y total, lo usarán carrito (T-013) y checkout (T-014). Es la **única** fuente de la fórmula de `docs/negocio/04-reglas-de-integridad.md`.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/04-reglas-de-integridad.md` → sección "Dinero y cantidades"
- `comun/util/Dinero.java`, `modulos/cupon/modelo/TipoDescuento.java`

## Ubicación y contrato
Módulo nuevo `modulos/totales/modelo/` (sin controlador, servicio ni repositorio; no depende de ningún otro módulo salvo `comun` y el enum `TipoDescuento`, que puedes **copiar** como `TipoDescuentoAplicado` para no depender de `cupon`).
```java
record LineaCalculo(BigDecimal precioUnitario, int cantidad, boolean requiereEnvio) {}
record DescuentoCalculo(TipoDescuentoAplicado tipo, BigDecimal valor) {}            // opcional
record EnvioCalculo(BigDecimal precio, BigDecimal montoMinimoGratis) {}            // opcional; minimo puede ser null
record ImpuestoCalculo(BigDecimal tasa, boolean incluidoEnPrecio) {}
record TotalesCalculados(List<BigDecimal> totalesLinea, BigDecimal subtotal, BigDecimal descuentoTotal,
                         BigDecimal costoEnvio, BigDecimal impuestosTotal, BigDecimal total,
                         boolean requiereEnvio, boolean envioPendiente) {}
final class CalculadoraTotales { static TotalesCalculados calcular(List<LineaCalculo>, DescuentoCalculo, EnvioCalculo, ImpuestoCalculo) }
```

## Reglas (en este orden; todo con `Dinero`, escala 2, `HALF_UP`)
1. Validaciones (`IllegalArgumentException`): 1–50 líneas; cantidad 1–99; precio ≥ 0; tasa 0–0.50; ningún argumento obligatorio nulo (descuento y envío pueden ser `null`).
2. `totalLinea = redondear(precio × cantidad)`; `subtotal = Σ totalLinea`.
3. Descuento: `PORCENTAJE` → `redondear(subtotal × valor / 100)`; `MONTO_FIJO` → `min(valor, subtotal)`; `ENVIO_GRATIS` o sin descuento → `0.00`.
4. `base = subtotal − descuento`.
5. Envío: `requiereEnvio` = alguna línea lo requiere. Si no lo requiere → `0.00`. Si lo requiere y `envio == null` → `0.00` con `envioPendiente = true` (el carrito todavía no eligió tarifa). Si el descuento es `ENVIO_GRATIS` → `0.00`. Si `montoMinimoGratis != null && base ≥ montoMinimoGratis` → `0.00`. Si no → `envio.precio`.
6. Impuestos sobre `base` (el envío no lleva impuesto, D-012): incluido → `base − base.divide(1 + tasa, 2, HALF_UP)`; no incluido → `redondear(base × tasa)`.
7. `total = base + envío` si está incluido; `base + envío + impuestos` si no.

## Casos obligatorios (prueba unitaria `CalculadoraTotalesTest`, valores exactos)
| # | Líneas | Descuento | Envío (precio / mínimo) | Impuesto | Subtotal | Desc. | Envío | Imp. | Total |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2×50.00, 1×19.90 (con envío) | 10 % | 15.00 / 150.00 | 0.18 incluido | 119.90 | 11.99 | 15.00 | 16.46 | 122.91 |
| 2 | igual que 1 | 10 % | 15.00 / 150.00 | 0.18 no incluido | 119.90 | 11.99 | 15.00 | 19.42 | 142.33 |
| 3 | 1×30.00 | monto fijo 50.00 | 10.00 / — | 0.18 incluido | 30.00 | 30.00 | 10.00 | 0.00 | 10.00 |
| 4 | 1×100.00 | envío gratis | 20.00 / — | 0.18 incluido | 100.00 | 0.00 | 0.00 | 15.25 | 100.00 |
| 5 | 3×60.00 | — | 20.00 / 150.00 | 0 | 180.00 | 0.00 | 0.00 | 0.00 | 180.00 |
| 6 | 1×9.99 sin envío | — | `null` | 0.18 no incluido | 9.99 | 0.00 | 0.00 | 1.80 | 11.79 |
| 7 | 3×33.33 | 15 % | 5.00 / — | 0 | 99.99 | 15.00 | 5.00 | 0.00 | 89.99 |
| 8 | 1×40.00 con envío | — | `null` | 0.18 incluido | 40.00 | 0.00 | 0.00 (`envioPendiente`) | 6.10 | 40.00 |

Además: cada validación del punto 1 lanza `IllegalArgumentException`; el caso 1 devuelve `totalesLinea = [100.00, 19.90]`; ningún resultado tiene escala distinta de 2.

## Criterios de aceptación
- [ ] Los 8 casos pasan con `assertEquals` sobre `BigDecimal` con escala 2 (`compareTo` no basta: verifica también la escala).
- [ ] `ArquitecturaTest` pasa; `modulos/totales` no depende de otro módulo.
- [ ] `mvn test` en verde; commits sin coautor.
