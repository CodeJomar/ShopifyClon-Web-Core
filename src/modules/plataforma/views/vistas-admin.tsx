"use client"

import * as React from "react"
import { Ban, CheckCircle2, LogOut, Plus, ShieldAlert, ShieldCheck, ShoppingBag, Store, UserCheck, Users } from "lucide-react"
import { Badge, type TonoInsignia } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { toast } from "@/shared/components/ui/toast"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { ControlSegmentado } from "@/shared/components/composed/control-segmentado"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { EstadoError } from "@/shared/components/composed/estado-error"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { SearchInput } from "@/shared/components/composed/search-input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { formatearDinero } from "@/shared/utils/dinero"
import { formatearFecha } from "@/shared/utils/fechas"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { EventoAuditoriaDto, TiendaAdminDto, UsuarioAdminDto } from "@/dtos/administracion"
import { reactivarTiendaAction, suspenderTiendaAction } from "../actions/plataforma.actions"
import { useListaAdmin } from "../hooks/use-lista-admin"
import { usePanel } from "@/modules/panel/hooks/use-panel"

type Tono = TonoInsignia

const TAMANO = 20
const ESTADO_SUSCRIPCION: Record<string, string> = { ACTIVA: "Activa", EN_PRUEBA: "En prueba", VENCIDA: "Vencida", CANCELADA: "Cancelada", SUSPENDIDA: "Suspendida" }

/** Texto de búsqueda con espera corta para no consultar la API en cada tecla. */
function useTextoConEspera(): [string, string, (t: string) => void] {
  const [texto, setTexto] = React.useState("")
  const [aplicado, setAplicado] = React.useState("")
  React.useEffect(() => {
    const t = setTimeout(() => setAplicado(texto.trim()), 350)
    return () => clearTimeout(t)
  }, [texto])
  return [texto, aplicado, setTexto]
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

function CargandoTabla() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Cargando">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-14 rounded-xl" />
      ))}
    </div>
  )
}

/** Panel lateral que pide el motivo de una acción de administración (queda en la auditoría). */
function MotivoPanel({ abierto, titulo, descripcion, confirmar, alCerrar, alConfirmar, peligro }: { abierto: boolean; titulo: string; descripcion: string; confirmar: string; alCerrar: () => void; alConfirmar: (motivo: string) => Promise<string | null>; peligro?: boolean }) {
  const [motivo, setMotivo] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [enviando, setEnviando] = React.useState(false)
  React.useEffect(() => {
    if (abierto) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia el formulario al abrirlo
      setMotivo("")
      setError(null)
    }
  }, [abierto])
  const enviar = async () => {
    if (motivo.trim().length < 3) return setError("Cuenta brevemente el motivo.")
    setEnviando(true)
    const mensaje = await alConfirmar(motivo.trim())
    setEnviando(false)
    if (mensaje) setError(mensaje)
  }
  return (
    <FormPanel
      open={abierto}
      onOpenChange={(o) => !o && alCerrar()}
      title={titulo}
      description={descripcion}
      footer={
        <>
          <Button type="button" variant="neutral" onClick={alCerrar}>Cancelar</Button>
          <Button type="button" variant={peligro ? "danger" : undefined} loading={enviando} onClick={enviar}>{confirmar}</Button>
        </>
      }
    >
      <FloatingTextarea label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} state={error ? "error" : "default"} />
      {error && <p role="alert" className="mt-1.5 text-[12px] font-bold text-destructive-text">{error}</p>}
    </FormPanel>
  )
}

