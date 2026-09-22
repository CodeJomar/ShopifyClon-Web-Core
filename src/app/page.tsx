import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { FloatingInput } from "@/shared/components/composed/floating-input";
import { IconSwitch } from "@/shared/components/composed/icon-switch";
import { Users, Eye, Coffee, Croissant, CupSoda, CakeSlice, Lock, Mail, ArrowRight, Monitor, RotateCcw, CheckCircle2, AlertCircle, Info, Moon, Sun, Bell, AlertTriangle } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { UserProfile } from "@/shared/components/composed/user-profile";
import { FloatingSelect } from "@/shared/components/composed/floating-select";
import { SelectContent, SelectItem } from "@/shared/components/ui/select";

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl space-y-12">

        {/* Cabecera */}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-slate-900">UI / Components Playground</h1>
          <p className="text-slate-500 mt-2">
            Entorno aislado para auditar y personalizar los componentes base y compuestos de Coffy Flow.
          </p>
        </div>

        {/* 1. Botones */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Buttons</h2>
          <Card>
            <CardContent className="flex flex-col gap-6 pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="default" rightIcon={<ArrowRight size={18} />}>
                  Generar Pedido
                </Button>

                <Button variant="outline" leftIcon={<RotateCcw size={18} />}>
                  Volver a hacer
                </Button>

                <Button variant="ghost" leftIcon={<Monitor size={18} />}>
                  KDS
                </Button>
              </div>

              {/* Success */}
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="success" leftIcon={<CheckCircle2 size={18} />}>Cobrar</Button>
                <Button variant="success-outline">Cobrar</Button>
                <Button variant="success-ghost">Cobrar</Button>
              </div>

              {/* Danger */}
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="danger" leftIcon={<AlertCircle size={18} />}>Cancelar</Button>
                <Button variant="danger-outline">Cancelar</Button>
                <Button variant="danger-ghost">Cancelar</Button>
              </div>

              {/* Info */}
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="info" leftIcon={<Info size={18} />}>Imprimir</Button>
                <Button variant="info-outline">Imprimir</Button>
                <Button variant="info-ghost">Imprimir</Button>
              </div>

              {/* Warning */}
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="warning" leftIcon={<AlertTriangle size={18} />}>Pausar Orden</Button>
                <Button variant="warning-outline">Pausar Orden</Button>
                <Button variant="warning-ghost">Pausar Orden</Button>
              </div>

              {/* Disabled State (Funciona con cualquier variante) */}
              <div className="flex flex-wrap gap-4 items-center border-t pt-4">
                <Button disabled>Inactivo Default</Button>
                <Button variant="success-outline" disabled>Inactivo Outline</Button>
                <Button variant="danger-ghost" disabled>Inactivo Ghost</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. Inputs & Formularios */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">4. Icon Switches</h2>
          <div className="flex flex-wrap gap-6 p-6 bg-white rounded-3xl shadow-sm border">

            {/* Réplica exacta de tu imagen (Modo Oscuro / Claro) */}
            <IconSwitch
              leftIcon={<Moon size={18} className="text-[#4C0107]" />}
              rightIcon={<Sun size={18} className="text-[#4C0107]" />}
              defaultChecked
            />

            {/* Variante con un solo ícono */}
            <IconSwitch
              leftIcon={<Bell size={18} />}
            />

            {/* Switch Base sin contenedor (para formularios simples) */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Activo</span>
              <Switch />
            </div>

          </div>
        </section>
        {/* 3. Badges / Estados */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. Badges</h2>
          <Card>
            <CardContent className="flex flex-wrap gap-4 pt-6">
              <Badge variant="default">Activo</Badge>
              <Badge variant="secondary">Borrador</Badge>
              <Badge variant="destructive">Cancelado</Badge>
              <Badge variant="outline">Pendiente</Badge>
            </CardContent>
          </Card>
        </section>

        {/* 4. Componentes Compuestos (Composed) */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Composed Components (Próximamente)</h2>
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center h-32 pt-6 text-slate-400">
              Aquí montaremos los SearchInputs, ConfirmModals y DataTables personalizados.
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">2. Neomorphic Floating Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-white rounded-3xl shadow-sm border">

            {/* Estado Normal */}
            <FloatingInput
              label="Correo Electrónico"
              type="email"
              leftIcon={<Mail size={18} />}
            />

            {/* Estado Normal con Icono Derecho */}
            <FloatingInput
              label="Contraseña"
              type="password"
              leftIcon={<Lock size={18} />}
              rightIcon={<Eye size={18} />}
            />

            {/* Estado Éxito */}
            <FloatingInput
              label="Código de Verificación"
              state="success"
              defaultValue="123456"
            />

            {/* Estado Error */}
            <FloatingInput
              label="Nombre de Usuario"
              state="error"
              defaultValue="jomar_"
            />

            {/* Estado Deshabilitado */}
            <FloatingInput
              label="Input Deshabilitado"
              disabled
            />

            <FloatingSelect label="Rol de Usuario" leftIcon={<Users size={18} />}>
              <SelectContent>
                <SelectItem value="admin">Administrador Principal</SelectItem>
                <SelectItem value="dueño">Dueño de Franquicia</SelectItem>
                <SelectItem value="empleado">Empleado Base</SelectItem>
              </SelectContent>
            </FloatingSelect>

            <FloatingSelect label="Estado (Con Error)" state="error">
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </FloatingSelect>

            <FloatingSelect label="Estado (Con Success)" state="success">
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </FloatingSelect>
          </div>



        </section>

        {/* ... */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">5. Segmented Controls (Tabs)</h2>
          <div className="flex flex-col gap-8 p-6 bg-white rounded-3xl shadow-sm border">

            <Tabs defaultValue="admin">
              <TabsList>
                <TabsTrigger
                  value="empleado"
                >
                  Empleado
                </TabsTrigger>

                <TabsTrigger
                  value="dueño"
                >
                  Dueño
                </TabsTrigger>

                <TabsTrigger
                  value="admin"
                >
                  Administrador
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 p-4 border rounded-xl bg-slate-50 text-sm text-slate-600">
                <TabsContent value="empleado">Vista de Empleado (Limitada)</TabsContent>
                <TabsContent value="dueño">Vista de Dueño (Métricas y reportes)</TabsContent>
                <TabsContent value="admin">Vista de Administrador (Acceso total)</TabsContent>
              </div>
            </Tabs>

          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">6. User Profile (Avatar Composition)</h2>
          <div className="flex flex-col gap-6 p-6 bg-white rounded-3xl shadow-sm border">

            {/* Clon exacto del diseño */}
            <UserProfile
              name="Jomar Peralta"
              role="Administrador"
            />

          </div>
        </section>

      </div>
    </div>
  );
}