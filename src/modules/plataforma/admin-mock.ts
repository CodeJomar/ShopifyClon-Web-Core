// Datos DE EJEMPLO de la administración de plataforma (rediseño, semana 3). El backend los entregará en B8
// (`/plataforma/tiendas`, `/usuarios`, `/auditoria`, ...). Mismo criterio que el mercado: las pantallas leen de aquí y cambiar a la API
// es sustituir este archivo.

export type EstadoTienda = "ACTIVA" | "SUSPENDIDA" | "SUSCRIPCION_VENCIDA"
export type PerfilUsuario = "COMPRADOR" | "PROPIETARIO" | "ADMINISTRADOR"
export type EstadoUsuario = "ACTIVO" | "BLOQUEADO" | "SIN_ACTIVAR"

export interface TiendaAdmin {
  id: string
  nombre: string
  subdominio: string
  propietario: string
  plan: string
  estado: EstadoTienda
  ventas_30d: number
  productos: number
  creada: string
}

export interface UsuarioAdmin {
  id: string
  nombre: string
  correo: string
  perfil: PerfilUsuario
  tiendas: number
  estado: EstadoUsuario
  dos_pasos: boolean
  ultimo_acceso: string
}

export interface EventoAuditoria {
  id: string
  fecha: string
  usuario: string
  accion: "CREAR" | "EDITAR" | "ELIMINAR" | "SUSPENDER" | "INICIAR_SESION" | "BLOQUEO"
  entidad: string
  detalle: string
  ip: string
}

export interface AdministradorAdmin {
  id: string
  nombre: string
  correo: string
  rol: "Superadministrador" | "Soporte" | "Finanzas" | "Auditor"
  activo: boolean
  creado: string
}

const dia = (n: number, h = 10, m = 0) => new Date(Date.UTC(2026, 10, 12 - n, h + 5, m)).toISOString()

export const TIENDAS_ADMIN: TiendaAdmin[] = [
  { id: "a1", nombre: "Café Andino", subdominio: "cafe-andino", propietario: "Lucía Paredes", plan: "Crece", estado: "ACTIVA", ventas_30d: 6840, productos: 18, creada: dia(210) },
  { id: "a2", nombre: "Casa Quinua", subdominio: "casa-quinua", propietario: "Mateo Salinas", plan: "Pro", estado: "ACTIVA", ventas_30d: 11230, productos: 64, creada: dia(340) },
  { id: "a3", nombre: "Taller Textil Cusco", subdominio: "taller-textil-cusco", propietario: "Rosa Huamán", plan: "Crece", estado: "ACTIVA", ventas_30d: 9120, productos: 41, creada: dia(480) },
  { id: "a4", nombre: "Neo Gadgets", subdominio: "neo-gadgets", propietario: "Diego Torres", plan: "Empieza gratis", estado: "SUSCRIPCION_VENCIDA", ventas_30d: 0, productos: 12, creada: dia(60) },
  { id: "a5", nombre: "Aroma Selva", subdominio: "aroma-selva", propietario: "Karina Vela", plan: "Crece", estado: "ACTIVA", ventas_30d: 3210, productos: 27, creada: dia(150) },
  { id: "a6", nombre: "Papel y Tinta", subdominio: "papel-y-tinta", propietario: "Andrés Rojas", plan: "Empieza gratis", estado: "ACTIVA", ventas_30d: 940, productos: 9, creada: dia(25) },
  { id: "a7", nombre: "Dulce Valle", subdominio: "dulce-valle", propietario: "Elena Quispe", plan: "Empieza gratis", estado: "SUSPENDIDA", ventas_30d: 0, productos: 6, creada: dia(90) },
  { id: "a8", nombre: "Ferretería Norte", subdominio: "ferreteria-norte", propietario: "Julio Cárdenas", plan: "Pro", estado: "ACTIVA", ventas_30d: 15480, productos: 212, creada: dia(600) },
]

