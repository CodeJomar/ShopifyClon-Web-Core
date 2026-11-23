# W-002-C1 — Ajustes visuales de botones y campos

| Campo | Valor |
|---|---|
| Modelo | Sonnet |
| Rama | `tarea/W-002-C1-ajustes-visuales` desde `develop` |
| Depende de | W-002 (mergeada) |
| Tamaño | S–M |

## Objetivo
Que los botones y los campos se vean como la plantilla HTML del responsable. La especificación corregida está en `docs/diseno-web.md` §4.1 y §4.2 (revisión del 2026-10-20). Solo se tocan esos componentes y el `/playground`.

## Contexto (leer solo esto)
- `docs/diseno-web.md` §2 (tokens), §4.1 y §4.2
- `src/app/globals.css`, `src/shared/components/ui/{button,input,select,textarea}.tsx`, `src/shared/components/composed/{floating-input,floating-select,floating-textarea,search-input}.tsx`, `src/app/playground/`

## Defectos a corregir (diagnosticados por Opus)
| # | Defecto que vio el responsable | Causa | Corrección |
|---|---|---|---|
| 1 | Los select con valor se ponen **grises y en negrita** | `claseCampo` (`ui/input.tsx`) usa `read-only:bg-muted read-only:font-bold`; `:read-only` coincide con **cualquier elemento no editable**, incluido el `button` del select | Aplicar fondo y peso de solo lectura solo a `input`/`textarea` con `readOnly` (por ejemplo `[&:is(input,textarea):read-only]:…`, o una prop/`data-solo-lectura`). Un select con valor queda transparente y con peso 500 |
| 2 | **Rectángulo** blanco/oscuro detrás de la etiqueta flotante | `claseEtiqueta` pone `bg-card` fijo | Degradado `--campo-exterior` / `--campo-fondo` de §4.2. Definir `--campo-exterior: var(--card)` en `:root`/`.dark`; `Sheet`, `Dialog`, `AlertDialog` y `Popover` lo redefinen con su fondo; deshabilitado y solo lectura fijan `--campo-fondo: var(--muted)` |
| 3 | **Íconos desalineados** dentro del campo (sobre todo con ayuda o error) | Se centran con `top-1/2` respecto al contenedor, que incluye el mensaje de abajo | Envolver solo el `input` y sus íconos en un contenedor `relative`; el mensaje va fuera. Mismo arreglo en select y textarea |
| 4 | Íconos mal ubicados según su función | Solo lectura pone `Lock` y `Copy` a la derecha; contraseña no tiene ojo | Regla de §4.2: referencia a la izquierda y acción a la derecha. Solo lectura: `Lock` a la izquierda y `Copy` a la derecha. `type="password"`: botón `Eye`/`EyeOff` a la derecha que alterna la visibilidad (`aria-label` "Mostrar contraseña" / "Ocultar contraseña", `aria-pressed`). Buscador (`search-input`): `Search` a la izquierda y `X` a la derecha solo con texto |
| 5 | Hover de `outline`, `soft` y `ghost` con otro tono | Los tintes usan `brand-strong` (`#00A36C`) con opacidad; la plantilla usa `#00E699` | Tintes con `primary`: outline hover `bg-primary/10`; soft `bg-primary/14 border-primary/32`, hover `bg-primary/22`; ghost hover `bg-primary/12` |
| 6 | El `ghost` no se ve como en la plantilla | Su texto en reposo es verde | Reposo `text-foreground` con borde 1.8 transparente (mismo tamaño que los demás); hover `bg-primary/12 text-brand-text` |
| 7 | Falta la variante `warning` | — | `bg-warning text-warning-foreground`, hover como `default`. Agregar el token `--warning-foreground: #422006` (claro y oscuro) y exponerlo en `@theme` |
| 8 | Sobra `shadow` | — | Quitar la variante y migrar sus usos a `default` (`grep -rn 'variant="shadow"' src`) |
| 9 | `link` sin el subrayado animado | Usa `hover:underline` | Subrayado de 2 px con `after:` que crece de izquierda a derecha (`scale-x-0` → `scale-x-100`, origen izquierda) |

## Playground
- Botones: las 9 variantes de §4.1 (sin `shadow`, con `warning`) y una fila extra con cada una forzada en estado hover (una clase o `data-` solo del playground) para comparar con la plantilla.
- Campos: el correo con `Mail` a la izquierda; la contraseña con `Lock` a la izquierda y el ojo a la derecha; el de solo lectura con `Lock` a la izquierda y `Copy` a la derecha; un buscador; un select con valor (debe verse transparente); todo dentro de una isla **y** dentro de un `Sheet` para comprobar que la etiqueta no deja rectángulo.

## Fuera de alcance
- Cambiar tokens de color (salvo `--warning-foreground` y `--campo-*`), el layout u otros componentes.

## Criterios de aceptación
- [ ] Un select con valor tiene el mismo fondo y peso que uno vacío (medir `background-color` con `getComputedStyle`).
- [ ] Con zoom al 200 %, la etiqueta flotante no deja rectángulo visible en: campo normal, solo lectura, deshabilitado, dentro de isla y dentro de `Sheet`, en claro y oscuro (capturas de detalle).
- [ ] Los íconos quedan centrados verticalmente respecto al campo con y sin mensaje debajo (capturas).
- [ ] Ojo de contraseña: alterna `type` entre `password` y `text` y es operable con teclado.
- [ ] Hover de `outline`, `soft` y `ghost`: el `background-color` computado es `rgb(0 230 153 / α)` con α = 0.10, 0.22 y 0.12.
- [ ] `grep -rn 'variant="shadow"\|"shadow"' src/shared/components/ui/button.tsx src` sin resultados de la variante.
- [ ] Sin hex ni paletas sueltas fuera de `globals.css` (mismo grep de W-002).
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores; `/playground` a 375 y 1280 px en claro y oscuro (capturas).
