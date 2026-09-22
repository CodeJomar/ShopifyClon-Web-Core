import * as React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full bg-white grid grid-cols-12 overflow-hidden">
      {/* Sección Izquierda: 8 Columnas (Imagen de ambientación) */}
      <div className="hidden lg:relative lg:col-span-8 lg:block h-full bg-slate-900 z-10 shadow-[10px_0_30px_-5px_#4C010780]">
        <img
          src="/images/login-coffee.jpg"
          alt="Coffy Flow Ambiente"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Sección Derecha: 4 Columnas (Formulario) */}
      <div className="col-span-12 lg:col-span-4 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}