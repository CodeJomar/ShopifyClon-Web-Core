# Backend: instrucciones del proyecto

## Stack [completar]
- Lenguaje y framework: [ ]
- Base de datos y acceso a datos: [ ]
- Autenticación: [ ]
- Pruebas: [ ]
- Despliegue: [ ] (el diseño es portable)

## Estándares que aplican
Leer solo el archivo que toque la tarea, en `docs/estandares/backend/`:
arquitectura (01), datos y transacciones (02), API y validación (03), seguridad (04), escalabilidad (05), pruebas (06), codificación (07), refactorización (08).
Principios y flujo de trabajo: `docs/estandares/principios.md`, `docs/estandares/flujo-de-trabajo.md`.

## Reglas siempre vigentes
- El servicio decide; el repositorio solo consulta. Los servicios no importan el ORM.
- La transacción la abre el servicio; los eventos salen después del commit.
- Dinero, estado y permisos los decide el servidor; el cliente nunca.
- Seguridad por defecto: se niega lo no permitido.
- Una refactorización no cambia comportamiento: pruebas de humo antes y después.
- No se inventan reglas de negocio: se consulta `docs/negocio/` y se pregunta lo ambiguo.

## Convenciones propias del proyecto [completar]
- Estructura de carpetas: [ ]
- Idioma de código y mensajes: [ ]
- Particularidades de la tecnología: [ ]

## Estilo de trabajo
- Cambio mínimo, buscar antes de explorar, reutilizar dependencias instaladas.
- Nunca actualizar dependencias de forma forzada.
- Ejecutar primero la prueba más estrecha y ampliar después.