export const USUARIOS_ADMIN: UsuarioAdmin[] = [
  { id: "u1", nombre: "Lucía Paredes", correo: "lucia.paredes@correo.pe", perfil: "PROPIETARIO", tiendas: 1, estado: "ACTIVO", dos_pasos: true, ultimo_acceso: dia(0, 9, 12) },
  { id: "u2", nombre: "Mateo Salinas", correo: "mateo@casaquinua.pe", perfil: "PROPIETARIO", tiendas: 2, estado: "ACTIVO", dos_pasos: true, ultimo_acceso: dia(1, 18, 40) },
  { id: "u3", nombre: "Ana Compradora", correo: "ana.c@correo.pe", perfil: "COMPRADOR", tiendas: 0, estado: "ACTIVO", dos_pasos: false, ultimo_acceso: dia(0, 11, 5) },
  { id: "u4", nombre: "Diego Torres", correo: "diego.torres@correo.pe", perfil: "PROPIETARIO", tiendas: 1, estado: "ACTIVO", dos_pasos: false, ultimo_acceso: dia(9, 20, 0) },
  { id: "u5", nombre: "Valeria Núñez", correo: "valeria.n@correo.pe", perfil: "COMPRADOR", tiendas: 0, estado: "BLOQUEADO", dos_pasos: false, ultimo_acceso: dia(2, 22, 15) },
  { id: "u6", nombre: "Carlos Mendoza", correo: "carlos.m@correo.pe", perfil: "COMPRADOR", tiendas: 0, estado: "SIN_ACTIVAR", dos_pasos: false, ultimo_acceso: dia(5, 8, 30) },
  { id: "u7", nombre: "Admin Prueba", correo: "admin.prueba@otemu.test", perfil: "ADMINISTRADOR", tiendas: 0, estado: "ACTIVO", dos_pasos: true, ultimo_acceso: dia(0, 8, 2) },
  { id: "u8", nombre: "Elena Quispe", correo: "elena.q@correo.pe", perfil: "PROPIETARIO", tiendas: 1, estado: "ACTIVO", dos_pasos: false, ultimo_acceso: dia(14, 12, 0) },
]

export const AUDITORIA_ADMIN: EventoAuditoria[] = [
  { id: "e1", fecha: dia(0, 9, 14), usuario: "admin.prueba@otemu.test", accion: "SUSPENDER", entidad: "Tienda", detalle: "Suspendió «Dulce Valle» por reportes de compradores", ip: "190.232.14.8" },
  { id: "e2", fecha: dia(0, 8, 51), usuario: "lucia.paredes@correo.pe", accion: "EDITAR", entidad: "Producto", detalle: "Cambió el precio de «Café de altura 250 g»", ip: "181.176.40.2" },
  { id: "e3", fecha: dia(0, 8, 30), usuario: "valeria.n@correo.pe", accion: "BLOQUEO", entidad: "Usuario", detalle: "Cuenta bloqueada por 5 intentos fallidos", ip: "200.48.77.19" },
  { id: "e4", fecha: dia(1, 19, 2), usuario: "mateo@casaquinua.pe", accion: "CREAR", entidad: "Ruta", detalle: "Creó la ruta RT-0012 con 6 paradas", ip: "181.67.8.100" },
  { id: "e5", fecha: dia(1, 17, 44), usuario: "admin.prueba@otemu.test", accion: "INICIAR_SESION", entidad: "Sesión", detalle: "Inicio de sesión con verificación en dos pasos", ip: "190.232.14.8" },
  { id: "e6", fecha: dia(2, 15, 10), usuario: "diego.torres@correo.pe", accion: "ELIMINAR", entidad: "Producto", detalle: "Eliminó «Cable USB-C 1 m»", ip: "45.231.3.77" },
  { id: "e7", fecha: dia(3, 11, 25), usuario: "rosa.huaman@correo.pe", accion: "CREAR", entidad: "Tienda", detalle: "Creó la tienda «Taller Textil Sur»", ip: "190.12.65.4" },
  { id: "e8", fecha: dia(4, 10, 0), usuario: "admin.prueba@otemu.test", accion: "EDITAR", entidad: "Plan", detalle: "Cambió la comisión del plan «Crece» de 4 % a 3,5 %", ip: "190.232.14.8" },
]

export const ADMINISTRADORES_ADMIN: AdministradorAdmin[] = [
  { id: "d1", nombre: "Admin Prueba", correo: "admin.prueba@otemu.test", rol: "Superadministrador", activo: true, creado: dia(120) },
  { id: "d2", nombre: "Sofía Ramírez", correo: "sofia.ramirez@otemu.pe", rol: "Soporte", activo: true, creado: dia(60) },
  { id: "d3", nombre: "Tomás Vargas", correo: "tomas.vargas@otemu.pe", rol: "Finanzas", activo: true, creado: dia(45) },
  { id: "d4", nombre: "Irene Castro", correo: "irene.castro@otemu.pe", rol: "Auditor", activo: false, creado: dia(30) },
]

export const PERMISOS_POR_ROL: Record<AdministradorAdmin["rol"], string[]> = {
  Superadministrador: ["Todo lo de la plataforma", "Crear y desactivar administradores", "Cambiar planes y comisiones"],
  Soporte: ["Ver tiendas y usuarios", "Bloquear y desbloquear usuarios", "Suspender y reactivar tiendas"],
  Finanzas: ["Ver comisiones y repartos", "Ver suscripciones", "Marcar liquidaciones"],
  Auditor: ["Ver la auditoría", "Ver eventos de seguridad", "Solo lectura"],
}
