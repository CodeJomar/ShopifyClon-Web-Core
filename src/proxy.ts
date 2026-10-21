import { NextResponse, type NextRequest } from "next/server";

// Solo estas secciones exigen sesión (W-003). Todo lo demás es público: vitrina, login, registro, playground.
const RUTAS_PROTEGIDAS = ["/panel", "/cuenta", "/plataforma"];
// Cookie httpOnly que emite el proxy de /api al iniciar sesión (src/lib/sesion/cookies.ts).
const COOKIE_SESION = "otemu_sesion";

const coincide = (pathname: string, ruta: string) => pathname === ruta || pathname.startsWith(`${ruta}/`);

/**
 * Guard de navegación (UX): sin cookie de sesión, las rutas protegidas van a /login conservando el destino.
 * NO es autorización: la API valida cada petición (401/403/404) y el proxy de /api sella la sesión.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const esProtegida = RUTAS_PROTEGIDAS.some((ruta) => coincide(pathname, ruta));
  if (!esProtegida || request.cookies.has(COOKIE_SESION)) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("siguiente", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  // Excluye la API (/api), assets de Next y el favicon.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
