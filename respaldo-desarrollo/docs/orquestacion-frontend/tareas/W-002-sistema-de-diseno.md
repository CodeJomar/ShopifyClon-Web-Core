# W-002 — Sistema de diseño OTemu en `shared`

| Campo | Valor |
|---|---|
| Modelo | Sonnet |
| Rama | `tarea/W-002-sistema-de-diseno` desde `develop` (con W-001 mergeada) |
| Depende de | W-000 (`docs/diseno-web.md`), W-001 |
| Tamaño | L |

## Objetivo
Toda la app usa los tokens y componentes de OTemu: verde menta, DM Sans, islas flotantes, campos "outlined cut", botones, insignias, toasts, estado vacío y paginación de `docs/diseno-web.md`, en claro y oscuro, sin colores sueltos. El layout **no cambia de estructura**: solo se repinta.

## Contexto (leer solo esto)
- `docs/diseno-web.md` completo (es la especificación; los valores salen de ahí, no de esta tarea)
- `docs/arquitectura-frontend.md`, "Reglas siempre vigentes" 7–9
- `src/app/globals.css`, `src/app/layout.tsx`, `src/shared/` y `src/app/playground/`

## Alcance
1. **Tokens** (`globals.css`): reemplazar los valores de `:root` y `.dark` por los de §2 (incluidos `--brand-strong`, `--brand-text`, `--brand-rgb`, `--destructive-text`, `--warning(-text)`, `--info(-text)`, `--border-hover`, `--tono-*-bg/-fg`, `--shadow-isla`, `--float-gap`, `--border-w`, `--radius: 0.75rem`) y exponerlos en `@theme inline` como utilidades (`bg-brand-strong`, `text-brand-text`, `shadow-isla`…). `--primary-foreground: #FFFFFF` (QW-010) y la sombra de texto de §2 en los componentes con relleno de marca. Quitar el `@custom-variant pantalla-pequena` si ya no tiene usos. `body` con `tabular-nums`.
2. **Fuentes** (`app/layout.tsx`): DM Sans (`--font-sans`) y JetBrains Mono (`--font-mono`) con `next/font/google`; retirar Inter y Hanken Grotesk.
3. **Componentes de §4**, en este orden:
   - `ui/button.tsx`: variantes y tamaños de §4.1. Migrar en todo `src/` los usos de las variantes retiradas (`success*`, `warning*`, `info*`, `danger-strong`, `danger-ghost`, `neutral-outline`) a la más cercana. Si `@radix-ui/react-slot` no está en `package.json`, reemplazar `Slot` por el patrón `render` de `@base-ui/react` que ya usan otros componentes (sin dependencias nuevas).
   - `composed/floating-input|select|textarea.tsx` (y `ui/input.tsx` si lo necesitan): "outlined cut" de §4.2 con todos sus estados, incluido solo lectura con copiar.
   - `ui/badge.tsx`: variante `estado` con prop `tono` de §4.3 (tokens, no hex en el componente).
   - `ui/toast.tsx` y `ui/alert.tsx`: aspecto de §4.4; `utils/toast-response.ts` sigue funcionando igual.
   - `composed/estado-vacio.tsx` (§4.5), `ui/pagination.tsx` / `BarraPaginacion` (§4.6), `ui/card.tsx` y `ui/panel.tsx` como isla (§4.7).
4. **Repintar con tokens** (sin cambiar estructura ni comportamiento): resto de `shared/components/ui` y `composed`, `providers/confirm-provider.tsx`, `ui/{dialog,alert-dialog,sheet,select}.tsx`, `layout/app-sidebar.tsx`, `layout/workspace-header.tsx`, `composed/sidebar-nav-*.tsx` (§5), vistas de `modules/auth` y `modules/errors` (las ilustraciones usan `currentColor` o tokens).
5. **Unificar** `cn`: un solo import (`@/shared/utils/cn`); `src/lib/utils.ts` se borra si queda sin usos.
6. **Restos de la cafetería** (pendientes de W-001): borrar `public/images/login.webp` (foto de barista) y que `app/(auth)/layout.tsx` use en su lugar un panel de marca con tokens (fondo `--primary` al 14 %, nombre OTemu y la promesa de §1), sin imágenes nuevas; si `public/images` queda vacía, quitar `images` del `matcher` de `src/proxy.ts`. Reemplazar las 4 ilustraciones de taza de `modules/errors/components/ilustraciones/` por ilustraciones neutras de tienda (SVG simple con `currentColor`/tokens, o un ícono `lucide` grande en el círculo del estado vacío). El ícono `Store` provisional queda como logo hasta que haya uno.
7. **`/playground`**: una sección por componente de §4 con todos sus estados (como la plantilla HTML), más un selector claro/oscuro. Es lo que se revisa. Sin desborde horizontal a 375 px (W-001 detectó un círculo decorativo absoluto de 500 px que desborda: contenerlo con `overflow-hidden` o quitarlo).

## Fuera de alcance
- Recomponer el layout (islas flotantes, navegación móvil): tarea futura.
- Pantallas de negocio, proxy de API y sesión (W-003+).

## Criterios de aceptación
- [ ] `grep -rnE "#[0-9A-Fa-f]{3,8}\b|\b(slate|stone|zinc|gray|neutral|red|green|amber|cyan|rose|pink|sky|emerald|purple|indigo|orange|teal|yellow)-[0-9]{2,3}\b" src --include=*.tsx --include=*.ts` sin resultados fuera de `globals.css` (justificar en el reporte cualquier excepción).
- [ ] `/playground` muestra botones (9 variantes, 5 tamaños, deshabilitado, cargando), campos (reposo, foco, con valor, error con mensaje, deshabilitado, solo lectura con copiar; input, select y textarea), los 10 tonos de insignia, los 5 tipos de toast (lanzables con botones) y de alerta, estado vacío y paginación (con la versión móvil).
- [ ] Contraste AA verificado con las herramientas del navegador en: botón `outline`, etiqueta en foco, mensaje de error, texto secundario (anotar ratios en el reporte). Texto blanco sobre marca queda exento (QW-010).
- [ ] Teclado: tab recorre el playground con foco visible en todo.
- [ ] `/login` y `/playground` correctos a 375, 768 y 1280 px, en claro **y** oscuro (capturas).
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
