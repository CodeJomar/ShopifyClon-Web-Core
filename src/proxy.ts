import { NextResponse, type NextRequest } from "next/server";

// Pantallas accesibles sin sesión.
const RUTAS_PUBLICAS = ["/login", "/forgot-password", "/activar-cuenta", "/playground"];
const COOKIE_SESION = "cf_access";

/**
 * Guard de navegación (UX): sin cookie de sesión de NestJS se redirige a /login conservando el destino.
 * NO es autorización: la API valida cada petición, y el workspace confirma la sesión real con /auth/me.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const esPublica = RUTAS_PUBLICAS.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
  if (esPublica || request.cookies.has(COOKIE_SESION)) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("siguiente", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  // Excluye la API reenviada a NestJS (y su latido /estado-api), assets de Next e imágenes públicas.
  matcher: ["/((?!api|estado-api|_next/static|_next/image|favicon.ico|images).*)"],
};
