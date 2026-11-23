# Rediseño — plan del frontend (4 semanas)

Borrador del frontend para validar con el usuario. Depende de `01-necesidades-backend.md`. Cada bloque termina con revisión visual
(`playwright-cli`, escritorio y móvil), pruebas e2e con cuentas nuevas y reporte en `docs/orquestacion-frontend/reportes/`.

## Principios
- **Un sistema de diseño**: se parte del actual (`docs/diseno-web.md`, tokens en `globals.css`; verde `#00E699`, rojo `#E91E63`, Montserrat) y se
  extiende para landing, mercado y panel de administración. Se genera una sola vez con `ui-ux-pro-max` y se reutiliza.
- **Estructura de rutas por perfil**, con un único login y un selector de espacio de trabajo («Comprar», «Mis tiendas», «Administración»).
- **Se reutiliza lo que funciona**: el panel de tienda actual pasa a ser el «panel de una tienda»; se rediseña, no se reescribe la lógica.
- Cada rama sale de `develop`, con commits sin coautor y sin push salvo que el usuario lo pida.

## Estructura de rutas propuesta
| Zona | Rutas | Quién |
|---|---|---|
| Pública | `/` landing · `/mercado` · `/mercado/tiendas/[subdominio]` · `/mercado/productos/[slug]` · `/planes` · `/login` · `/registro` | todos |
| Comprador | `/carrito` · `/checkout` · `/mis-pedidos` · `/mis-pedidos/[id]` · `/cuenta` (perfil, seguridad, direcciones) · `/vender` (planes y crear tienda) | con sesión |
| Propietario | `/propietario` (panel general) · `/tienda/[id]/…` (panel de una tienda: catálogo, inventario, pedidos, envíos y rutas, cupones, personal, configuración, suscripción) | tiene tienda |
| Administración | `/admin` (resumen) · `/admin/tiendas` · `/admin/usuarios` · `/admin/auditoria` · `/admin/seguridad` · `/admin/planes` · `/admin/administradores` | administrador |
| Transportista (si B) | `/transportista/rutas` | transportista |

## Semanas
| Semana | Frontend | Necesita del backend |
|---|---|---|
| **1** | Sistema de diseño ampliado · layouts y navegación por perfil · **landing** · **mercado** (listado, búsqueda, tienda, producto) · login/registro rediseñados con selector de espacio · página «Vender» con planes y alta de tienda | B1, B2, B3 |
| **2** | **Carrito global** · **checkout multi-tienda** con pago único (manual y tarjeta) · «Mis pedidos» con detalle por tienda y tiempo real | B4, B5, B6 |
| **3** | **Panel general del propietario** · panel de tienda reubicado y rediseñado · **panel de administración** (tiendas, usuarios, auditoría, seguridad, administradores) · empleados y roles | B7, B8, B9 |
| **4** | Despacho y (si aplica) vista del transportista · pulido, accesibilidad y responsive · pruebas e2e de los tres perfiles · despliegue | B10, B11 |

## Riesgos
- **Checkout multi-tienda con un solo pago** (B4–B6) es lo más complejo y está en el camino crítico; si se retrasa, la semana 2 se corre completa.
- **Roles y permisos** (B9) afectan a todo el panel: la web debe leer permisos efectivos y no suponerlos.
- **Volumen de pantallas**: se prioriza lo que el profesor y el usuario ven en una demo (landing, mercado, compra, panel del propietario, administración) y se deja el pulido fino para el final.

## Decisiones del usuario que faltan (frontend)
1. Referencia visual: ¿alguna web o captura que le guste para la landing y el mercado, o decide el frontend con criterio?
2. ¿Los colores y la tipografía actuales se mantienen?
3. Despacho: opción A o B (ver `00`, pregunta 2).
