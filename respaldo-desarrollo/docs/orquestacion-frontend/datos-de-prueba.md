# Datos de prueba (entorno local, NO producción)

> Archivo fuera de git (`Desarrollo/` no es un repositorio). Solo para pruebas locales contra la API de desarrollo. **Nunca** copiar estas credenciales a reportes, commits, código ni a `.env.example`.

## Cuenta principal
| Correo | Contraseña | Rol |
|---|---|---|
| `codejomar@gmail.com` | `OTemu2026` | PROPIETARIO de "Tienda W006 Prueba" y "Tienda W006 Dos" |

## Tiendas
| Tienda | Subdominio | Id | Uso |
|---|---|---|---|
| Tienda W006 Prueba | `tienda-w006-prueba` | `826d8c0c-0b3d-4578-88cd-d57d608156e5` | vitrina, carrito y checkout (Haiku) |
| Tienda W006 Dos | `tienda-w006-dos` | `39daf672-c629-4403-a368-b462dd9ee252` | pruebas que alteran estado: activar/desactivar, suscripción (Antigravity) |

## Cuentas adicionales (roles y permisos)
Decisión del responsable (2026-10-21): si una prueba necesita otra cuenta (por ejemplo ADMINISTRADOR o GESTOR), **se crea por SQL**, ya **activa**, con la **misma contraseña** `OTemu2026`.
- La crea **Opus** a pedido del ejecutor (el ejecutor no toca la base de datos): `INSERT` en `"Usuarios"` (`"Id"`, `"CorreoElectronico"` en minúsculas, `"ContrasenaHash"`, `"Nombres"`, `"Apellidos"`, `"EstaActivo" = TRUE`, `"Eliminado" = FALSE`, auditoría), copiando el `"ContrasenaHash"` (BCrypt) de la cuenta principal, que tiene la misma contraseña.
- Luego se agrega al personal **por la API/web** (`POST /panel/personal`), no por SQL, para respetar las reglas PER-*.
- Correos de prueba: `<rol>.prueba@otemu.test` (por ejemplo `administrador.prueba@otemu.test` para el rol de tienda ADMINISTRADOR, `catalogo.prueba@otemu.test`, `pedidos.prueba@otemu.test`; `admin.prueba@otemu.test` ya es el administrador de plataforma).

| Correo | Creada | Rol asignado | Tienda |
|---|---|---|---|
| `admin.prueba@otemu.test` | 2026-10-21 (SQL, Opus) | **Administrador de plataforma** (`EsAdministradorPlataforma = TRUE`), sin tiendas | — |

## Cuentas de demostración del rediseño (2026-11-16)
Creadas por la API (no por SQL) en la base de pruebas, ya activas. Contraseña: la constante `CONTRASENA_DE_PRUEBA` de `ShopifyClon-Web-Core/e2e/soporte/tienda-de-pruebas.ts`.

| Correo | Perfil | Qué tiene |
|---|---|---|
| `comprador.demo@otemu.test` | Comprador | Solo cuenta; puede comprar y, si quiere, abrir su tienda |
| `propietario.demo@otemu.test` | Propietario | Tienda gratuita `tienda-demo` (plan GRATIS) |
| `admin.prueba@otemu.test` | Administrador de plataforma | Superadministrador, sin tiendas; contraseña documentada arriba |
