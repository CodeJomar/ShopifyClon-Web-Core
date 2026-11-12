"use client"

import * as React from "react"
import { Ban, CheckCircle2, Plus, ShieldAlert, ShieldCheck, Store, UserCheck, Users } from "lucide-react"
import { Badge, type TonoInsignia } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { toast } from "@/shared/components/ui/toast"
import { ControlSegmentado } from "@/shared/components/composed/control-segmentado"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { SearchInput } from "@/shared/components/composed/search-input"
import { useConfirm } from "@/shared/providers/confirm-provider"
import { formatearDinero } from "@/shared/utils/dinero"
import { formatearFecha } from "@/shared/utils/fechas"
import {
  ADMINISTRADORES_ADMIN,
  AUDITORIA_ADMIN,
  PERMISOS_POR_ROL,
  TIENDAS_ADMIN,
  USUARIOS_ADMIN,
  type AdministradorAdmin,
  type EstadoTienda,
  type EstadoUsuario,
  type PerfilUsuario,
  type TiendaAdmin,
  type UsuarioAdmin,
} from "../admin-mock"

const sinTildes = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const NOTA = "Datos de ejemplo: se conectan a la API cuando el backend entregue la administración de plataforma."

type Tono = TonoInsignia
const TONO_TIENDA: Record<EstadoTienda, { texto: string; tono: Tono }> = {
  ACTIVA: { texto: "Activa", tono: "marca" },
  SUSPENDIDA: { texto: "Suspendida", tono: "peligro" },
  SUSCRIPCION_VENCIDA: { texto: "Suscripción vencida", tono: "aviso" },
}
const TONO_USUARIO: Record<EstadoUsuario, { texto: string; tono: Tono }> = {
  ACTIVO: { texto: "Activo", tono: "marca" },
  BLOQUEADO: { texto: "Bloqueado", tono: "peligro" },
  SIN_ACTIVAR: { texto: "Sin activar", tono: "neutro" },
}
const PERFIL: Record<PerfilUsuario, { texto: string; tono: Tono }> = {
  COMPRADOR: { texto: "Comprador", tono: "neutro" },
  PROPIETARIO: { texto: "Propietario", tono: "info" },
  ADMINISTRADOR: { texto: "Administrador", tono: "morado" },
}

function Aviso() {
  return <p className="text-[12px] font-medium text-muted-foreground">{NOTA}</p>
}

function Kpi({ icono: Icono, titulo, valor, detalle }: { icono: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="rounded-3xl border border-island-border bg-card p-6 shadow-isla">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
        <Icono aria-hidden className="size-4 text-brand-text" /> {titulo}
      </p>
      <p className="mt-3 text-[30px] font-extrabold leading-none tracking-tight text-foreground">{valor}</p>
      {detalle && <p className="mt-2 text-[12.5px] text-muted-foreground">{detalle}</p>}
    </div>
  )
}

