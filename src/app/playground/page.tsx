"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Eye, Lock, Mail, ArrowRight, RotateCcw, Check, Info, Inbox, Moon, Sun, Store, TriangleAlert, Package } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { toast } from "@/shared/components/ui/toast";
import { FloatingInput } from "@/shared/components/composed/floating-input";
import { FloatingSelect } from "@/shared/components/composed/floating-select";
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea";
import { SelectContent, SelectItem } from "@/shared/components/ui/select";
import { EstadoVacio } from "@/shared/components/composed/estado-vacio";
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion";
import type { TonoInsignia } from "@/shared/components/ui/badge";
import { useMounted } from "@/shared/hooks/use-mounted";
import { OverlaysDemo } from "./overlays-demo";
import { ComposedDemo } from "./composed-demo";
import { ErroresDemo } from "./errores-demo";

// Cada sección del playground corresponde a un componente de docs/diseno-web.md §4 con sus estados.
const VARIANTES_BOTON = [
  "default", "outline", "soft", "ghost", "link", "neutral", "warning", "danger", "danger-outline",
] as const;

const TONOS: { tono: TonoInsignia; texto: string }[] = [
  { tono: "neutro", texto: "Por preparar" },
  { tono: "contorno", texto: "Borrador" },
  { tono: "info", texto: "Pagada" },
  { tono: "exito", texto: "Entregada" },
  { tono: "marca", texto: "Activo en tienda" },
  { tono: "aviso", texto: "Pago pendiente" },
  { tono: "peligro", texto: "Anulada" },
  { tono: "naranja", texto: "Cancelada" },
  { tono: "morado", texto: "En ruta" },
  { tono: "indigo", texto: "Preparada" },
];

const TIPOS_TOAST = [
  { type: "success", etiqueta: "Éxito", title: "Producto publicado", description: "Ya se ve en tu tienda." },
  { type: "error", etiqueta: "Error", title: "No se pudo guardar", description: "Revisa tu conexión e inténtalo de nuevo." },
  { type: "warning", etiqueta: "Aviso", title: "Quedan 2 unidades", description: "El stock está por agotarse." },
  { type: "info", etiqueta: "Información", title: "Cambios sin publicar", description: "Publícalos para verlos en la vitrina." },
  { type: "loading", etiqueta: "Cargando", title: "Guardando cambios…" },
] as const;

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="space-y-4">
      <h2 id={`${id}-titulo`} className="text-lg font-extrabold tracking-tight text-foreground">{titulo}</h2>
      <Card>
        <CardContent className="flex flex-col gap-6">{children}</CardContent>
      </Card>
    </section>
  );
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">{children}</p>;
}

