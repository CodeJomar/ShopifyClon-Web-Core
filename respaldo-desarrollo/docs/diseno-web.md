# Diseño de la web — OTemu (W-000)

Fuente: plantilla HTML del responsable (`cat_logo_ui_clon_de_shopify_outlined_cut_contenedores_flotantes.html`, 2026-10-19). Este documento manda sobre ella: donde difieren (contraste, íconos) es a propósito.

## 1. Identidad
- **Nombre**: OTemu. **Promesa**: crea tu tienda en minutos y véndela por redes.
- **Tono**: cercano, directo, en español neutro de LatAm, tuteo. Verbos de acción en botones ("Publicar producto", "Guardar", "Confirmar pago"). Nada de jerga técnica ni nombres de campos de la API.
- **Firma visual**: verde menta `#00E699` + blanco; **contenedores flotantes** (islas blancas sobre un lienzo gris azulado) e **inputs "outlined cut"** (la etiqueta corta el borde superior).
- Misma identidad en todas las tiendas (QW-003).

## 2. Tokens

Se definen **una sola vez** en `src/app/globals.css` sobre las variables de shadcn (así todo `ui/` las hereda) más unas propias. Ningún componente usa hex ni paletas de Tailwind (`slate-`, `stone-`, `red-`…) sueltos.

| Token (CSS) | Claro | Oscuro | Uso |
|---|---|---|---|
| `--background` (lienzo) | `#EEF2F7` | `#070B10` | fondo de la app |
| `--card`, `--popover` (isla) | `#FFFFFF` | `#0F1622` | tarjetas, paneles, menús, toasts |
| `--muted` (sutil) | `#F4F7FB` | `#172133` | fondos de campos de solo lectura/deshabilitados, filas alternas |
| `--foreground` | `#1F2A44` | `#F1F5F9` | texto principal |
| `--muted-foreground` | `#5B6B82` | `#94A3B8` | texto secundario (4.8:1 sobre lienzo, 5.4:1 sobre isla; antes `#64748B`, que no llegaba a AA sobre lienzo) |
| `--border`, `--input` | `#CFD8E3` | `#26354D` | bordes en reposo |
| `--border-hover` | `#94A3B8` | `#3B5173` | borde al pasar el mouse |
| `--primary` (marca) | `#00E699` | `#00E699` | rellenos de acción principal, página activa, barra de éxito |
| `--primary-foreground` | `#FFFFFF` (QW-010) | `#FFFFFF` | texto/ícono sobre `--primary` |
| `--brand-strong` | `#00A36C` | `#00E699` | borde de foco, borde de botón outline, íconos de marca |
| `--brand-text` | `#007A52` | `#00E699` | **texto** de marca sobre isla (links, outline, etiqueta en foco) |
| `--ring` | `#00A36C` | `#00E699` | anillo de foco (se usa con opacidad 18–22 %) |
| `--destructive` | `#E91E63` | `#E91E63` (igual que claro, decisión 2026-10-20) | bordes/barras de error, botón peligro |
| `--destructive-text` | `#E91E63` | `#E91E63` | texto de error (rojo único, decisión del responsable en W-002-C1; 4.3:1 sobre isla, excepción aceptada) |
| `--warning` / `--warning-text` | `#E8C100` / `#A16207` | `#E8C100` / `#FCD34D` | avisos |
| `--warning-foreground` | `#422006` | `#422006` | texto sobre relleno `--warning` |
| `--info` / `--info-text` | `#00A2EC` / `#0369A1` | `#00A2EC` / `#7DD3FC` | información |
| `--success` | `#1E9E6A` | `#34D399` | (solo íconos; el éxito usa la marca) |
| `--chart-1…5` | `#00E699`, `#00A2EC`, `#7E22CE`, `#E8C100`, `#E91E63` | igual | gráficos de métricas |

**Por qué `--brand-strong` y `--brand-text` difieren de la plantilla (`#00B377`)**: `#00B377` sobre blanco da 2.7:1; no llega ni al 3:1 de bordes ni al 4.5:1 de texto (kit 09, AA). `#00A36C` da 3.3:1 (bordes) y `#007A52` 5.4:1 (texto).

