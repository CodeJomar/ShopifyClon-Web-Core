"use client"

import * as React from "react"
import { Pencil, Plus, ShieldCheck, Trash2, UserCog } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { toast } from "@/shared/components/ui/toast"
import { ControlSegmentado } from "@/shared/components/composed/control-segmentado"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { EstadoError } from "@/shared/components/composed/estado-error"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { SearchInput } from "@/shared/components/composed/search-input"
import { useConfirm } from "@/shared/providers/confirm-provider"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { ErrorApi } from "@/lib/api/error-api"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type { UsuarioAdminDto } from "@/dtos/administracion"
import { usePanel } from "@/modules/panel/hooks/use-panel"

interface PermisoDto {
  codigo: string
  descripcion: string
}
interface RolDto {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  es_sistema: boolean
  permisos: string[]
  administradores: number
}
interface AdministradorDto {
  usuario_id: string
  correo: string
  nombre: string
  es_superadministrador: boolean
  rol?: { id: string; codigo: string; nombre: string } | null
  permisos: string[]
}

const llamar = <T,>(c: Parameters<typeof peticionApi<T>>[0]) => resultado(peticionApi<T>(c))

/** Datos de la pantalla: permisos, roles y administradores (B9 etapa 1). Todo exige el permiso PLATAFORMA_ADMINISTRADORES. */
function useAdministracion() {
  const [permisos, setPermisos] = React.useState<PermisoDto[] | null>(null)
  const [roles, setRoles] = React.useState<RolDto[] | null>(null)
  const [admins, setAdmins] = React.useState<AdministradorDto[] | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    let cancelado = false
    void Promise.all([
      llamar<PermisoDto[]>({ method: "GET", url: "/plataforma/permisos" }),
      llamar<RolDto[]>({ method: "GET", url: "/plataforma/roles" }),
      llamar<AdministradorDto[]>({ method: "GET", url: "/plataforma/administradores" }),
    ]).then(([p, r, a]) => {
      if (cancelado) return
      if (p.ok && r.ok && a.ok) {
        setPermisos(p.datos)
        setRoles(r.datos)
        setAdmins(a.datos)
        setError(null)
      } else setError((!p.ok && p.error) || (!r.ok && r.error) || (!a.ok && a.error) || null)
    })
    return () => {
      cancelado = true
    }
  }, [version])

  return { permisos, roles, admins, error, recargar: () => setVersion((v) => v + 1) }
}

/** Texto legible de un permiso a partir de su descripción; si falta, el código. */
const etiquetaPermiso = (permisos: PermisoDto[] | null, codigo: string) => permisos?.find((p) => p.codigo === codigo)?.descripcion ?? codigo

export function AdministradoresAdminView() {
  const { permisos, roles, admins, error, recargar } = useAdministracion()
  const [vista, setVista] = React.useState<"administradores" | "roles">("administradores")
  const cargando = !error && (!permisos || !roles || !admins)

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Administradores"
        descripcion="Quién administra la plataforma y qué puede hacer cada rol. Los propietarios de tiendas no ven estos permisos."
      />
      <ControlSegmentado
        aria-label="Vista"
        valor={vista}
        onCambiar={setVista}
        opciones={[
          { valor: "administradores", etiqueta: "Administradores" },
          { valor: "roles", etiqueta: "Roles y permisos" },
        ]}
      />
      {error ? (
        <EstadoError mensaje={error.message} onReintentar={recargar} />
      ) : cargando ? (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Cargando">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
      ) : vista === "administradores" ? (
        <ListaAdministradores permisos={permisos!} roles={roles!} admins={admins!} recargar={recargar} />
      ) : (
        <ListaRoles permisos={permisos!} roles={roles!} recargar={recargar} />
      )}
    </div>
  )
}

