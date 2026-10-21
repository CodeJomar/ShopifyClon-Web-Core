"use client";

import * as React from "react";
import { Lock, Mail } from "lucide-react";
import { FloatingInput } from "@/shared/components/composed/floating-input";
import { FloatingSelect } from "@/shared/components/composed/floating-select";
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea";
import { SearchInput } from "@/shared/components/composed/search-input";
import { SelectContent, SelectItem } from "@/shared/components/ui/select";

/**
 * Los mismos campos se muestran dentro de una isla y dentro de un Sheet para comprobar que la etiqueta flotante
 * no deja rectángulo sobre ningún fondo (docs/diseno-web.md §4.2).
 */
export function CamposDemo({ enColumna = false }: { enColumna?: boolean }) {
  const [busqueda, setBusqueda] = React.useState("camisetas");

  return (
    <div className={enColumna ? "grid gap-6" : "grid gap-6 sm:grid-cols-2"}>
      <FloatingInput label="Correo electrónico" leftIcon={<Mail className="size-4" />} ayuda="Usaremos este correo para avisarte de tus pedidos." />
      <FloatingInput label="Nombre de la tienda" defaultValue="Tienda Aurora" />
      <FloatingInput label="Contraseña" type="password" defaultValue="12345678" leftIcon={<Lock className="size-4" />} />
      <FloatingInput label="Contraseña nueva" state="error" type="password" defaultValue="12345" mensajeError="Debe tener 8 caracteres o más." leftIcon={<Lock className="size-4" />} />
      <FloatingInput label="Enlace de tu tienda" readOnly copiable defaultValue="otemu.com/tienda/aurora-tienda" />
      <FloatingInput label="Número de orden" disabled defaultValue="ORD-2026-0042" />
      <SearchInput value={busqueda} onValueChange={setBusqueda} placeholder="Buscar productos" />
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
      <FloatingSelect label="Proveedor">
        <SelectContent>
          <SelectItem value="a">Proveedor A</SelectItem>
          <SelectItem value="b">Proveedor B</SelectItem>
        </SelectContent>
      </FloatingSelect>
      <div className={enColumna ? "" : "sm:col-span-2"}>
        <FloatingTextarea label="Descripción del producto" defaultValue="Taza de cerámica hecha a mano." />
      </div>
    </div>
  );
}
