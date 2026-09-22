import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">404 - Página no encontrada</h2>
      <p className="text-slate-500">El recurso que buscas no existe o fue movido.</p>
      <Link href="/" className="text-blue-600 hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}