### QW-010 — Texto sobre el verde (decidido: blanco, 2026-10-19)
Blanco sobre `#00E699` da **1.6:1** (AA exige 4.5:1; ni siquiera llega a 3:1 para texto grande): botones primarios, página activa y "Publicar" serían difíciles de leer con sol o con baja visión. Opciones:
- **(a) Recomendada**: texto `#042419` (verde casi negro, 10:1) sobre `#00E699`. El color de marca no cambia. La propia plantilla ofrece esta opción.
- (b) Blanco sobre un verde más oscuro (`#007A52`, 5.4:1): cambia el color de marca a uno menos "neón".
- (c) Blanco sobre `#00E699` tal cual, aceptando incumplir AA.

**Decisión del responsable: (c) blanco sobre `#00E699`**, aceptando la excepción a AA solo en texto sobre relleno de marca. Para que se lea lo mejor posible: texto sobre `--primary` siempre en peso ≥ 700 y con la sombra de la plantilla (`text-shadow: 0 1px 2px rgb(0 0 0 / .14)`); nunca texto secundario ni de menos de 12.5 px sobre el verde. Es un único token (`--primary-foreground`): cambiar de opción es cambiar un valor.

### Geometría
| Token | Valor | Uso |
|---|---|---|
| `--radius` | `0.75rem` (12 px) | islas, campos, botones, toasts |
| radio de paginación | 10 px (`rounded-[calc(var(--radius)-2px)]`) | botones de página |
| insignias | `rounded-full` | |
| `--border-w` | `1.8px` | campos, botones con borde, insignia contorno |
| `--float-gap` | `14px` | separación entre islas y margen del lienzo |
| sombra de isla | `0 8px 24px -6px rgb(15 23 42 / .05), 0 2px 6px -1px rgb(15 23 42 / .03)`; oscuro `0 12px 30px -8px rgb(0 0 0 / .5)` | `--shadow-isla` |
| borde de isla | `1px solid rgb(148 163 184 / .22)`; oscuro `rgb(255 255 255 / .07)` | |

## 3. Tipografía
- **Montserrat** para todo (interfaz y títulos), con `next/font/google` (pesos 400, 500, 600, 700, 800). Variable `--font-sans`.
- **JetBrains Mono** (`next/font/google`, 400–600) solo para códigos: SKU, número de orden, subdominio. Variable `--font-mono`.
- `font-variant-numeric: tabular-nums` en `body` (montos alineados).

| Rol | Tamaño / peso |
|---|---|
| Título de página | 18 px / 800 |
| Título de isla (h2) | 16 px / 800, `tracking-tight` |
| Subtítulo (h3) | 15 px / 800 |
| Texto | 13–13.5 px / 500 |
| Secundario | 12.5 px / 500, `--muted-foreground` |
| Rótulo de grupo | 10.5 px / 700, mayúsculas, `tracking-wider` |
| Botón | 13.5 px / 700 |

## 4. Componentes (los que el responsable eligió)

### 4.1 Botón (`ui/button.tsx`)
Alto 40 px, padding horizontal 18 px, radio 12, texto 13.5/700, ícono `lucide` 14 px con `gap-2`. Hover sutil en los rellenos (`brightness(1.05)` y `-1px`).

**Los tintes de marca usan `--primary` (`#00E699`) con opacidad**, exactamente como la plantilla (`rgba(0,230,153,α)`); nunca `--brand-strong` con opacidad (sale apagado). Texto de marca: `--brand-text`.

