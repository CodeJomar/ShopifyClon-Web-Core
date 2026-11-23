# Frontend: instrucciones del proyecto

## Stack [completar]
- Framework de UI y de rutas: [ ]
- Estilos y sistema de componentes: [ ]
- Validación y formularios: [ ]
- Autenticación: [ ] (la autoridad es el backend)
- Despliegue: [ ] (el diseño es portable)

## Estándares que aplican
Leer solo el archivo que toque la tarea, en `docs/estandares/frontend/`:
arquitectura (01), componentes y reutilización (02), estado y datos (03), formularios (04), táctil y responsivo (05), feedback y overlays (06), seguridad (07), rendimiento (08), accesibilidad (09), pruebas (10), codificación (11).
Principios y flujo de trabajo: `docs/estandares/principios.md`, `docs/estandares/flujo-de-trabajo.md`.

## Reglas siempre vigentes
- Antes de crear un componente, buscar el estándar existente; un patrón de dos módulos se promueve a compartido.
- Formularios y detalles en el panel estándar; no se construye un contenedor paralelo.
- Toast, confirmación y panel son únicos y globales.
- Táctil primero: la tarjeta completa es el botón, objetivos grandes, pocos pasos.
- Un único punto de quiebre decide la navegación responsiva.
- La interfaz nunca decide permisos ni dinero; el backend es la autoridad.

## Convenciones propias del proyecto [completar]
- Estructura de carpetas: [ ]
- Idioma de textos: [ ]
- Particularidades de la tecnología: [ ]

## Verificación
- Compilar, lint y revisar la interfaz en un navegador real a los anchos objetivo; informar lo que no se pudo verificar.
