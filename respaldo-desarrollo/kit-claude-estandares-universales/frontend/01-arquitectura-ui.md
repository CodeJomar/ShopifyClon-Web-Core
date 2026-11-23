# Arquitectura de la interfaz

## Capas
```text
Rutas / composición   fina: decide URL, layouts y límites; importa vistas
Módulos de funcionalidad   vistas, componentes, hooks y esquemas de UNA capacidad
Compartido            sin negocio: sistema de componentes, utilidades, proveedores
Cliente de API        único punto que habla con el backend, tipado
Backend               negocio, autenticación, autorización, persistencia
```
- La capa de rutas **no construye pantallas**: importa la vista del módulo.
- Un módulo expone una **superficie pública** (índice); los demás módulos no importan sus archivos internos.
- `compartido` no conoce el dominio. Si necesita saberlo, pertenece a un módulo.
- Sin ciclos entre módulos; sin acceso directo a la base de datos desde la interfaz; sin copiar reglas de negocio del backend.

## Estructura de un módulo (nombres orientativos)
`views/` (pantallas), `components/`, `hooks/`, `schema` (validación y tipos), `actions/` (frontera fina hacia la API cuando el framework lo pide) e índice público. No se crean carpetas vacías por si acaso.

## Responsabilidades
- La interfaz presenta y recoge; **el backend decide** (dinero, estados, permisos).
- Los permisos en la interfaz son solo experiencia (ocultar lo que no se puede usar); la autoridad es el backend.
- Los contratos con la API son serializables y tipados; la interfaz solo conoce los campos que necesita.

## Composición de pantallas
- Una vista orquesta; los componentes hijos reciben datos por propiedades y avisan por eventos.
- Los efectos y la obtención de datos se concentran en hooks del módulo, no repartidos por los componentes de presentación.
- El título y los controles de una vista viven **dentro** del contenedor de la vista cuando el espacio vertical importa.

## Consistencia
- Las pantallas equivalentes siguen el mismo orden y el mismo patrón (si el catálogo del POS muestra buscador y luego categorías, el menú también).
