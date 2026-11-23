# Actores, roles y permisos

## Actores
| Actor | Descripción | ¿Usa el sistema? | Dispositivo habitual |
|---|---|---|---|
| Visitante | Navega la vitrina de una tienda sin identificarse | Sí (vitrina) | Móvil |
| Comprador invitado | Compra sin cuenta; se identifica por el token del carrito y su correo | Sí (vitrina, checkout) | Móvil |
| Comprador registrado | Usuario con sesión; guarda direcciones y ve su historial de órdenes | Sí | Móvil / escritorio |
| Propietario | Dueño de la tienda; paga la suscripción | Sí (panel) | Escritorio / móvil |
| Personal de tienda | Opera la tienda con un rol asignado | Sí (panel) | Escritorio |
| Administrador de plataforma | Gestiona planes y supervisa tiendas | Sí (panel de plataforma) | Escritorio |
| Pasarela de pago | Sistema externo que notifica pagos por webhook | Sí (máquina) | — |
| Planificador interno | Tareas programadas (vencer reservas, renovar suscripciones) | Sí (máquina) | — |

## Roles
Un usuario tiene **como máximo un rol por tienda** (D-004). Un mismo usuario puede ser propietario de una tienda, gestor en otra y comprador en cualquiera.

| Rol (`Roles.Codigo`) | Propósito | Quién lo asigna |
|---|---|---|
| `PROPIETARIO` | Control total de la tienda, incluida la suscripción | El sistema al crear la tienda (no se asigna a mano) |
| `ADMINISTRADOR` | Opera todo salvo suscripción y propiedad | Propietario |
| `GESTOR_CATALOGO` | Productos, variantes, imágenes, categorías e inventario | Propietario o Administrador |
| `GESTOR_PEDIDOS` | Órdenes: preparar, enviar, registrar pagos manuales | Propietario o Administrador |
| Administrador de plataforma | Planes y supervisión de tiendas. Es una bandera del usuario (`Usuarios.EsAdministradorPlataforma`), no un rol de tienda | Directamente en base de datos (semilla) |

> El comprador **no** es un rol: no se inserta en `PersonalTienda` (D-005). El código `CLIENTE` deja de usarse.

## Permisos (códigos estables usados en el código)
`TIENDA_CONFIGURAR`, `SUSCRIPCION_GESTIONAR`, `PERSONAL_GESTIONAR`, `CATALOGO_GESTIONAR`, `INVENTARIO_AJUSTAR`, `CUPONES_GESTIONAR`, `ENVIOS_CONFIGURAR`, `ORDENES_VER`, `ORDENES_GESTIONAR`, `ORDENES_CANCELAR`, `REEMBOLSOS_EMITIR`, `METRICAS_VER`.

## Matriz rol × permiso (fija en código, D-006)
| Permiso | PROPIETARIO | ADMINISTRADOR | GESTOR_CATALOGO | GESTOR_PEDIDOS |
|---|:-:|:-:|:-:|:-:|
| TIENDA_CONFIGURAR (nombre, contacto, impuesto) | ✔ | ✔ | | |
| SUSCRIPCION_GESTIONAR | ✔ | | | |
| PERSONAL_GESTIONAR | ✔ | ✔ (solo gestores) | | |
| CATALOGO_GESTIONAR | ✔ | ✔ | ✔ | |
| INVENTARIO_AJUSTAR | ✔ | ✔ | ✔ | |
| CUPONES_GESTIONAR | ✔ | ✔ | | |
| ENVIOS_CONFIGURAR (tarifas) | ✔ | ✔ | | |
| ORDENES_VER | ✔ | ✔ | | ✔ |
| ORDENES_GESTIONAR (preparar, enviar, pago manual) | ✔ | ✔ | | ✔ |
| ORDENES_CANCELAR (solo órdenes no pagadas) | ✔ | ✔ | | ✔ |
| REEMBOLSOS_EMITIR (y cancelar órdenes pagadas) | ✔ | ✔ | | |
| METRICAS_VER | ✔ | ✔ | | |

## Acceso público y de comprador
| Acción | Quién |
|---|---|
| Ver tienda por subdominio, productos **publicados** y categorías | Cualquiera, solo si la tienda está operativa (TIE-004) |
| Carrito y checkout | Cualquiera con el token del carrito |
| Ver una orden propia | Comprador registrado dueño de la orden, o quien tenga `Ordenes.TokenAcceso` |
| Libreta de direcciones | Solo el propio usuario |

## Reglas de propiedad
- Todo recurso de negocio pertenece a una tienda; una petición del panel solo opera sobre la tienda del encabezado `X-Tienda-Id` **y** si el usuario es miembro de esa tienda (SEG-001). Un recurso de otra tienda responde **404**, nunca 403 (no se revela su existencia).
- Las direcciones y el historial de órdenes de un comprador solo los ve ese comprador.

## Permisos que dependen del contenido
- Cancelar una orden **pagada** exige `REEMBOLSOS_EMITIR` (porque implica reembolso); una no pagada, `ORDENES_CANCELAR`.
- `ADMINISTRADOR` con `PERSONAL_GESTIONAR` solo puede asignar, cambiar o quitar roles `GESTOR_*`; nunca `ADMINISTRADOR` ni `PROPIETARIO`.

## Cuenta del propietario
- Puede todo dentro de su tienda.
- No puede quitarse a sí mismo ni cambiar su rol; no puede ser eliminado por otro miembro.
- Transferir la propiedad queda fuera de la primera versión (Q-004).
- El administrador de plataforma **no** ve órdenes ni clientes de las tiendas: solo planes, suscripciones y el estado de la tienda (puede suspenderla y reactivarla).