/* ---------- Resumen ---------- */
export function ResumenAdminView() {
  const activas = TIENDAS_ADMIN.filter((t) => t.estado === "ACTIVA").length
  const ventas = TIENDAS_ADMIN.reduce((s, t) => s + t.ventas_30d, 0)
  const comisiones = Math.round(ventas * 0.035)
  const alertas = TIENDAS_ADMIN.filter((t) => t.estado !== "ACTIVA")
  return (
    <div className="space-y-6">
      <EncabezadoPagina titulo="Resumen de la plataforma" descripcion="Cómo va OTemu en los últimos 30 días." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-primary p-6 text-sobre-marca">
          <p className="flex items-center gap-2 text-[13px] font-bold"><Store aria-hidden="true" className="size-4" /> Ventas de todas las tiendas</p>
          <p className="mt-3 text-[30px] font-extrabold leading-none tracking-tight">{formatearDinero(ventas, "PEN")}</p>
        </div>
        <Kpi icono={Store} titulo="Tiendas activas" valor={`${activas} de ${TIENDAS_ADMIN.length}`} detalle="visibles en el mercado" />
        <Kpi icono={Users} titulo="Usuarios" valor={String(USUARIOS_ADMIN.length)} detalle={`${USUARIOS_ADMIN.filter((u) => u.perfil === "PROPIETARIO").length} son propietarios`} />
        <Kpi icono={ShieldCheck} titulo="Comisiones cobradas" valor={formatearDinero(comisiones, "PEN")} detalle="de todos los repartos" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3">
            <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Tiendas que necesitan atención</h2>
            <ul className="space-y-2.5">
              {alertas.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-3.5 py-2.5">
                  <span className="truncate text-[13.5px] font-bold text-foreground">{t.nombre}</span>
                  <Badge variant="estado" tono={TONO_TIENDA[t.estado].tono}>{TONO_TIENDA[t.estado].texto}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3">
            <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Actividad reciente</h2>
            <ul className="space-y-2.5">
              {AUDITORIA_ADMIN.slice(0, 4).map((e) => (
                <li key={e.id} className="text-[13px]">
                  <p className="font-semibold text-foreground">{e.detalle}</p>
                  <p className="text-muted-foreground">{e.usuario} · {formatearFecha(e.fecha)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Aviso />
    </div>
  )
}

/* ---------- Tiendas ---------- */
export function TiendasAdminView() {
  const confirmar = useConfirm()
  const [tiendas, setTiendas] = React.useState<TiendaAdmin[]>(TIENDAS_ADMIN)
  const [texto, setTexto] = React.useState("")
  const [estado, setEstado] = React.useState("")
  const lista = tiendas.filter((t) => (!estado || t.estado === estado) && (!texto || sinTildes(`${t.nombre} ${t.propietario} ${t.subdominio}`).includes(sinTildes(texto))))

  const alternar = async (t: TiendaAdmin) => {
    const suspender = t.estado === "ACTIVA"
    const ok = await confirmar({
      variant: suspender ? "destructive" : undefined,
      title: suspender ? `¿Suspender «${t.nombre}»?` : `¿Reactivar «${t.nombre}»?`,
      description: suspender ? "La tienda deja de verse en el mercado y no recibe pedidos nuevos." : "La tienda vuelve a verse en el mercado.",
      confirmText: suspender ? "Sí, suspender" : "Sí, reactivar",
    })
    if (!ok) return
    setTiendas((l) => l.map((x) => (x.id === t.id ? { ...x, estado: suspender ? "SUSPENDIDA" : "ACTIVA" } : x)))
    toast.add({ type: "success", title: suspender ? "Tienda suspendida" : "Tienda reactivada" })
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Tiendas" descripcion={`${tiendas.length} tiendas creadas en la plataforma.`} />
      <Card>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <ControlSegmentado
            aria-label="Estado de la tienda"
            valor={estado}
            onCambiar={setEstado}
            opciones={[{ valor: "", etiqueta: "Todas" }, { valor: "ACTIVA", etiqueta: "Activas" }, { valor: "SUSPENDIDA", etiqueta: "Suspendidas" }, { valor: "SUSCRIPCION_VENCIDA", etiqueta: "Vencidas" }]}
          />
          <div className="lg:w-80"><SearchInput value={texto} onValueChange={setTexto} placeholder="Buscar tienda o propietario" /></div>
        </CardContent>
      </Card>
      {lista.length === 0 ? (
        <Card><CardContent><EstadoVacio icono={Store} titulo="No hay tiendas con ese filtro" descripcion="Prueba con otro estado o con otra búsqueda." /></CardContent></Card>
      ) : (
        <Card className="py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Tienda</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ventas 30 días</TableHead>
                  <TableHead className="pr-6 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="pl-6">
                      <p className="text-[13.5px] font-bold text-foreground">{t.nombre}</p>
                      <p className="font-mono text-[12px] text-muted-foreground">{t.subdominio}</p>
                    </TableCell>
                    <TableCell className="text-[13px]">{t.propietario}</TableCell>
                    <TableCell className="text-[13px]">{t.plan}</TableCell>
                    <TableCell><Badge variant="estado" tono={TONO_TIENDA[t.estado].tono}>{TONO_TIENDA[t.estado].texto}</Badge></TableCell>
                    <TableCell className="text-right text-[13.5px] font-extrabold">{formatearDinero(t.ventas_30d, "PEN")}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button size="sm" variant={t.estado === "ACTIVA" ? "danger-outline" : "soft"} onClick={() => alternar(t)} leftIcon={t.estado === "ACTIVA" ? <Ban aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}>
                        {t.estado === "ACTIVA" ? "Suspender" : "Reactivar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
      <Aviso />
    </div>
  )
}

/* ---------- Usuarios ---------- */
export function UsuariosAdminView() {
  const confirmar = useConfirm()
  const [usuarios, setUsuarios] = React.useState<UsuarioAdmin[]>(USUARIOS_ADMIN)
  const [texto, setTexto] = React.useState("")
  const [perfil, setPerfil] = React.useState("")
  const lista = usuarios.filter((u) => (!perfil || u.perfil === perfil) && (!texto || sinTildes(`${u.nombre} ${u.correo}`).includes(sinTildes(texto))))

  const alternar = async (u: UsuarioAdmin) => {
    const bloquear = u.estado === "ACTIVO"
    const ok = await confirmar({
      variant: bloquear ? "destructive" : undefined,
      title: bloquear ? `¿Bloquear a ${u.nombre}?` : `¿Desbloquear a ${u.nombre}?`,
      description: bloquear ? "No podrá iniciar sesión hasta que se desbloquee. Sus sesiones abiertas se cerrarán." : "Podrá volver a iniciar sesión.",
      confirmText: bloquear ? "Sí, bloquear" : "Sí, desbloquear",
    })
    if (!ok) return
    setUsuarios((l) => l.map((x) => (x.id === u.id ? { ...x, estado: bloquear ? "BLOQUEADO" : "ACTIVO" } : x)))
    toast.add({ type: "success", title: bloquear ? "Usuario bloqueado" : "Usuario desbloqueado" })
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Usuarios" descripcion={`${usuarios.length} personas con cuenta. Todas pueden comprar; algunas además tienen tienda.`} />
      <Card>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <ControlSegmentado
            aria-label="Perfil"
            valor={perfil}
            onCambiar={setPerfil}
            opciones={[{ valor: "", etiqueta: "Todos" }, { valor: "COMPRADOR", etiqueta: "Compradores" }, { valor: "PROPIETARIO", etiqueta: "Propietarios" }, { valor: "ADMINISTRADOR", etiqueta: "Administradores" }]}
          />
          <div className="lg:w-80"><SearchInput value={texto} onValueChange={setTexto} placeholder="Buscar por nombre o correo" /></div>
        </CardContent>
      </Card>
      <Card className="py-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Persona</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Tiendas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Dos pasos</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead className="pr-6 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="pl-6">
                    <p className="text-[13.5px] font-bold text-foreground">{u.nombre}</p>
                    <p className="text-[12px] text-muted-foreground">{u.correo}</p>
                  </TableCell>
                  <TableCell><Badge variant="estado" tono={PERFIL[u.perfil].tono}>{PERFIL[u.perfil].texto}</Badge></TableCell>
                  <TableCell className="text-[13px]">{u.tiendas}</TableCell>
                  <TableCell><Badge variant="estado" tono={TONO_USUARIO[u.estado].tono}>{TONO_USUARIO[u.estado].texto}</Badge></TableCell>
                  <TableCell className="text-[13px]">{u.dos_pasos ? "Activos" : "No"}</TableCell>
                  <TableCell className="whitespace-nowrap text-[12.5px] text-muted-foreground">{formatearFecha(u.ultimo_acceso)}</TableCell>
                  <TableCell className="pr-6 text-right">
                    {u.estado !== "SIN_ACTIVAR" && u.perfil !== "ADMINISTRADOR" && (
                      <Button size="sm" variant={u.estado === "ACTIVO" ? "danger-outline" : "soft"} onClick={() => alternar(u)} leftIcon={u.estado === "ACTIVO" ? <Ban aria-hidden="true" /> : <UserCheck aria-hidden="true" />}>
                        {u.estado === "ACTIVO" ? "Bloquear" : "Desbloquear"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <Aviso />
    </div>
  )
}

/* ---------- Administradores ---------- */
export function AdministradoresAdminView() {
  const [lista, setLista] = React.useState<AdministradorAdmin[]>(ADMINISTRADORES_ADMIN)
  const [abierto, setAbierto] = React.useState(false)
  const [nombre, setNombre] = React.useState("")
  const [correo, setCorreo] = React.useState("")
  const [rol, setRol] = React.useState<AdministradorAdmin["rol"]>("Soporte")
  const [errores, setErrores] = React.useState<{ nombre?: string; correo?: string }>({})

  const crear = () => {
    const e: typeof errores = {}
    if (!nombre.trim()) e.nombre = "Escribe el nombre."
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) e.correo = "Escribe un correo válido."
    setErrores(e)
    if (Object.keys(e).length) return
    setLista((l) => [...l, { id: crypto.randomUUID(), nombre: nombre.trim(), correo: correo.trim(), rol, activo: true, creado: new Date().toISOString() }])
    toast.add({ type: "success", title: "Administrador creado", description: "Recibirá un correo para activar su cuenta." })
    setAbierto(false)
    setNombre("")
    setCorreo("")
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Administradores"
        descripcion="Quienes administran la plataforma y qué pueden hacer. Los propietarios de tiendas no ven estos permisos."
        acciones={<Button onClick={() => setAbierto(true)} leftIcon={<Plus aria-hidden="true" />}>Nuevo administrador</Button>}
      />
      <ul className="grid gap-4 md:grid-cols-2">
        {lista.map((a) => (
          <li key={a.id}>
            <Card className="h-full">
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-extrabold tracking-tight text-foreground">{a.nombre}</p>
                    <p className="truncate text-[12.5px] text-muted-foreground">{a.correo}</p>
                  </div>
                  <Badge variant="estado" tono={a.activo ? "marca" : "neutro"}>{a.activo ? "Activo" : "Desactivado"}</Badge>
                </div>
                <p className="text-[13px] font-bold text-foreground">{a.rol}</p>
                <ul className="space-y-1 text-[13px] text-muted-foreground">
                  {PERMISOS_POR_ROL[a.rol].map((p) => (
                    <li key={p} className="flex items-start gap-2"><ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-text" />{p}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <Aviso />

      <FormPanel
        open={abierto}
        onOpenChange={setAbierto}
        title="Nuevo administrador"
        footer={
          <>
            <Button type="button" variant="neutral" onClick={() => setAbierto(false)}>Cancelar</Button>
            <Button type="button" onClick={crear}>Crear administrador</Button>
          </>
        }
      >
        <div className="space-y-5">
          <FloatingInput label="Nombre y apellido" value={nombre} onChange={(e) => setNombre(e.target.value)} state={errores.nombre ? "error" : "default"} mensajeError={errores.nombre} />
          <FloatingInput label="Correo electrónico" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} state={errores.correo ? "error" : "default"} mensajeError={errores.correo} />
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-bold text-muted-foreground">Rol</span>
            <select value={rol} onChange={(e) => setRol(e.target.value as AdministradorAdmin["rol"])} className="h-11 w-full cursor-pointer rounded-xl border-[1.8px] border-input bg-transparent px-3 text-[13px] font-medium text-foreground outline-none focus-visible:border-primary focus-visible:ring-[3.5px] focus-visible:ring-primary/18">
              {(Object.keys(PERMISOS_POR_ROL) as AdministradorAdmin["rol"][]).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <ul className="space-y-1.5 rounded-xl bg-secondary p-4 text-[13px] text-muted-foreground">
            {PERMISOS_POR_ROL[rol].map((p) => (
              <li key={p} className="flex items-start gap-2"><ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-text" />{p}</li>
            ))}
          </ul>
        </div>
      </FormPanel>
    </div>
  )
}

/* ---------- Auditoría ---------- */
const TONO_ACCION: Record<string, Tono> = { CREAR: "marca", EDITAR: "info", ELIMINAR: "peligro", SUSPENDER: "naranja", INICIAR_SESION: "neutro", BLOQUEO: "peligro" }

export function AuditoriaAdminView() {
  const [texto, setTexto] = React.useState("")
  const [accion, setAccion] = React.useState("")
  const lista = AUDITORIA_ADMIN.filter((e) => (!accion || e.accion === accion) && (!texto || sinTildes(`${e.usuario} ${e.detalle} ${e.entidad}`).includes(sinTildes(texto))))
  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Auditoría" descripcion="Quién hizo qué y cuándo. Solo lectura." />
      <Card>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <ControlSegmentado
            aria-label="Acción"
            valor={accion}
            onCambiar={setAccion}
            opciones={[{ valor: "", etiqueta: "Todas" }, { valor: "CREAR", etiqueta: "Altas" }, { valor: "EDITAR", etiqueta: "Cambios" }, { valor: "ELIMINAR", etiqueta: "Bajas" }, { valor: "SUSPENDER", etiqueta: "Suspensiones" }]}
          />
          <div className="lg:w-80"><SearchInput value={texto} onValueChange={setTexto} placeholder="Buscar usuario o detalle" /></div>
        </CardContent>
      </Card>
      <Card className="py-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Fecha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead className="pr-6">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="whitespace-nowrap pl-6 text-[12.5px] text-muted-foreground">{formatearFecha(e.fecha)}</TableCell>
                  <TableCell className="text-[13px] font-semibold">{e.usuario}</TableCell>
                  <TableCell><Badge variant="estado" tono={TONO_ACCION[e.accion]}>{e.accion.replace("_", " ").toLowerCase()}</Badge></TableCell>
                  <TableCell className="text-[13px]">{e.detalle}</TableCell>
                  <TableCell className="pr-6 font-mono text-[12px] text-muted-foreground">{e.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <Aviso />
    </div>
  )
}

/* ---------- Seguridad ---------- */
export function SeguridadAdminView() {
  const conDosPasos = USUARIOS_ADMIN.filter((u) => u.dos_pasos).length
  const bloqueados = USUARIOS_ADMIN.filter((u) => u.estado === "BLOQUEADO").length
  const eventos = AUDITORIA_ADMIN.filter((e) => e.accion === "BLOQUEO" || e.accion === "INICIAR_SESION")
  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Seguridad" descripcion="Señales de acceso a la plataforma en las últimas 24 horas." />
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi icono={ShieldAlert} titulo="Intentos fallidos de acceso" valor="23" detalle="en 6 cuentas distintas" />
        <Kpi icono={Ban} titulo="Cuentas bloqueadas ahora" valor={String(bloqueados)} detalle="se desbloquean solas a los 15 minutos" />
        <Kpi icono={ShieldCheck} titulo="Con verificación en dos pasos" valor={`${Math.round((conDosPasos / USUARIOS_ADMIN.length) * 100)} %`} detalle={`${conDosPasos} de ${USUARIOS_ADMIN.length} usuarios`} />
      </div>
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Eventos de acceso recientes</h2>
          <ul className="divide-y divide-border/60">
            {eventos.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-[13px]">
                <div>
                  <p className="font-semibold text-foreground">{e.detalle}</p>
                  <p className="text-muted-foreground">{e.usuario} · {e.ip}</p>
                </div>
                <span className="text-[12.5px] text-muted-foreground">{formatearFecha(e.fecha)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Aviso />
    </div>
  )
}
