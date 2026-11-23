# Guía para el grupo: levantar OTemu con Docker y probar la API

## 1. Qué se levanta

Un solo proyecto de Docker (`utp-desarrollo-shfy`) con tres contenedores:

| Contenedor | Puerto | Qué es |
|---|---|---|
| `shfy-api-core` | 8080 | API Spring Boot (`http://localhost:8080/api/v1`) |
| `shfy-web-core` | 3000 | Web Next.js (`http://localhost:3000`) |
| `shfy-stripe-cli` | — | Reenvía los webhooks de Stripe (modo prueba) a la API |

La base de datos es **Supabase** (remota, de pruebas): no hay contenedor de Postgres.

## 2. Requisitos

- Docker Desktop instalado y **prendido** (esperar a que diga "Engine running").
- Git.
- Nada más: no hace falta instalar Java, Node ni Maven; todo se compila dentro de Docker.

## 3. Preparar la carpeta

La carpeta de trabajo tiene esta forma (los dos repos dentro de una carpeta madre, con el compose al lado):

```
Desarrollo/
├── docker-compose.yml          ← lo entrega el responsable (no está en los repos)
├── .env                        ← solo la clave pública de Stripe
├── ShopifyClon-Api-Core/       ← repo del backend (rama develop)
└── ShopifyClon-Web-Core/       ← repo del frontend (rama develop)
```

```bash
git clone https://github.com/CodeJomar/ShopifyClon-Api-Core.git
git clone https://github.com/CodeJomar/ShopifyClon-Web-Core.git
```

En cada repo: `git checkout develop` y `git pull`.

## 4. Archivos de variables (los entrega el responsable por privado)

**Nunca se suben a git ni se pegan en chats grupales.**

- `ShopifyClon-Api-Core/.env`: base de datos (`DB_*`), Supabase (`SUPABASE_*`), `JWT_SECRET_KEY`, correo (`MAIL_*`) y Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
- `Desarrollo/.env`: una línea, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`.

## 5. Levantar todo

Desde la carpeta `Desarrollo/`:

```bash
docker compose up -d --build
```

La primera vez tarda varios minutos (compila la API y la web). Para ver el estado:

```bash
docker compose ps
```

Debe mostrar `shfy-api-core` **healthy**, `shfy-web-core` y `shfy-stripe-cli` **Up**. La web espera sola a que la API esté sana.

Comandos útiles:

| Para | Comando |
|---|---|
| Ver logs de la API | `docker compose logs -f api-core` |
| Reiniciar solo la API | `docker compose restart api-core` |
| Reconstruir tras cambiar código | `docker compose up -d --build api-core` (o `web-core`) |
| Apagar todo | `docker compose down` |

En Docker Desktop aparece como un solo grupo `utp-desarrollo-shfy`.

Cuando cambies código del backend o del frontend hay que **reconstruir** (`--build`); los contenedores no leen tus archivos en vivo.

## 6. Comprobar que funciona

- API: `http://localhost:8080/api/v1/planes` devuelve JSON con los planes.
- Web: `http://localhost:3000`.
- Swagger: `http://localhost:8080/api/v1/swagger-ui/index.html`.
- **Laboratorio de endpoints: `http://localhost:8080/api/v1/laboratorio/index.html`** (ver sección 7).

## 7. El laboratorio de endpoints (para probar la API sin Postman)

Son páginas HTML que sirve la propia API. Cada módulo explica para qué sirve cada endpoint, qué hay que tener listo y trae **casos que se ejecutan con un clic**: éxito, error de negocio, validación y seguridad. Sirve para entender cómo responde la API y para encontrar fallos antes de integrar el frontend.

**Importante:** escribe datos reales en la base de pruebas (usuarios, tiendas, órdenes). Es compartida por el grupo: no borrar ni modificar datos de otros.

### Primer uso, en este orden

1. **Cuenta y sesión** → «Login correcto»: escribe correo y contraseña de una cuenta de prueba y pulsa Ejecutar. (La cuenta se pide al responsable.) El token queda guardado solo.
2. **Tienda y personal** → botón **«Usar mi primera tienda operativa»** (o «Crear una tienda de prueba»). Elige la tienda con la que se trabajará; arriba aparece como chip «Tienda».
3. Cualquier otro módulo. Lo que cada prueba genera (token, tienda, producto, carrito, orden, envío…) se guarda y lo reutilizan los demás.

