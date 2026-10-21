import type { NextConfig } from "next";

const esProduccion = process.env.NODE_ENV === "production";

/**
 * Política de contenido: solo se carga lo que sirve el propio sitio. 'unsafe-inline' en scripts y estilos lo exige Next.js
 * (hidratación y estilos en línea); el resto es estricto: sin plugins, sin marcos de otros sitios, formularios y base solo
 * del mismo origen. Las imágenes permiten https porque pueden venir de direcciones externas.
 * En desarrollo no se aplica (el recargado en caliente usa eval y una conexión local).
 */
const politicaContenido = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const cabecerasSeguridad = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(esProduccion
    ? [
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "Content-Security-Policy", value: politicaContenido },
      ]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  // No anunciar el framework en la cabecera X-Powered-By.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: cabecerasSeguridad }];
  },
  // /api lo atiende el route handler src/app/api/[...ruta]/route.ts (proxy con JWT en cookie httpOnly, W-003).
};

export default nextConfig;