export default function PlaygroundPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const montado = useMounted();
  const oscuro = montado && resolvedTheme === "dark";
  const [pagina, setPagina] = React.useState(1);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Componentes de OTemu</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Referencia visual de docs/diseno-web.md §4. Revisa cada estado en claro y en oscuro.
            </p>
          </div>
          <Button
            variant="neutral"
            size="sm"
            onClick={() => setTheme(oscuro ? "light" : "dark")}
            aria-label="Cambiar entre tema claro y oscuro"
          >
            {oscuro ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            {oscuro ? "Tema claro" : "Tema oscuro"}
          </Button>
        </header>

        <Seccion id="botones" titulo="1. Botones (§4.1)">
          <div className="space-y-3">
            <Rotulo>Variantes</Rotulo>
            <div className="flex flex-wrap gap-3">
              {VARIANTES_BOTON.map((variante) => (
                <Button key={variante} variant={variante}>
                  {variante}
                </Button>
              ))}
              <Button variant="default" rightIcon={<ArrowRight />}>Publicar producto</Button>
            </div>
          </div>
          <div className="space-y-3">
            <Rotulo>Tamaños</Rotulo>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Pequeño</Button>
              <Button size="default">Normal</Button>
              <Button size="lg">Grande (móvil)</Button>
              <Button size="icon" variant="soft" aria-label="Ver"><Eye /></Button>
              <Button size="icon-sm" variant="ghost" aria-label="Ver"><Eye /></Button>
            </div>
          </div>
          <div className="space-y-3">
            <Rotulo>Estados</Rotulo>
            <div className="flex flex-wrap gap-3">
              <Button variant="default" disabled>Deshabilitado</Button>
              <Button variant="outline" disabled>Deshabilitado</Button>
              <Button variant="default" loading>Guardando</Button>
              <Button variant="outline" leftIcon={<RotateCcw />}>Volver a hacer</Button>
            </div>
          </div>
        </Seccion>

        <Seccion id="campos" titulo="2. Campos outlined cut (§4.2)">
          <div className="grid gap-6 sm:grid-cols-2">
            <FloatingInput label="Correo electrónico" autoFocus leftIcon={<Mail className="size-4" />} ayuda="Usaremos este correo para avisarte de tus pedidos." />
            <FloatingInput label="Nombre de la tienda" defaultValue="Tienda Aurora" />
            <FloatingInput label="Contraseña" state="error" type="password" defaultValue="12345" mensajeError="Debe tener 8 caracteres o más." leftIcon={<Lock className="size-4" />} />
            <FloatingInput label="Número de orden" disabled defaultValue="ORD-2026-0042" />
            <FloatingInput label="Enlace de tu tienda" readOnly copiable defaultValue="otemu.com/tienda/aurora-tienda" />
            <FloatingSelect label="Categoría" defaultValue="ropa">
              <SelectContent>
                <SelectItem value="ropa">Ropa</SelectItem>
                <SelectItem value="hogar">Hogar</SelectItem>
              </SelectContent>
            </FloatingSelect>
            <FloatingSelect label="Estado" state="success" defaultValue="activo">
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="borrador">Borrador</SelectItem>
              </SelectContent>
            </FloatingSelect>
            <div className="sm:col-span-2">
              <FloatingTextarea label="Descripción del producto" defaultValue="Taza de cerámica hecha a mano." />
            </div>
          </div>
        </Seccion>

        <Seccion id="insignias" titulo="3. Insignias de estado (§4.3)">
          <div className="flex flex-wrap gap-2">
            {TONOS.map(({ tono, texto }) => (
              <Badge key={tono} variant="estado" tono={tono}>{texto}</Badge>
            ))}
          </div>
        </Seccion>

        <Seccion id="avisos" titulo="4. Notificaciones y alertas (§4.4)">
          <div className="space-y-3">
            <Rotulo>Notificaciones (toast)</Rotulo>
            <div className="flex flex-wrap gap-2">
              {TIPOS_TOAST.map((t) => (
                <Button
                  key={t.type}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.add({
                      type: t.type,
                      title: t.title,
                      description: "description" in t ? t.description : undefined,
                    })
                  }
                >
                  {t.etiqueta}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Rotulo>Alertas dentro de la pantalla</Rotulo>
            <div className="grid gap-3">
              <Alert>
                <Info aria-hidden="true" />
                <AlertTitle>Tu prueba gratis termina en 5 días</AlertTitle>
                <AlertDescription>Elige un plan para no perder el acceso a tu tienda.</AlertDescription>
              </Alert>
              <Alert variant="success">
                <Check aria-hidden="true" />
                <AlertTitle>Pago aprobado</AlertTitle>
                <AlertDescription>La orden ya está en preparación.</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <TriangleAlert aria-hidden="true" />
                <AlertTitle>Sin stock en 2 variantes</AlertTitle>
                <AlertDescription>Reponlas antes de publicar la tienda.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <TriangleAlert aria-hidden="true" />
                <AlertTitle>No se pudo cobrar</AlertTitle>
                <AlertDescription>Revisa el medio de pago e inténtalo de nuevo.</AlertDescription>
              </Alert>
            </div>
          </div>
        </Seccion>

        <Seccion id="vacio" titulo="5. Estado vacío (§4.5)">
          <div className="grid gap-6 sm:grid-cols-2">
            <EstadoVacio titulo="Aún no tienes productos" descripcion="Crea el primero para empezar a vender." icono={Package} accion={{ texto: "Crear producto", onClick: () => undefined }} />
            <EstadoVacio titulo="Sin resultados" descripcion="Prueba con otra búsqueda." icono={Inbox} accion={{ texto: "Limpiar filtros", onClick: () => undefined }} />
          </div>
        </Seccion>

        <Seccion id="paginacion" titulo="6. Paginación (§4.6)">
          <BarraPaginacion pagina={pagina} totalPaginas={5} total={38} porPagina={8} etiqueta="productos" onCambiar={setPagina} />
        </Seccion>

        <Seccion id="islas" titulo="7. Isla (§4.7)">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ventas de hoy</CardTitle>
                <CardDescription>Isla con borde y sombra suave sobre el lienzo.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-extrabold text-foreground">$ 1 240</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tu tienda</CardTitle>
                <CardDescription>Activa desde el lunes.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Store className="size-5 text-brand-text" aria-hidden="true" />
                <Badge variant="estado" tono="marca">Activo en tienda</Badge>
              </CardContent>
            </Card>
          </div>
        </Seccion>

        <Seccion id="confirmacion" titulo="8. Confirmación y panel">
          <OverlaysDemo />
        </Seccion>

        <Seccion id="compuestos" titulo="9. Compuestos">
          <ComposedDemo />
        </Seccion>

        <Seccion id="errores" titulo="10. Pantallas de error">
          <ErroresDemo />
        </Seccion>
      </div>
    </div>
  );
}
