import { NextResponse, type NextRequest } from "next/server";

// Pantallas accesibles sin sesión.
const RUTAS_PUBLICAS = ["/login", "/forgot-password", "/activar-cuenta", "/playground"];
// La raíz es pública solo en coincidencia exacta (como prefijo dejaría pública toda la app).
const RUTA_RAIZ = "/";
// TODO(W-003): la cookie de sesión la emitirá el proxy de /api (JWT en cookie httpOnly).
const COOKIE_SESION = "cf_access";

/**
 * Guard de navegación (UX): sin cookie de sesión se redirige a /login conservando el destino.
 * NO es autorización: la API valida cada petición, y el workspace confirma la sesión real con /auth/me.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const esPublica =
    pathname === RUTA_RAIZ || RUTAS_PUBLICAS.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
  if (esPublica || request.cookies.has(COOKIE_SESION)) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("siguiente", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  // Excluye la API reenviada (/api), assets de Next e imágenes públicas.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
