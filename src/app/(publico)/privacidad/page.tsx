import { claseContenedor } from "@/shared/components/marketing/estilos"
import { cn } from "@/shared/utils/cn"

export const metadata = { title: "Política de privacidad | OTemu", description: "Cómo OTemu recoge, usa y protege tus datos personales." }

const SECCIONES = [
  { t: "Qué datos recogemos", p: "Al crear tu cuenta guardamos tus nombres, apellidos, correo electrónico y, si lo indicas, tu teléfono. Al comprar guardamos tus direcciones de entrega y el historial de tus pedidos. Si abres una tienda, guardamos los datos de la tienda y de su equipo." },
  { t: "Para qué los usamos", p: "Para crear y proteger tu cuenta, procesar tus compras y envíos, enviarte códigos de activación y avisos sobre tus pedidos, y mantener la seguridad de la plataforma (por ejemplo, detectar intentos de acceso sospechosos)." },
  { t: "Con quién los compartimos", p: "Las tiendas donde compras reciben solo lo necesario para atender tu pedido: tu nombre, contacto y dirección de entrega. No vendemos tus datos a terceros. Podemos compartirlos con proveedores que operan la plataforma (alojamiento, correo, pagos) y con autoridades cuando la ley lo exija." },
  { t: "Cuánto tiempo los conservamos", p: "Mientras tu cuenta esté activa y durante el tiempo que la ley exija conservar registros de operaciones. Si eliminas tu cuenta, borramos o anonimizamos tus datos personales, salvo los que debamos conservar por obligación legal." },
  { t: "Tus derechos", p: "Puedes acceder a tus datos, corregirlos, pedir su eliminación u oponerte a su uso, conforme a la Ley N.° 29733 de Protección de Datos Personales del Perú. Puedes editar tu perfil y eliminar tu cuenta desde la sección Cuenta." },
  { t: "Seguridad", p: "Guardamos tus contraseñas cifradas, protegemos las sesiones y limitamos los intentos de acceso. Ningún sistema es infalible: si detectamos un incidente que te afecte, te lo comunicaremos." },
  { t: "Cambios y contacto", p: "Si actualizamos esta política, publicaremos la nueva versión en esta página. Para consultas sobre tus datos, escríbenos desde el contacto indicado en la plataforma." },
]

export default function Privacidad() {
  return (
    <div className={cn(claseContenedor, "py-10 sm:py-14")}>
      <header className="max-w-2xl">
        <h1 className="text-[36px] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-[48px]">Política de privacidad</h1>
        <p className="mt-4 text-[16px] font-medium leading-relaxed text-muted-foreground">
          Esta política explica qué datos personales trata OTemu, para qué y cuáles son tus derechos. Al crear una cuenta confirmas que la has leído.
        </p>
      </header>
      <div className="mt-10 max-w-3xl space-y-5">
        {SECCIONES.map((s, i) => (
          <section key={s.t} className="vidrio rounded-[28px]">
            <div className="rounded-[27px] p-7">
              <h2 className="text-[18px] font-extrabold tracking-tight text-foreground">{i + 1}. {s.t}</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">{s.p}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
