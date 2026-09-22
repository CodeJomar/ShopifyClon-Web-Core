export default function KDSPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">KDS - Comandas en Cocina</h1>
        <p className="text-sm text-slate-500">Gestión de órdenes en tiempo real para preparación.</p>
      </div>

      {/* Contenedor tipo grid para comandas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((order) => (
          <div key={order} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900">Mesa #{order}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">En Preparación</span>
            </div>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• 1x Americano Doble</li>
              <li>• 2x Croissant Artesanal</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}