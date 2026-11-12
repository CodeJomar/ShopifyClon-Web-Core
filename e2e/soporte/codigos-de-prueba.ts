import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import * as fs from "node:fs"
import * as path from "node:path"

/**
 * Lectura de los códigos de un solo uso (activación, segundo paso, desbloqueo) para las pruebas e2e.
 *
 * La API guarda solo el SHA-256 del código de 6 dígitos (`TokensSeguridad.CodigoToken`) y lo envía por correo. En pruebas locales,
 * con el correo apagado (`MAIL_ENABLED=false`), se lee el hash de la base de pruebas (consulta de solo lectura, vía el
 * contenedor `postgres:16-alpine`) y se halla el código probando los 1 000 000 posibles. Solo sirve contra la base de PRUEBAS:
 * las credenciales salen del `.env` de la API y nunca se imprimen.
 */
export type TipoCodigo = "ACTIVACION_CUENTA" | "RECUPERACION_CLAVE" | "DESBLOQUEO_CUENTA" | "SEGUNDO_FACTOR"

function leerEnvApi(): Record<string, string> {
  const archivo = path.join(__dirname, "..", "..", "..", "ShopifyClon-Api-Core", ".env")
  const env: Record<string, string> = {}
  for (const linea of fs.readFileSync(archivo, "utf8").split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !linea.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
  return env
}

function hashDelUltimoCodigo(correo: string, tipo: TipoCodigo): string | null {
  if (!/^[\w.+-]+@[\w.-]+$/.test(correo)) throw new Error("Correo de prueba no válido")
  const env = leerEnvApi()
  const consulta = `select t."CodigoToken" from "TokensSeguridad" t join "Usuarios" u on u."Id" = t."UsuarioId" where lower(u."CorreoElectronico") = lower('${correo}') and t."Tipo" = '${tipo}' and not t."Usado" order by t."FechaCreacion" desc limit 1`
  const salida = execFileSync(
    "docker",
    [
      "run", "--rm", "-i",
      "-e", "PGHOST", "-e", "PGPORT", "-e", "PGDATABASE", "-e", "PGUSER", "-e", "PGPASSWORD", "-e", "PGSSLMODE", "-e", "PGOPTIONS",
      "postgres:16-alpine", "psql", "-At", "-c", consulta,
    ],
    {
      env: {
        ...process.env,
        PGHOST: env.DB_HOST,
        PGPORT: env.DB_PORT,
        PGDATABASE: env.DB_NAME,
        PGUSER: env.DB_USERNAME,
        PGPASSWORD: env.DB_PASSWORD,
        PGSSLMODE: "require",
        PGOPTIONS: "-c default_transaction_read_only=on",
      },
      encoding: "utf8",
    },
  ).trim()
  return salida || null
}

/** Devuelve el código de 6 dígitos pendiente más reciente del usuario y tipo, esperando hasta `esperaMs` a que aparezca. */
export async function leerCodigo(correo: string, tipo: TipoCodigo, esperaMs = 15_000): Promise<string> {
  const limite = Date.now() + esperaMs
  let hash: string | null = null
  while (!hash && Date.now() < limite) {
    hash = hashDelUltimoCodigo(correo, tipo)
    if (!hash) await new Promise((r) => setTimeout(r, 1000))
  }
  if (!hash) throw new Error(`No hay un código ${tipo} pendiente para ${correo}`)
  for (let i = 0; i < 1_000_000; i++) {
    const codigo = String(i).padStart(6, "0")
    if (createHash("sha256").update(codigo).digest("hex") === hash) return codigo
  }
  throw new Error("No se pudo recuperar el código a partir de su hash")
}
