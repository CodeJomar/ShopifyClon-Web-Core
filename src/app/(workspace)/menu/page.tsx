export default function MenuPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Carta y Menú</h1>
        <p className="text-sm text-slate-500">Configuración de platos, bebidas, precios y disponibilidad.</p>
      </div>
      <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
        Tabla de productos y categorías
      </div>
    </div>
  )
}