| Variante | Reposo | Hover | Uso |
|---|---|---|---|
| `default` | relleno `--primary`, texto `--primary-foreground` | `brightness(1.05)`, `-1px` | acción principal (Guardar, Publicar) |
| `outline` | transparente, borde 1.8 `--brand-strong`, texto `--brand-text` | fondo `--primary` 10 % | secundaria |
| `soft` | fondo `--primary` 14 %, borde 1.8 `--primary` 32 %, texto `--brand-text` | fondo `--primary` 22 % | secundaria tonal (Filtrar, Duplicar) |
| `ghost` | transparente, borde 1.8 transparente, **texto `--foreground`** | fondo `--primary` 12 %, texto `--brand-text` | apoyo (Vista previa, íconos de barra) |
| `link` | texto `--brand-text`, sin fondo | subrayado de 2 px que crece de izquierda a derecha | enlaces en texto |
| `neutral` | borde 1.8 `--border`, texto `--foreground` | fondo `--muted` | Cancelar/Volver en diálogos |
| `warning` | relleno `--warning`, texto `--warning-foreground` (`#422006`, 9:1) | `brightness(1.05)`, `-1px` | acción que requiere atención sin ser destructiva (Reintentar cobro, Pausar tienda) |
| `danger` | relleno `--destructive`, texto blanco | `brightness(1.05)` | confirmar algo destructivo en el diálogo |
| `danger-outline` | borde 1.8 y texto de peligro | fondo `--destructive` 9 % | Desactivar, Cancelar orden |

Se retiró `shadow` (decisión del responsable, 2026-10-20): sus usos pasan a `default`.

Tamaños: `sm` 32 px, `default` 40 px, `lg` 44 px (acción principal en móvil), `icon` 40×40, `icon-sm` 32×32. Estados: `disabled` (fondo `--muted`, texto `--muted-foreground`, `cursor-not-allowed`), `cargando` (spinner + texto, deshabilitado).

### 4.2 Campo "outlined cut" (`composed/floating-input|select|textarea`)
- Alto 44 px, padding izquierdo **22 px** sin ícono (44 px con ícono), borde 1.8 `--input`, radio 12, texto 13/500, **fondo transparente** (se ve la isla).
- La etiqueta está **dentro** y centrada cuando está vacío (a la derecha del ícono si lo hay); al subir siempre queda a 12 px del borde izquierdo, haya o no ícono; al enfocar o tener valor **sube y corta el borde superior** (10.5/700).
- **Fondo de la etiqueta flotante sin "rectángulo"**: degradado vertical `linear-gradient(to bottom, var(--campo-exterior) 50%, var(--campo-fondo) 50%)`. `--campo-exterior` es el fondo del contenedor (por defecto `--card`; un `Sheet`, `Dialog` o `Popover` lo redefine con su fondo) y `--campo-fondo` es el fondo del propio campo (transparente → igual a `--campo-exterior`; `--muted` en deshabilitado y solo lectura). Así la etiqueta solo tapa la línea del borde y se funde arriba y abajo en claro y oscuro.
- **El fondo del campo no cambia por tener valor.** Solo cambian de fondo **deshabilitado** y **solo lectura** (`--muted`), y solo en `input`/`textarea` (nunca usar `read-only:` de Tailwind en un elemento que no sea `input` o `textarea`: en un `button` o `div` siempre coincide). Un select con valor queda transparente y con texto 500, como uno vacío.
- Estados (se comunican por **borde y etiqueta**): reposo · hover (`--border-hover`) · **foco** (borde `--primary` `#00E699`, anillo 3.5 px `--primary` 18 %, etiqueta `--primary`; en el select el borde verde aparece al abrir la lista) · con valor sin foco (etiqueta `--muted-foreground`) · **error** (borde `--destructive`, etiqueta y mensaje `--destructive-text`, mensaje 11.5/700 con ícono `TriangleAlert` debajo) · **éxito** (borde y etiqueta `--primary`) · **deshabilitado** (fondo `--muted`, texto atenuado) · **solo lectura** (fondo `--muted`, texto 700).
- **Regla de íconos dentro del campo**: a la **izquierda** el ícono de **referencia** (decorativo, `aria-hidden`, `--muted-foreground`, 16 px): `Mail`, `Lock`, `Search`… A la **derecha** el ícono de **acción** (botón de 28 px con `aria-label`, hover fondo `--primary` 12 %): limpiar (`X`) en buscar, copiar (`Copy`) en solo lectura, mostrar/ocultar (`Eye`/`EyeOff`) en contraseña. Solo lectura: `Lock` a la izquierda y `Copy` a la derecha. Los íconos se centran **respecto al campo** (no al bloque que incluye la ayuda o el error).
- Ayuda opcional debajo: 11 px, `--muted-foreground`.
- Mismo comportamiento para select (con `data-has-value`) y textarea (etiqueta arriba a 20 px).
- Se integra con `react-hook-form`: `aria-invalid` y `aria-describedby` hacia el mensaje.