### Cómo se lee una página

- **Barra superior:** chips con la sesión, tienda, orden… y los botones «Ver y editar estado» y «Probar conexión».
- **Preparación rápida:** botones que dejan listo lo que los casos necesitan (por ejemplo «Crear producto publicado»).
- **Cada endpoint:** su ruta, quién puede usarlo, una sección **Importante** con lo que hay que saber ("para que funcione se debe...") y sus casos.
- **Cada caso:** etiqueta del tipo (Éxito, Error esperado, Validación, Seguridad), qué se espera, campos editables y el botón **Ejecutar**. El resultado muestra ✔/✘, el HTTP recibido, la respuesta completa, lo que se envió y un `curl` para copiar.
- **«Ejecutar todos los casos»** (por endpoint) y **«Ejecutar todo el módulo»** (arriba): corren todo en orden. Los casos marcados *manual* se omiten: piden datos tuyos o destruyen estado; se ejecutan a mano.

### Ruta sugerida para una demo completa de compra

1. **Tienda** → crear o usar una tienda.
2. **Tarifas de envío** → «Crear una tarifa de envío».
3. **Catálogo** → «Crear producto publicado (con stock)».
4. **Carrito** → «Crear un carrito con 2 unidades»; probar cupón (creado antes en **Cupones**).
5. **Checkout** → caso «Compra exitosa (pago manual)».
6. **Pagos y reembolsos** → pago manual, luego reembolso o cancelación.
7. **Envíos** → preparar → despachar → entregar; **Rutas** → hoja de ruta; **Seguimiento** → consultar la guía.

Atajo: la receta **«Todo de una vez»** (en Envíos, Órdenes…) hace todo hasta tener una orden pagada con envío.

### Cosas que conviene saber

- **Segunda tienda de una cuenta:** nace con la suscripción vencida y toda escritura del panel responde `SUS-017` hasta pagar. «Crear una tienda de prueba» la paga sola con la pasarela simulada (token `tok_lab`).
- **Plataforma:** solo para la cuenta de administrador de plataforma; con otra cuenta responde 403.
- **Límite de velocidad:** si la API responde 429, el laboratorio espera y reintenta solo.
- **Stock:** si baja de 10 unidades, las recetas lo reponen a 100.
- Si al abrir una página no carga o dice "sin conexión": Docker apagado o el contenedor `shfy-api-core` aún arrancando (esperar a `healthy`).

## 8. Probar el pago con tarjeta (Stripe, modo prueba)

1. Web `http://localhost:3000` → entrar a una tienda → agregar producto → checkout.
2. En «Método de pago» elegir **Tarjeta (Stripe)** y confirmar la compra.
3. En la página de la orden, pagar con las tarjetas de prueba:
   - Aprobada: `4242 4242 4242 4242`, fecha futura, CVC cualquiera.
   - Rechazada: `4000 0000 0000 0002`.
4. La orden pasa a **Pagado** en unos segundos (lo confirma el webhook; por eso debe estar `shfy-stripe-cli` arriba).

## 9. Problemas frecuentes

| Síntoma | Causa / solución |
|---|---|
| `failed to connect to the docker API` | Docker Desktop apagado. Prenderlo y esperar. |
| La API no pasa a `healthy` | `docker compose logs api-core`: casi siempre falta algo del `.env` o no hay internet hacia Supabase. |
| Puerto 8080 o 3000 ocupado | Apagar lo que lo usa, o `docker compose down` y volver a subir. |
| La orden con Stripe se queda `PENDIENTE` | `shfy-stripe-cli` caído, o su `whsec_` no coincide con `STRIPE_WEBHOOK_SECRET` del `.env` de la API. |
| Cambié código y no se nota | Falta `--build`. |
| Logs ilegibles | `docker compose logs --tail 100 api-core`. |

## 10. Para quien mantiene el entorno

- `docker-compose.yml` y `Desarrollo/.env` **no están en ningún repo** (la carpeta `Desarrollo/` no es un repositorio). Compartir por privado o versionar el compose en un repo.
- Desplegando en Railway: crear el destino de webhook en el panel de Stripe con la URL pública `https://TU-DOMINIO/api/v1/webhooks/stripe`, eventos `payment_intent.succeeded` y `payment_intent.payment_failed`, y poner el nuevo `whsec_` en las variables del servidor. El laboratorio se apaga allí con `LABORATORIO_HABILITADO=false`.
