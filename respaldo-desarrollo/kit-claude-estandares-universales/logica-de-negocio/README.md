# Lógica de negocio (plantillas a completar por proyecto)

Esta es la **única carpeta que cambia entre proyectos**. Todo lo demás de `06-estandares-universales` aplica sin tocarlo.

## Cómo completarla
1. `00-vision-y-glosario.md`: qué es el producto, para quién y el vocabulario exacto.
2. `01-actores-roles-permisos.md`: quién usa el sistema y qué puede hacer.
3. Un archivo por módulo a partir de `02-plantilla-modulo.md` (cópialo con el nombre del módulo).
4. Un archivo por flujo transversal a partir de `03-plantilla-flujo.md`.
5. `04-reglas-de-integridad.md`: lo que el sistema garantiza siempre (dinero, estados, propiedad, inmutabilidad).
6. `05-decisiones.md`: cada decisión, con su motivo y lo descartado.
7. `06-principios-ux-producto.md` y `07-requisitos-no-funcionales.md`.
8. `08-preguntas-abiertas.md`: lo que aún no se sabe.

## Reglas de uso
- **Claude no inventa reglas de negocio.** Si un documento no cubre algo, pregunta y la respuesta se agrega aquí.
- Cada regla lleva un **identificador estable** (`PED-001`, `CAJ-004`) para trazarla a pruebas, errores y decisiones.
- Documentos **cortos**: una pantalla de contexto por módulo. Lo extenso se divide.
- Se actualizan en el mismo cambio que modifica el comportamiento.
- Solo se cargan en el contexto los documentos del módulo o flujo de la tarea.

## Contenido
| Archivo | Qué se completa |
|---|---|
| `00-vision-y-glosario.md` | Propósito, alcance, glosario |
| `01-actores-roles-permisos.md` | Actores y matriz de permisos |
| `02-plantilla-modulo.md` | Plantilla de módulo |
| `03-plantilla-flujo.md` | Plantilla de flujo |
| `04-reglas-de-integridad.md` | Invariantes del sistema |
| `05-decisiones.md` | Registro de decisiones |
| `06-principios-ux-producto.md` | Usuarios, dispositivos y contexto de uso |
| `07-requisitos-no-funcionales.md` | Volumen, disponibilidad, retención, cumplimiento |
| `08-preguntas-abiertas.md` | Pendientes por responder |