### 4.3 Insignia de estado (`ui/badge.tsx`, variante `estado` con prop `tono`)
Píldora `px-3.5 py-1`, 12/700. Tonos (claro / oscuro con fondo al 70 % del tono 950):

| Tono | Claro fondo / texto | Para |
|---|---|---|
| `neutro` | `#EEF2F6` / `#475569` | pendiente, sin actividad |
| `contorno` | borde 1.8 `#64748B`, texto `#334155` | borrador, reembolsada |
| `info` | `#E0F2FE` / `#0369A1` | pagada, prueba gratis |
| `exito` | `#DCFCE7` / `#15803D` | entregada, aprobada |
| `marca` | marca 18 % / `--brand-text` | activo en tienda, suscripción activa |
| `aviso` | `#FEF9C3` / `#A16207` | pago pendiente, vencida |
| `peligro` | `#FEE2E2` / `#B91C1C` | rechazado, anulado, sin stock |
| `naranja` | `#FFEDD5` / `#C2410C` | cancelada |
| `morado` | `#F3E8FF` / `#7E22CE` | en ruta |
| `indigo` | `#E0E7FF` / `#4338CA` | preparada |

Estos colores son de **insignia** y se declaran como tokens `--tono-<nombre>-bg/-fg` en `globals.css` (no en el componente).

Correspondencia con los estados de la API (la usa cada módulo; los textos son los que ve la persona):

| Estado API | Texto | Tono |
|---|---|---|
| Pago `PENDIENTE` · `PAGADO` · `PARCIALMENTE_REEMBOLSADO` · `REEMBOLSADO` · `ANULADO` | Pago pendiente · Pagada · Reembolso parcial · Reembolsada · Anulada | aviso · info · naranja · contorno · peligro |
| Preparación `NO_PREPARADO` · `PREPARADO` · `ENTREGADO` | Por preparar · Preparada · Entregada | neutro · indigo · exito |
| Envío `CREADO` · `EN_TRANSITO` · `ENTREGADO` · `DEVUELTO` | Por despachar · En ruta · Entregada · Devuelta | neutro · morado · exito · peligro |
| Orden `ABIERTA` · `CERRADA` · `CANCELADA` | Abierta · Completada · Cancelada | info · exito · naranja |
| Suscripción `PRUEBA` · `ACTIVA` · `VENCIDA` · `CANCELADA` · `SUSPENDIDA` | Prueba gratis · Activa · Vencida · Cancelada · Suspendida | info · marca · aviso · neutro · peligro |
| Registro de pago / cobro `PENDIENTE` · `APROBADO` · `RECHAZADO` | Por revisar · Aprobado · Rechazado | aviso · exito · peligro |
| Producto borrador · publicado · sin stock | Borrador · Activo en tienda · Agotado | contorno · marca · peligro |

### 4.4 Toast y mensajes (`ui/toast.tsx`, `ui/alert.tsx`)
- Isla (`--card`, borde de isla, radio 12, sombra de isla) con **barra lateral izquierda de 6 px** y **ícono en círculo de 36 px** (fondo del tono al 16 %, ícono del tono). Título 13.5/800, descripción 12.5 `--muted-foreground`.
- Tipos: `exito` (barra `--primary`, ícono `Check`), `error` (`--destructive`, `TriangleAlert`), `aviso` (`--warning`, `TriangleAlert`), `info` (`--info`, `Info`), `cargando` (`--muted-foreground`, spinner).
- Toast: abajo a la derecha en escritorio, abajo a todo el ancho (16 px de margen) en móvil; se descarta deslizando. `ui/alert.tsx` usa el mismo aspecto para mensajes **dentro** de una pantalla.
- `toastResponse` sigue siendo la forma de mostrar `mensaje` de la API.

