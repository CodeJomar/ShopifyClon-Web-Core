# Reglas de integridad

Lo que el sistema garantiza **siempre**, decidido por el servidor y respaldado por la base de datos. Completar con los valores concretos del producto.

## Dinero y cantidades
- Unidad mínima y moneda: [ ]
- Quién calcula totales, impuestos y descuentos: el servidor.
- Límites (cantidad por línea, líneas por pedido, montos máximos): [ ]
- Precios y nombres al momento de la operación se guardan como instantánea: [ ]

## Estados
- Ciclos de vida independientes que no deben mezclarse (por ejemplo preparación vs. pago): [ ]
- Estados finales: [ ]
- Mapa único de transiciones permitidas: [ ]

## Propiedad y permisos
- Recursos operados solo por quien los abrió: [ ]
- Acciones que exigen motivo y auditoría: [ ]

## Inmutabilidad
- Registros que no se editan ni se borran (libro contable, períodos cerrados, comprobantes): [ ]
- Cómo se corrige: ajustes trazables con motivo obligatorio: [ ]

## Unicidad y exclusividad
- Cosas que solo pueden existir una vez o de a una (un turno abierto, un número único entre activos): [ ]

## Concurrencia e idempotencia
- Operaciones que exigen clave de idempotencia: [ ]
- Qué reciben las peticiones simultáneas con la misma clave: [ ]

## Retención y privacidad
- Datos personales, cifrado y plazos de conservación: [ ]