/* ---------- Administradores ---------- */
function ListaAdministradores({ permisos, roles, admins, recargar }: { permisos: PermisoDto[]; roles: RolDto[]; admins: AdministradorDto[]; recargar: () => void }) {
  const confirmar = useConfirm()
  const [alta, setAlta] = React.useState(false)
  const [editando, setEditando] = React.useState<AdministradorDto | null>(null)
  // Nadie modifica su propia cuenta de administrador (la API responde ADM-003): en la propia tarjeta no se ofrecen acciones.
  const [miId, setMiId] = React.useState<string | null>(null)
  React.useEffect(() => {
    void llamar<{ id: string }>({ method: "GET", url: "/cuenta/perfil" }).then((res) => {
      if (res.ok) setMiId(res.datos.id)
    })
  }, [])

  const quitar = async (a: AdministradorDto) => {
    const ok = await confirmar({
      variant: "destructive",
      title: `¿Quitar a ${a.nombre} como administrador?`,
      description: "Seguirá teniendo su cuenta, pero ya no podrá entrar a la administración de la plataforma.",
      confirmText: "Sí, quitar",
    })
    if (!ok) return
    const res = await llamar<void>({ method: "DELETE", url: `/plataforma/administradores/${a.usuario_id}` })
    if (!res.ok) return void toast.add({ type: "error", title: "No se pudo quitar", description: res.error.message })
    toast.add({ type: "success", title: "Administrador quitado" })
    recargar()
  }

  return (
    <>
      <div data-tour="acciones" className="flex justify-end">
        <Button onClick={() => setAlta(true)} leftIcon={<Plus aria-hidden="true" />}>Nuevo administrador</Button>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {admins.map((a) => (
          <li key={a.usuario_id}>
            <Card className="h-full">
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-extrabold tracking-tight text-foreground">{a.nombre}</p>
                    <p className="truncate text-[12.5px] text-muted-foreground">{a.correo}</p>
                  </div>
                  <Badge variant="estado" tono={a.es_superadministrador ? "morado" : "marca"}>{a.es_superadministrador ? "Superadministrador" : (a.rol?.nombre ?? "Sin rol")}</Badge>
                </div>
                <ul className="space-y-1 text-[13px] text-muted-foreground">
                  {a.permisos.map((p) => (
                    <li key={p} className="flex items-start gap-2"><ShieldCheck aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-brand-text" />{etiquetaPermiso(permisos, p)}</li>
                  ))}
                </ul>
                {a.usuario_id === miId ? (
                  <p className="pt-1 text-[12.5px] font-semibold text-muted-foreground">Esta es tu cuenta: nadie cambia ni quita su propia administración. Otro administrador puede hacerlo.</p>
                ) : !a.es_superadministrador && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="soft" onClick={() => setEditando(a)} leftIcon={<Pencil aria-hidden="true" />}>Cambiar rol</Button>
                    <Button size="sm" variant="danger-outline" onClick={() => quitar(a)} leftIcon={<Trash2 aria-hidden="true" />}>Quitar</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <PanelAlta abierto={alta} roles={roles} alCerrar={() => setAlta(false)} alGuardar={() => { setAlta(false); recargar() }} />
      <PanelCambiarRol administrador={editando} roles={roles} alCerrar={() => setEditando(null)} alGuardar={() => { setEditando(null); recargar() }} />
    </>
  )
}

function SelectorRol({ roles, valor, onCambiar }: { roles: RolDto[]; valor: string; onCambiar: (id: string) => void }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-[12px] font-bold text-muted-foreground">Rol</legend>
      {roles.map((r) => (
        <label key={r.id} className={"flex cursor-pointer items-start gap-3 rounded-xl border-[1.8px] p-3.5 transition-colors " + (valor === r.id ? "border-primary bg-primary/8" : "border-input hover:border-border-hover")}>
          <input type="radio" name="rol" value={r.id} checked={valor === r.id} onChange={() => onCambiar(r.id)} className="mt-1 accent-[var(--primary)]" />
          <span className="min-w-0">
            <span className="block text-[14px] font-bold text-foreground">{r.nombre}</span>
            <span className="block text-[12.5px] text-muted-foreground">{r.descripcion ?? `${r.permisos.length} permisos`}</span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}

function PanelAlta({ abierto, roles, alCerrar, alGuardar }: { abierto: boolean; roles: RolDto[]; alCerrar: () => void; alGuardar: () => void }) {
  const [texto, setTexto] = React.useState("")
  const [aplicado, setAplicado] = React.useState("")
  const [candidatos, setCandidatos] = React.useState<UsuarioAdminDto[]>([])
  const [elegido, setElegido] = React.useState<UsuarioAdminDto | null>(null)
  const [rolId, setRolId] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [enviando, setEnviando] = React.useState(false)

  React.useEffect(() => {
    if (!abierto) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia el formulario al abrirlo
    setTexto("")
    setAplicado("")
    setCandidatos([])
    setElegido(null)
    setRolId(roles.find((r) => !r.es_sistema || r.codigo !== "ADMIN_PLATAFORMA")?.id ?? roles[0]?.id ?? "")
    setError(null)
  }, [abierto, roles])

  React.useEffect(() => {
    const t = setTimeout(() => setAplicado(texto.trim()), 350)
    return () => clearTimeout(t)
  }, [texto])

  React.useEffect(() => {
    if (!abierto || aplicado.length < 3) return
    let cancelado = false
    void llamar<Paginado<UsuarioAdminDto>>({ method: "GET", url: "/plataforma/usuarios", params: { q: aplicado, estado: "ACTIVO", pagina: 0 } }).then((res) => {
      if (!cancelado && res.ok) setCandidatos(res.datos.datos.filter((u) => !u.es_administrador_plataforma))
    })
    return () => {
      cancelado = true
    }
  }, [abierto, aplicado])

  const guardar = async () => {
    if (!elegido) return setError("Busca y elige a la persona.")
    if (!rolId) return setError("Elige un rol.")
    setEnviando(true)
    const res = await llamar<AdministradorDto>({ method: "POST", url: "/plataforma/administradores", data: { usuario_id: elegido.id, rol_id: rolId } })
    setEnviando(false)
    if (!res.ok) return setError(res.error.message)
    toast.add({ type: "success", title: "Administrador agregado", description: elegido.correo })
    alGuardar()
  }

  return (
    <FormPanel
      open={abierto}
      onOpenChange={(o) => !o && alCerrar()}
      title="Nuevo administrador"
      description="Elige a una persona que ya tenga cuenta en OTemu y el rol que tendrá. Sus permisos rigen de inmediato."
      footer={
        <>
          <Button type="button" variant="neutral" onClick={alCerrar}>Cancelar</Button>
          <Button type="button" loading={enviando} onClick={guardar}>Agregar administrador</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <SearchInput value={texto} onValueChange={(t) => { setTexto(t); setElegido(null) }} placeholder="Buscar por correo o nombre (mín. 3 letras)" />
          {elegido ? (
            <p className="rounded-xl bg-primary/10 px-3.5 py-2.5 text-[13.5px] font-semibold text-foreground">{elegido.nombres} {elegido.apellidos} · {elegido.correo}</p>
          ) : candidatos.length > 0 ? (
            <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
              {candidatos.slice(0, 6).map((u) => (
                <li key={u.id}>
                  <button type="button" onClick={() => setElegido(u)} className="block w-full px-3.5 py-2.5 text-left outline-none hover:bg-secondary focus-visible:bg-secondary">
                    <span className="block text-[13.5px] font-bold text-foreground">{u.nombres} {u.apellidos}</span>
                    <span className="block text-[12px] text-muted-foreground">{u.correo}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : aplicado.length >= 3 ? (
            <p className="text-[12.5px] text-muted-foreground">No encontramos personas activas con ese texto que aún no administren.</p>
          ) : null}
        </div>
        <SelectorRol roles={roles} valor={rolId} onCambiar={setRolId} />
        {error && <p role="alert" className="text-[12.5px] font-bold text-destructive-text">{error}</p>}
      </div>
    </FormPanel>
  )
}

/** Desde Usuarios: convierte a una persona concreta en administradora eligiendo su rol (mismo endpoint que «Nuevo administrador»). */
export function PanelHacerAdministrador({ usuario, alCerrar, alGuardar }: { usuario: UsuarioAdminDto | null; alCerrar: () => void; alGuardar: () => void }) {
  const [roles, setRoles] = React.useState<RolDto[] | null>(null)
  const [rolId, setRolId] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [enviando, setEnviando] = React.useState(false)
  const idUsuario = usuario?.id

  React.useEffect(() => {
    if (!idUsuario) return
    let cancelado = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia el formulario al abrirlo
    setRoles(null)
    setError(null)
    void llamar<RolDto[]>({ method: "GET", url: "/plataforma/roles" }).then((res) => {
      if (cancelado) return
      if (res.ok) {
        setRoles(res.datos)
        setRolId(res.datos.find((r) => !r.es_sistema || r.codigo !== "ADMIN_PLATAFORMA")?.id ?? res.datos[0]?.id ?? "")
      } else setError(res.error.message)
    })
    return () => {
      cancelado = true
    }
  }, [idUsuario])

  const guardar = async () => {
    if (!usuario) return
    if (!rolId) return setError("Elige un rol.")
    setEnviando(true)
    const res = await llamar<AdministradorDto>({ method: "POST", url: "/plataforma/administradores", data: { usuario_id: usuario.id, rol_id: rolId } })
    setEnviando(false)
    if (!res.ok) return setError(res.error.message)
    toast.add({ type: "success", title: "Administrador agregado", description: usuario.correo })
    alGuardar()
  }

  return (
    <FormPanel
      open={usuario !== null}
      onOpenChange={(o) => !o && alCerrar()}
      title={`Hacer administrador a ${usuario?.nombres ?? ""}`}
      description={`${usuario?.nombres ?? ""} ${usuario?.apellidos ?? ""} · ${usuario?.correo ?? ""}. Sus permisos rigen de inmediato.`}
      footer={
        <>
          <Button type="button" variant="neutral" onClick={alCerrar}>Cancelar</Button>
          <Button type="button" loading={enviando} onClick={guardar} disabled={!roles}>Hacer administrador</Button>
        </>
      }
    >
      <div className="space-y-5">
        {roles ? <SelectorRol roles={roles} valor={rolId} onCambiar={setRolId} /> : !error && <Skeleton className="h-32 rounded-xl" />}
        {error && <p role="alert" className="text-[12.5px] font-bold text-destructive-text">{error}</p>}
      </div>
    </FormPanel>
  )
}

function PanelCambiarRol({ administrador, roles, alCerrar, alGuardar }: { administrador: AdministradorDto | null; roles: RolDto[]; alCerrar: () => void; alGuardar: () => void }) {
  const [rolId, setRolId] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [enviando, setEnviando] = React.useState(false)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- parte del rol actual de la persona
    setRolId(administrador?.rol?.id ?? "")
    setError(null)
  }, [administrador])

  const guardar = async () => {
    if (!administrador || !rolId) return setError("Elige un rol.")
    setEnviando(true)
    const res = await llamar<AdministradorDto>({ method: "PUT", url: `/plataforma/administradores/${administrador.usuario_id}`, data: { rol_id: rolId } })
    setEnviando(false)
    if (!res.ok) return setError(res.error.message)
    toast.add({ type: "success", title: "Rol actualizado" })
    alGuardar()
  }

  return (
    <FormPanel
      open={administrador !== null}
      onOpenChange={(o) => !o && alCerrar()}
      title={`Cambiar el rol de ${administrador?.nombre ?? ""}`}
      description="El cambio rige de inmediato: sus permisos se leen de la base en cada petición."
      footer={
        <>
          <Button type="button" variant="neutral" onClick={alCerrar}>Cancelar</Button>
          <Button type="button" loading={enviando} onClick={guardar}>Guardar rol</Button>
        </>
      }
    >
      <div className="space-y-5">
        <SelectorRol roles={roles} valor={rolId} onCambiar={setRolId} />
        {error && <p role="alert" className="text-[12.5px] font-bold text-destructive-text">{error}</p>}
      </div>
    </FormPanel>
  )
}

/* ---------- Roles ---------- */
function ListaRoles({ permisos, roles, recargar }: { permisos: PermisoDto[]; roles: RolDto[]; recargar: () => void }) {
  const confirmar = useConfirm()
  const { permisosPlataforma } = usePanel()
  const [panel, setPanel] = React.useState<{ abierto: boolean; editando?: RolDto }>({ abierto: false })

  const eliminar = async (r: RolDto) => {
    const ok = await confirmar({ variant: "destructive", title: `¿Eliminar el rol «${r.nombre}»?`, description: "Un rol con administradores no se puede eliminar.", confirmText: "Sí, eliminar" })
    if (!ok) return
    const res = await llamar<void>({ method: "DELETE", url: `/plataforma/roles/${r.id}` })
    if (!res.ok) return void toast.add({ type: "error", title: "No se pudo eliminar", description: res.error.message })
    toast.add({ type: "success", title: "Rol eliminado" })
    recargar()
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setPanel({ abierto: true })} leftIcon={<Plus aria-hidden="true" />}>Nuevo rol</Button>
      </div>
      {roles.length === 0 ? (
        <Card><CardContent><EstadoVacio icono={UserCog} titulo="Aún no hay roles" descripcion="Crea un rol y elige sus permisos." /></CardContent></Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {roles.map((r) => (
            <li key={r.id}>
              <Card className="h-full">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-extrabold tracking-tight text-foreground">{r.nombre}</p>
                      <p className="text-[12.5px] text-muted-foreground">{r.descripcion ?? r.codigo}</p>
                    </div>
                    <Badge variant="estado" tono={r.es_sistema ? "info" : "neutro"}>{r.es_sistema ? "De sistema" : "Personalizado"}</Badge>
                  </div>
                  <ul className="flex flex-wrap gap-1.5">
                    {r.permisos.map((p) => (
                      <li key={p} className="rounded-full bg-secondary px-2.5 py-1 text-[11.5px] font-semibold text-foreground">{etiquetaPermiso(permisos, p)}</li>
                    ))}
                  </ul>
                  <p className="text-[12.5px] font-medium text-muted-foreground">{r.administradores} {r.administradores === 1 ? "administrador" : "administradores"}</p>
                  {!r.es_sistema && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="soft" onClick={() => setPanel({ abierto: true, editando: r })} leftIcon={<Pencil aria-hidden="true" />}>Editar</Button>
                      <Button size="sm" variant="danger-outline" onClick={() => eliminar(r)} leftIcon={<Trash2 aria-hidden="true" />}>Eliminar</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <PanelRol
        abierto={panel.abierto}
        editando={panel.editando}
        permisos={permisos.filter((p) => permisosPlataforma.includes(p.codigo))}
        alCerrar={() => setPanel({ abierto: false })}
        alGuardar={() => { setPanel({ abierto: false }); recargar() }}
      />
    </>
  )
}

function PanelRol({ abierto, editando, permisos, alCerrar, alGuardar }: { abierto: boolean; editando?: RolDto; permisos: PermisoDto[]; alCerrar: () => void; alGuardar: () => void }) {
  const [codigo, setCodigo] = React.useState("")
  const [nombre, setNombre] = React.useState("")
  const [descripcion, setDescripcion] = React.useState("")
  const [marcados, setMarcados] = React.useState<string[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [enviando, setEnviando] = React.useState(false)

  React.useEffect(() => {
    if (!abierto) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga el rol que se edita o limpia el formulario
    setCodigo(editando?.codigo ?? "")
    setNombre(editando?.nombre ?? "")
    setDescripcion(editando?.descripcion ?? "")
    setMarcados(editando?.permisos ?? [])
    setError(null)
  }, [abierto, editando])

  const alternar = (c: string) => setMarcados((m) => (m.includes(c) ? m.filter((x) => x !== c) : [...m, c]))

  const guardar = async () => {
    if (!editando && !/^[A-Z][A-Z_]{2,39}$/.test(codigo)) return setError("El código: de 3 a 40 letras mayúsculas o guiones bajos (por ejemplo ATENCION_CLIENTES).")
    if (!nombre.trim()) return setError("Escribe el nombre del rol.")
    if (marcados.length === 0) return setError("Elige al menos un permiso.")
    setEnviando(true)
    const res = editando
      ? await llamar<RolDto>({ method: "PUT", url: `/plataforma/roles/${editando.id}`, data: { nombre: nombre.trim(), descripcion: descripcion.trim() || undefined, permisos: marcados } })
      : await llamar<RolDto>({ method: "POST", url: "/plataforma/roles", data: { codigo, nombre: nombre.trim(), descripcion: descripcion.trim() || undefined, permisos: marcados } })
    setEnviando(false)
    if (!res.ok) return setError(res.error.message)
    toast.add({ type: "success", title: editando ? "Rol actualizado" : "Rol creado" })
    alGuardar()
  }

  return (
    <FormPanel
      open={abierto}
      onOpenChange={(o) => !o && alCerrar()}
      title={editando ? `Editar «${editando.nombre}»` : "Nuevo rol"}
      description="Solo puedes dar permisos que tú tienes."
      footer={
        <>
          <Button type="button" variant="neutral" onClick={alCerrar}>Cancelar</Button>
          <Button type="button" loading={enviando} onClick={guardar}>{editando ? "Guardar cambios" : "Crear rol"}</Button>
        </>
      }
    >
      <div className="space-y-5">
        {!editando && <FloatingInput label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} ayuda="Se escribe en mayúsculas y no se puede cambiar después." />}
        <FloatingInput label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <FloatingTextarea label="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <fieldset className="space-y-2">
          <legend className="text-[12px] font-bold text-muted-foreground">Permisos</legend>
          {permisos.map((p) => (
            <label key={p.codigo} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 p-3 hover:bg-secondary">
              <input type="checkbox" checked={marcados.includes(p.codigo)} onChange={() => alternar(p.codigo)} className="mt-0.5 size-4 accent-[var(--primary)]" />
              <span className="text-[13.5px] font-semibold text-foreground">{p.descripcion}</span>
            </label>
          ))}
        </fieldset>
        {error && <p role="alert" className="text-[12.5px] font-bold text-destructive-text">{error}</p>}
      </div>
    </FormPanel>
  )
}