### 4.5 Estado vacío (`composed/estado-vacio.tsx`)
Centrado, `py-6`: círculo de 64 px con fondo marca 14 % e ícono `--brand-text` de 28 px; título 16/800; descripción 13 px `--muted-foreground`, `max-w-xs`; acción opcional con botón `soft`.

### 4.6 Paginación (`ui/pagination.tsx`, `BarraPaginacion`)
Barra con borde superior (`--border` al 60 %): a la izquierda "Mostrando 1 – 8 de 38 productos" (12.5/500, `--muted-foreground`); a la derecha "Anterior", números y "Siguiente" (radio 10, 12.5 px, borde `--border`, hover `--border-hover`). Página activa: relleno `--primary`, texto `--primary-foreground`, 800. Los números son botones de 32 px; en móvil (< 640 px) solo Anterior · "2 de 5" · Siguiente.

### 4.7 Isla (`ui/card.tsx` y `ui/panel.tsx`)
`Card` = isla: `--card`, borde de isla, sombra de isla, radio 12, padding 24 (28 en ≥ 640 px). Las pantallas se componen de islas separadas por `--float-gap`.

## 5. Layout
Se conserva la estructura de la plantilla (barra lateral + encabezado) con la recomposición del responsable (2026-10-22, **W-007-C1**, ajustada por él durante la revisión):
- **Marca** = nombre de la tienda activa con el subtítulo "OTemu • Tienda en línea" (sin tienda: "OTemu"); enlace al home del panel (`/panel`; sin tienda, a `/cuenta`).
- **Barra lateral**: secciones de la tienda según el rol; "Dashboard" es la primera; "Configuración" no está aquí; sin perfil al pie; un divisor vertical la separa del contenido.
- **Encabezado** fijo: a la izquierda plegar barra + migas; a la derecha el **menú del usuario** (avatar, nombre, rol y `ChevronDown`, del mismo ancho que el menú) con Ver perfil, Configuración, Cambiar de tienda y Cerrar sesión. Sin interruptor de tema ni rol sueltos.
- **Solo el contenido (main) hace scroll**; el documento no se desplaza.
- **Cuenta** (`/cuenta`) dentro del mismo layout, en **una sola pantalla**: isla de perfil (avatar, nombre, correo · Seguridad · Preferencias con el tema luna/sol) + isla "Información del perfil" + accesos a Mis tiendas, Direcciones y Mis compras. Las rutas `/cuenta/{direcciones,ordenes,tiendas}` existen y redirigen donde corresponde.
- Lienzo `--background`, islas para el contenido, ítem activo con fondo marca 14 % y texto `--brand-text`.
## 6. Reglas para todas las tareas W-XXX
1. Solo tokens de §2 y componentes de §4. Si falta uno, se agrega a `shared` (no se improvisa en el módulo).
2. Íconos: `lucide-react` (no Font Awesome).
3. Contraste AA: texto 4.5:1, bordes e íconos 3:1; `--muted-foreground` vale sobre lienzo e isla. Única excepción aceptada: texto blanco sobre `--primary` (QW-010).
4. Foco visible siempre (anillo marca); objetivos táctiles ≥ 40 px.
5. Claro y oscuro con `next-themes` (clase `.dark`); se verifica cada pantalla en ambos.
6. `/playground` muestra todos los componentes de §4 con sus estados: es la referencia visual que se revisa.

## 7. Mapa de pantallas (resumen)
| Superficie | Pantallas | Tarea |
|---|---|---|
| Cuenta | registro, activar (código 6 dígitos), login, recuperar clave; perfil, contraseña, direcciones, mis órdenes | W-004, W-005 |
| Alta | crear tienda (plan, subdominio, prueba gratis), selector de tienda | W-006 |
| Panel | inicio con métricas; productos (lista, crear/editar en islas 8/4 columnas como la vista "Crear producto" de la plantilla); inventario; cupones; envíos; órdenes (lista con insignias, detalle); configuración y personal; suscripción | W-007…W-013 |
| Vitrina `/tienda/[subdominio]` | portada, catálogo con filtros, detalle con variantes, carrito, checkout, estado de la orden por enlace | W-014…W-016 |
| Plataforma | planes, suscripciones, comisiones | W-017 |
