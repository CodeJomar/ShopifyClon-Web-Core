# Estándares universales de ingeniería

Principios, reglas y estándares de **arquitectura, seguridad, escalabilidad y codificación** para backend y frontend, **independientes de la tecnología**. Sirven igual con NestJS, Spring Boot, FastAPI o Laravel en el servidor, y con React, Vue o Angular en la interfaz.

Nacen de construir CofflyFlow de punta a punta, pero aquí no hay nada propio de ese producto ni de un framework: lo específico de cada proyecto vive en `logica-de-negocio/` y lo específico de cada tecnología, en el `CLAUDE.md` del proyecto.

## Contenido

| Carpeta / archivo | Para qué sirve |
|---|---|
| `principios.md` | Los principios que gobiernan todas las decisiones |
| `flujo-de-trabajo.md` | Cómo se trabaja con Claude: orden, verificación, reporte, git |
| `backend/` | Arquitectura, datos y transacciones, API, seguridad, escalabilidad, pruebas, codificación, refactorización |
| `frontend/` | Arquitectura de UI, reutilización, estado, formularios, táctil y responsivo, feedback, seguridad, rendimiento, accesibilidad, pruebas, codificación |
| `logica-de-negocio/` | **Plantillas que se completan en cada proyecto** (visión, actores, módulos, flujos, integridad, decisiones) |
| `plantillas-claude/` | `CLAUDE.md` base de backend y frontend con huecos `[completar]` |
| `mapeo-por-tecnologia.md` | Cómo se traduce cada concepto a las tecnologías más comunes |

## Cómo usarlo en un proyecto nuevo

1. Copia `backend/`, `frontend/` y `logica-de-negocio/` a `docs/` del repositorio que corresponda (o déjalos fuera del repo y pásaselos a Claude).
2. Copia la plantilla de `plantillas-claude/` como `.claude/CLAUDE.md` y completa el stack. Es corto a propósito: las reglas largas se leen solo cuando la tarea las toca.
3. Completa `logica-de-negocio/` empezando por `00-vision-y-glosario.md`. Claude **no inventa reglas de negocio**: si falta algo, lo pregunta.
4. Si el proyecto necesita una convención propia, se agrega al `CLAUDE.md`, no a estos estándares.

## Cómo se leen las reglas

- **Obligatorio**: se cumple siempre; una excepción necesita una decisión escrita (`logica-de-negocio/05-decisiones.md`).
- **Recomendado**: se cumple salvo motivo concreto.
- **Opcional**: se aplica cuando el tamaño o el riesgo del proyecto lo justifican.

## Contexto que se carga

- `CLAUDE.md`: corto, siempre presente.
- Estándares de `backend/` o `frontend/`: solo el archivo que toca la tarea.
- `logica-de-negocio/`: solo el módulo o flujo de la tarea.