/* ---------- Resumen ---------- */
export function ResumenAdminView() {
  const tiendas = useListaAdmin<TiendaAdminDto>("/plataforma/tiendas", {})
  const suspendidas = useListaAdmin<TiendaAdminDto>("/plataforma/tiendas", { estado: "INACTIVA" })
  const usuarios = useListaAdmin<UsuarioAdminDto>("/plataforma/usuarios", {})
  const pedidos = useListaAdmin<{ id: string }>("/plataforma/pedidos", {})
  const eventos = useListaAdmin<EventoAuditoriaDto>("/plataforma/auditoria", {})
  // Un rol parcial (soporte, finanzas) no ve todo: solo se muestra error si ninguna consulta respondió.
  const error = tiendas.error && usuarios.error && pedidos.error && eventos.error ? tiendas.error : null
  return (
    <div className="space-y-6">
      <EncabezadoPagina titulo="Resumen de la plataforma" descripcion="Cómo va OTemu: tiendas, personas, pedidos y lo último que pasó." />
      {error ? (
        <EstadoError mensaje={error.message} onReintentar={() => { tiendas.recargar(); usuarios.recargar() }} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-primary p-6 text-sobre-marca">
              <p className="flex items-center gap-2 text-[13px] font-bold"><Store aria-hidden="true" className="size-4" /> Tiendas en la plataforma</p>
              <p className="mt-3 text-[30px] font-extrabold leading-none tracking-tight">{tiendas.datos?.total ?? "…"}</p>
            </div>
            <Kpi icono={Ban} titulo="Tiendas suspendidas" valor={String(suspendidas.datos?.total ?? "…")} detalle="no se ven en el mercado" />
            <Kpi icono={Users} titulo="Usuarios" valor={String(usuarios.datos?.total ?? "…")} detalle="todas las personas con cuenta" />
            <Kpi icono={ShoppingBag} titulo="Pedidos" valor={String(pedidos.datos?.total ?? "…")} detalle="de todas las tiendas" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="space-y-3">
                <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Tiendas que necesitan atención</h2>
                {suspendidas.datos && suspendidas.datos.datos.length === 0 ? (
                  <p className="text-[13.5px] font-medium text-muted-foreground">Ninguna tienda suspendida.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {(suspendidas.datos?.datos ?? []).slice(0, 6).map((t) => (
                      <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-3.5 py-2.5">
                        <span className="truncate text-[13.5px] font-bold text-foreground">{t.nombre}</span>
                        <Badge variant="estado" tono="peligro">Suspendida</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3">
                <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Actividad reciente</h2>
                {(eventos.datos?.datos ?? []).length === 0 ? (
                  <p className="text-[13.5px] font-medium text-muted-foreground">Todavía no hay actividad registrada.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {(eventos.datos?.datos ?? []).slice(0, 5).map((e) => (
                      <li key={e.id} className="text-[13px]">
                        <p className="font-semibold text-foreground">{textoEvento(e)}</p>
                        <p className="text-muted-foreground">{formatearFecha(e.fecha)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

const textoAccion = (accion: string) => accion.replace(/^SEGURIDAD_/, "").replaceAll("_", " ").toLowerCase()
/** Resumen en una línea del `detalle` libre de un evento: valores simples tal cual; objetos anidados como `clave: …`. */
function resumenDetalle(e: EventoAuditoriaDto): string {
  const partes: string[] = []
  for (const [clave, valor] of Object.entries(e.detalle ?? {})) {
    if (valor === null || valor === undefined) continue
    partes.push(typeof valor === "object" ? `${clave}: ${JSON.stringify(valor)}` : `${clave}: ${String(valor)}`)
  }
  return [e.motivo, partes.join(" · ")].filter(Boolean).join(" — ")
}
const textoEvento = (e: EventoAuditoriaDto) => `${textoAccion(e.accion)} · ${e.entidad.toLowerCase()}${resumenDetalle(e) ? `: ${resumenDetalle(e)}` : ""}`

/* ---------- Tiendas ---------- */
export function TiendasAdminView() {
  const [estado, setEstado] = React.useState("")
  const [texto, q, setTexto] = useTextoConEspera()
  const { datos, error, pagina, setPagina, recargar, cargando } = useListaAdmin<TiendaAdminDto>("/plataforma/tiendas", { q, estado })
  const [objetivo, setObjetivo] = React.useState<TiendaAdminDto | null>(null)
  const { permisosPlataforma } = usePanel()
  const puedeSuspender = permisosPlataforma.includes("PLATAFORMA_SUSPENDER_TIENDAS")

  const confirmar = async (motivo: string) => {
    if (!objetivo) return null
    const suspender = objetivo.esta_activa
    const res = suspender ? await suspenderTiendaAction(objetivo.id, { motivo }) : await reactivarTiendaAction(objetivo.id, { motivo })
    if (!res.ok) return res.error.message
    toast.add({ type: "success", title: suspender ? "Tienda suspendida" : "Tienda reactivada" })
    setObjetivo(null)
    recargar()
    return null
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Tiendas" descripcion={datos ? `${datos.total} tiendas en la plataforma.` : "Las tiendas de la plataforma."} />
      <Card>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <ControlSegmentado aria-label="Estado de la tienda" valor={estado} onCambiar={setEstado} opciones={[{ valor: "", etiqueta: "Todas" }, { valor: "ACTIVA", etiqueta: "Activas" }, { valor: "INACTIVA", etiqueta: "Suspendidas" }]} />
          <div className="lg:w-80"><SearchInput value={texto} onValueChange={setTexto} placeholder="Buscar tienda o propietario" /></div>
        </CardContent>
      </Card>
      {error ? (
        <EstadoError mensaje={error.message} onReintentar={recargar} />
      ) : cargando ? (
        <CargandoTabla />
      ) : datos && datos.datos.length === 0 ? (
        <Card><CardContent><EstadoVacio icono={Store} titulo="No hay tiendas con ese filtro" descripcion="Prueba con otro estado o con otra búsqueda." /></CardContent></Card>
      ) : (
        datos && (
          <Card className="py-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Tienda</TableHead>
                    <TableHead>Propietario</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ventas</TableHead>
                    <TableHead className="pr-6 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datos.datos.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="pl-6">
                        <p className="text-[13.5px] font-bold text-foreground">{t.nombre}</p>
                        <p className="font-mono text-[12px] text-muted-foreground">{t.subdominio}</p>
                      </TableCell>
                      <TableCell className="text-[13px]">
                        <p className="font-semibold">{t.duenio.nombre}</p>
                        <p className="text-[12px] text-muted-foreground">{t.duenio.correo}</p>
                      </TableCell>
                      <TableCell className="text-[13px]">
                        {t.codigo_plan}
                        <p className="text-[12px] text-muted-foreground">{ESTADO_SUSCRIPCION[t.estado_suscripcion] ?? t.estado_suscripcion}</p>
                      </TableCell>
                      <TableCell><Badge variant="estado" tono={t.esta_activa ? "marca" : "peligro"}>{t.esta_activa ? "Activa" : "Suspendida"}</Badge></TableCell>
                      <TableCell className="text-right text-[13.5px] font-extrabold">
                        {formatearDinero(t.ventas_historicas, t.moneda)}
                        <p className="text-[12px] font-medium text-muted-foreground">{t.ordenes_pagadas} órdenes</p>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {puedeSuspender && <Button size="sm" variant={t.esta_activa ? "danger-outline" : "soft"} onClick={() => setObjetivo(t)} leftIcon={t.esta_activa ? <Ban aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}>
                          {t.esta_activa ? "Suspender" : "Reactivar"}
                        </Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="px-6 pb-4"><BarraPaginacion pagina={pagina} totalPaginas={datos.total_paginas} total={datos.total} porPagina={TAMANO} etiqueta="tiendas" onCambiar={setPagina} /></div>
          </Card>
        )
      )}
      <MotivoPanel
        abierto={objetivo !== null}
        titulo={objetivo?.esta_activa ? `Suspender «${objetivo?.nombre}»` : `Reactivar «${objetivo?.nombre}»`}
        descripcion={objetivo?.esta_activa ? "La tienda deja de verse en el mercado y no recibe pedidos nuevos." : "La tienda vuelve a verse en el mercado."}
        confirmar={objetivo?.esta_activa ? "Suspender tienda" : "Reactivar tienda"}
        peligro={objetivo?.esta_activa}
        alCerrar={() => setObjetivo(null)}
        alConfirmar={confirmar}
      />
    </div>
  )
}

/* ---------- Usuarios ---------- */
type AccionUsuario = { tipo: "bloquear" | "desbloquear" | "sesiones"; usuario: UsuarioAdminDto }

const perfilDe = (u: UsuarioAdminDto): { texto: string; tono: Tono } =>
  u.es_administrador_plataforma ? { texto: "Administrador", tono: "morado" } : u.tiendas_propias > 0 ? { texto: "Propietario", tono: "info" } : { texto: "Comprador", tono: "neutro" }

export function UsuariosAdminView() {
  const [estado, setEstado] = React.useState("")
  const [texto, q, setTexto] = useTextoConEspera()
  const { datos, error, pagina, setPagina, recargar, cargando } = useListaAdmin<UsuarioAdminDto>("/plataforma/usuarios", { q, estado })
  const [accion, setAccion] = React.useState<AccionUsuario | null>(null)
  const { permisosPlataforma } = usePanel()
  const puedeSeguridad = permisosPlataforma.includes("PLATAFORMA_SEGURIDAD")

  const ejecutar = async (motivo?: string) => {
    if (!accion) return null
    const base = `/plataforma/usuarios/${accion.usuario.id}`
    const url = accion.tipo === "bloquear" ? `${base}/bloquear` : accion.tipo === "desbloquear" ? `${base}/desbloquear` : `${base}/cerrar-sesiones`
    const res = await resultado(peticionApi<void>({ method: "POST", url, data: accion.tipo === "bloquear" ? { motivo } : undefined }))
    if (!res.ok) return res.error.message
    toast.add({ type: "success", title: accion.tipo === "bloquear" ? "Usuario bloqueado" : accion.tipo === "desbloquear" ? "Usuario desbloqueado" : "Sesiones cerradas" })
    setAccion(null)
    recargar()
    return null
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Usuarios" descripcion={datos ? `${datos.total} personas con cuenta. Todas pueden comprar; algunas además tienen tienda.` : "Las personas con cuenta."} />
      <Card>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <ControlSegmentado aria-label="Estado de la cuenta" valor={estado} onCambiar={setEstado} opciones={[{ valor: "", etiqueta: "Todos" }, { valor: "ACTIVO", etiqueta: "Activos" }, { valor: "BLOQUEADO", etiqueta: "Bloqueados" }, { valor: "INACTIVO", etiqueta: "Sin activar" }]} />
          <div className="lg:w-80"><SearchInput value={texto} onValueChange={setTexto} placeholder="Buscar por nombre o correo" /></div>
        </CardContent>
      </Card>
      {error ? (
        <EstadoError mensaje={error.message} onReintentar={recargar} />
      ) : cargando ? (
        <CargandoTabla />
      ) : datos && datos.datos.length === 0 ? (
        <Card><CardContent><EstadoVacio icono={Users} titulo="No hay personas con ese filtro" descripcion="Prueba con otro estado o con otra búsqueda." /></CardContent></Card>
      ) : (
        datos && (
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
                    <TableHead>Desde</TableHead>
                    <TableHead className="pr-6 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datos.datos.map((u) => {
                    const perfil = perfilDe(u)
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="pl-6">
                          <p className="text-[13.5px] font-bold text-foreground">{u.nombres} {u.apellidos}</p>
                          <p className="text-[12px] text-muted-foreground">{u.correo}</p>
                        </TableCell>
                        <TableCell><Badge variant="estado" tono={perfil.tono}>{perfil.texto}</Badge></TableCell>
                        <TableCell className="text-[13px]">{u.tiendas_propias}</TableCell>
                        <TableCell>
                          {u.bloqueado ? <Badge variant="estado" tono="peligro">Bloqueado</Badge> : u.esta_activo ? <Badge variant="estado" tono="marca">Activo</Badge> : <Badge variant="estado" tono="neutro">Sin activar</Badge>}
                        </TableCell>
                        <TableCell className="text-[13px]">{u.dos_pasos_activo ? "Activos" : "No"}</TableCell>
                        <TableCell className="whitespace-nowrap text-[12.5px] text-muted-foreground">{formatearFecha(u.fecha_creacion)}</TableCell>
                        <TableCell className="pr-6 text-right">
                          {puedeSeguridad && u.esta_activo && !u.es_administrador_plataforma && (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setAccion({ tipo: "sesiones", usuario: u })} leftIcon={<LogOut aria-hidden="true" />}>Cerrar sesiones</Button>
                              {u.bloqueado ? (
                                <Button size="sm" variant="soft" onClick={() => setAccion({ tipo: "desbloquear", usuario: u })} leftIcon={<UserCheck aria-hidden="true" />}>Desbloquear</Button>
                              ) : (
                                <Button size="sm" variant="danger-outline" onClick={() => setAccion({ tipo: "bloquear", usuario: u })} leftIcon={<Ban aria-hidden="true" />}>Bloquear</Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="px-6 pb-4"><BarraPaginacion pagina={pagina} totalPaginas={datos.total_paginas} total={datos.total} porPagina={TAMANO} etiqueta="personas" onCambiar={setPagina} /></div>
          </Card>
        )
      )}
      <MotivoPanel
        abierto={accion?.tipo === "bloquear"}
        titulo={`Bloquear a ${accion?.usuario.nombres ?? ""}`}
        descripcion="No podrá iniciar sesión hasta que lo desbloquees y sus sesiones abiertas se cerrarán. El bloqueo no vence solo."
        confirmar="Bloquear cuenta"
        peligro
        alCerrar={() => setAccion(null)}
        alConfirmar={ejecutar}
      />
      <ConfirmarAccion
        abierto={accion?.tipo === "desbloquear" || accion?.tipo === "sesiones"}
        titulo={accion?.tipo === "sesiones" ? `Cerrar las sesiones de ${accion.usuario.nombres}` : `Desbloquear a ${accion?.usuario.nombres ?? ""}`}
        descripcion={accion?.tipo === "sesiones" ? "Tendrá que volver a iniciar sesión en todos sus dispositivos." : "Podrá volver a iniciar sesión."}
        confirmar={accion?.tipo === "sesiones" ? "Cerrar sesiones" : "Desbloquear"}
        alCerrar={() => setAccion(null)}
        alConfirmar={() => ejecutar()}
      />
    </div>
  )
}

function ConfirmarAccion({ abierto, titulo, descripcion, confirmar, alCerrar, alConfirmar }: { abierto: boolean; titulo: string; descripcion: string; confirmar: string; alCerrar: () => void; alConfirmar: () => Promise<string | null> }) {
  const [enviando, setEnviando] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const enviar = async () => {
    setEnviando(true)
    const mensaje = await alConfirmar()
    setEnviando(false)
    setError(mensaje)
  }
  return (
    <FormPanel
      open={abierto}
      onOpenChange={(o) => !o && alCerrar()}
      title={titulo}
      description={descripcion}
      footer={
        <>
          <Button type="button" variant="neutral" onClick={alCerrar}>Cancelar</Button>
          <Button type="button" loading={enviando} onClick={enviar}>{confirmar}</Button>
        </>
      }
    >
      {error && <p role="alert" className="text-[13px] font-bold text-destructive-text">{error}</p>}
    </FormPanel>
  )
}

/* ---------- Auditoría ---------- */
const TONO_CATEGORIA: Record<string, Tono> = { SEGURIDAD: "naranja", NEGOCIO: "info" }

export function AuditoriaAdminView() {
  const [categoria, setCategoria] = React.useState("")
  const { datos, error, pagina, setPagina, recargar, cargando } = useListaAdmin<EventoAuditoriaDto>("/plataforma/auditoria", { categoria })
  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Auditoría" descripcion="Quién hizo qué y cuándo. Solo lectura." />
      <Card>
        <CardContent>
          <ControlSegmentado aria-label="Categoría" valor={categoria} onCambiar={setCategoria} opciones={[{ valor: "", etiqueta: "Todo" }, { valor: "SEGURIDAD", etiqueta: "Seguridad" }, { valor: "NEGOCIO", etiqueta: "Negocio" }]} />
        </CardContent>
      </Card>
      {error ? (
        <EstadoError mensaje={error.message} onReintentar={recargar} />
      ) : cargando ? (
        <CargandoTabla />
      ) : datos && datos.datos.length === 0 ? (
        <Card><CardContent><EstadoVacio icono={ShieldCheck} titulo="Sin eventos todavía" descripcion="Aquí aparecerán los cambios y los eventos de seguridad." /></CardContent></Card>
      ) : (
        datos && (
          <Card className="py-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Fecha</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead className="pr-6">Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datos.datos.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="whitespace-nowrap pl-6 text-[12.5px] text-muted-foreground">{formatearFecha(e.fecha)}</TableCell>
                      <TableCell><Badge variant="estado" tono={TONO_CATEGORIA[e.categoria] ?? "neutro"}>{e.categoria.toLowerCase()}</Badge></TableCell>
                      <TableCell className="text-[13px] font-semibold">{textoAccion(e.accion)}</TableCell>
                      <TableCell className="text-[13px]">{e.entidad}</TableCell>
                      <TableCell className="pr-6 text-[13px] text-muted-foreground">{resumenDetalle(e) || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="px-6 pb-4"><BarraPaginacion pagina={pagina} totalPaginas={datos.total_paginas} total={datos.total} porPagina={TAMANO} etiqueta="eventos" onCambiar={setPagina} /></div>
          </Card>
        )
      )}
    </div>
  )
}

/* ---------- Seguridad ---------- */
export function SeguridadAdminView() {
  const bloqueados = useListaAdmin<UsuarioAdminDto>("/plataforma/usuarios", { estado: "BLOQUEADO" })
  const usuarios = useListaAdmin<UsuarioAdminDto>("/plataforma/usuarios", {})
  const eventos = useListaAdmin<EventoAuditoriaDto>("/plataforma/auditoria", { categoria: "SEGURIDAD" })
  const error = eventos.error ?? usuarios.error
  return (
    <div className="space-y-5">
      <EncabezadoPagina titulo="Seguridad" descripcion="Cuentas bloqueadas y eventos de seguridad registrados en la plataforma." />
      {error ? (
        <EstadoError mensaje={error.message} onReintentar={() => { eventos.recargar(); usuarios.recargar() }} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Kpi icono={Ban} titulo="Cuentas bloqueadas ahora" valor={String(bloqueados.datos?.total ?? "…")} detalle="por intentos fallidos o por un administrador" />
            <Kpi icono={ShieldAlert} titulo="Eventos de seguridad" valor={String(eventos.datos?.total ?? "…")} detalle="bloqueos, cierres de sesión y cambios de clave" />
            <Kpi icono={Users} titulo="Usuarios" valor={String(usuarios.datos?.total ?? "…")} detalle="personas con cuenta" />
          </div>
          <Card>
            <CardContent className="space-y-3">
              <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Eventos recientes</h2>
              {eventos.datos && eventos.datos.datos.length === 0 ? (
                <p className="text-[13.5px] font-medium text-muted-foreground">Todavía no hay eventos de seguridad.</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {(eventos.datos?.datos ?? []).slice(0, 10).map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-[13px]">
                      <div>
                        <p className="font-semibold text-foreground">{textoAccion(e.accion)}</p>
                        <p className="text-muted-foreground">{resumenDetalle(e) || e.entidad}</p>
                      </div>
                      <span className="text-[12.5px] text-muted-foreground">{formatearFecha(e.fecha)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
