'use client'
import { usePathname } from 'next/navigation'
import { EstadoConexionModal } from './estado-conexion-modal'
/** El prototipo trabaja localmente: no requiere contactar la API. */
export function EstadoConexionModalGuard() {
  const pathname = usePathname()
  if (pathname === '/' || pathname === '/login' || pathname === '/registro' || pathname === '/recuperar' || pathname?.startsWith('/demo') || pathname?.startsWith('/prototipo')) return null
  return <EstadoConexionModal />
}
