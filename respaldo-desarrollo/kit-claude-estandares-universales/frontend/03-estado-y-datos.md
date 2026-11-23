# Estado y datos

## Tipos de estado
| Tipo | Dónde vive |
|---|---|
| Estado del servidor (datos de la API) | La capa de lectura del framework o una librería de caché; nunca copiado a un almacén global sin motivo |
| Estado de interfaz global (tema, menú lateral) | Un almacén pequeño o el contexto |
| Estado de interfaz local | El componente que lo usa |
| Filtros, página y orden | La URL cuando la vista debe poder compartirse o recargarse |
| Estado de formulario | El manejador de formularios |

## Lectura y escritura
- Lectura inicial desde el servidor cuando el framework lo permite; el cliente solo hace lo interactivo.
- Toda mutación pasa por el cliente de API; la interfaz **no replica** reglas del backend.
- Una mutación termina con un aviso de resultado y con la **actualización de lo que cambió** (recargar o invalidar), no con datos fabricados en el cliente.
- Actualización optimista solo cuando el fallo es raro y reversible; nunca con dinero.

## Estado derivado
- Lo que se puede calcular de otro estado **no se guarda**: se calcula al renderizar.
- Reiniciar estado cuando cambia una condición (por ejemplo al pasar de modo móvil a escritorio) se hace **ajustando el estado durante el render**, no con un efecto que llama al setter: es más barato y evita parpadeos.

## Datos en vivo
- Tiempo real por canal persistente cuando existe; sondeo periódico como alternativa degradada, con el indicador visible («En vivo» / «Actualización periódica»).
- El sondeo se detiene cuando la pestaña no está visible y no se acumula.

## Lo que nunca se guarda en el cliente
- Tokens o credenciales en almacenamiento accesible por JavaScript.
- Datos personales innecesarios.
- Totales calculados que el servidor vaya a recalcular: son vista previa, no verdad.

## Contratos
- Los tipos de la API se declaran una vez y se infieren de los esquemas de validación cuando existan.
