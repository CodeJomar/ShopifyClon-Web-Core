import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Retorno temprano para permitir acceso libre a todas las vistas durante la maquetación
  return NextResponse.next();

  /* LÓGICA DE PROTECCIÓN COMENTADA TEMPORALMENTE
  const path = request.nextUrl.pathname;

  // Rutas públicas que no requieren validación
  if (path.startsWith("/api/auth") || path.startsWith("/playground") || path.startsWith("/_next") || path === "/favicon.ico") {
    return NextResponse.next();
  }

  // Comprobar existencia de cookie de sesión (Better Auth usa 'better-auth.session_token')
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  const isLoginPage = path === "/login";

  // 1. Usuario no autenticado intentando acceder al sistema (workspace)
  if (!sessionToken && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Usuario ya autenticado intentando acceder al login
  if (sessionToken && isLoginPage) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
  */
}

export const config = {
  // Aplicar el middleware a todas las rutas excepto estáticos
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};