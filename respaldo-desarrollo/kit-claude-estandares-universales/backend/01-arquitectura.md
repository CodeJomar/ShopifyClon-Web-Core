# Arquitectura del backend

## Organización
- **Por capacidad de negocio, no por tipo técnico.** Un módulo por capacidad (pedidos, caja, usuarios), no carpetas globales de controladores y servicios.
- Estructura de un módulo (nombres orientativos): definición del módulo, `controllers/`, `services/`, `repositories/`, `dto/` y, solo si existen, `gateways/`, `events/`, `interceptors/`, `exceptions/`, `utils/`, `strategies/`.
- Infraestructura transversal (seguridad, auditoría, base de datos, salud, configuración, validadores) vive en una carpeta común, nunca dentro de un módulo de negocio.
- La definición del módulo es el único archivo suelto en su raíz.

## Capas y responsabilidades
```text
Transporte (HTTP / WebSocket / cola)
   -> Controlador / Pasarela        traduce transporte; valida forma; delega
      -> Servicio / Caso de uso     decide reglas; abre la transacción; emite eventos y auditoría
         -> Repositorio             consulta y escribe; no decide
            -> Base de datos / servicio externo
```
| Capa | Hace | No hace |
|---|---|---|
| Controlador | Recibe, valida la forma, resuelve identidad, delega, formatea respuesta | Reglas de negocio, consultas |
| Servicio | Reglas, permisos que dependen del contenido, cálculos, transacciones, eventos | Consultas directas al ORM, detalles de HTTP |
| Repositorio | Consultas y escrituras de un agregado | DTOs, excepciones HTTP, reglas, transacciones, eventos |

## Propiedad de los datos
- **Cada tabla tiene un módulo dueño.** Solo el dueño escribe.
- Otro módulo que necesite cambiar un dato ajeno lo pide a través del repositorio o servicio exportado por el dueño.
- Las **lecturas** agregadas o con uniones sobre tablas ajenas (panel, consultas) se permiten dentro del repositorio del módulo que lee.
- Los módulos de solo lectura también tienen repositorio: mantienen al servicio libre de detalles de persistencia.

## Dependencias entre módulos
- Se colabora por servicios o repositorios **exportados**, por contratos compartidos deliberados o por eventos. Nunca por importaciones profundas a archivos internos.
- Sin ciclos. Un ciclo indica dirección de dependencias equivocada; la salida preferida es un **módulo de datos mínimo** que solo provee y exporta un repositorio compartido, no una referencia circular diferida.
- El acoplamiento temporal innecesario se resuelve con eventos de dominio.

## Medida justa
- Sin interfaces, puertos ni capas extra para un CRUD simple. El repositorio es la única abstracción de persistencia que se espera.
- Sin repositorio base genérico: las diferencias de bloqueo y de filtros se esconden en la herencia.
- Un servicio que mezcla varios casos de uso y crece sin control se parte por caso de uso, en un cambio aparte y con las mismas pruebas.
- Si una pieza solo existe para satisfacer un patrón, se elimina.
