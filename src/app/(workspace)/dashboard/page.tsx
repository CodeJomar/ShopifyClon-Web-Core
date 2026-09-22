export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header del módulo */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500">Resumen operativo general de Coffy Flow.</p>
      </div>

      {/* Grid de métricas / tarjetas de prueba */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 rounded-2xl bg-slate-50 border border-slate-100 p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ventas del Día</span>
          <span className="text-3xl font-bold text-slate-900">S/ 1,420.50</span>
        </div>
        <div className="h-32 rounded-2xl bg-slate-50 border border-slate-100 p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pedidos en Cola</span>
          <span className="text-3xl font-bold text-[#4C0107]">12</span>
        </div>
        <div className="h-32 rounded-2xl bg-slate-50 border border-slate-100 p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mesas Ocupadas</span>
          <span className="text-3xl font-bold text-slate-900">8 / 15</span>
        </div>
      </div>
    </div>
  )
}