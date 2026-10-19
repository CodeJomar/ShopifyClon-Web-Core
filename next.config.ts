import type { NextConfig } from "next";

// URL de la API NestJS vista desde el servidor de Next (en Docker: http://api-core:4000).
// Se fija en tiempo de build (las reglas de rewrites se serializan en el build standalone).
const API_INTERNAL_URL = (process.env.API_INTERNAL_URL ?? "http://localhost:4000").replace(/\/$/, "");

const esProduccion = process.env.NODE_ENV === "production";

// Dirección pública de la API para el WebSocket del KDS (también se fija al compilar). La política de contenido
// debe permitir la conexión a ella, en https y en wss.
const WS_URL = (process.env.NEXT_PUBLIC_WS_URL ?? "").replace(/\/$/, "");
const origenesWs = WS_URL ? [WS_URL, WS_URL.replace(/^http/, "ws")] : [];

/**
 * Política de contenido: solo se carga lo que sirve el propio sitio. 'unsafe-inline' en scripts y estilos lo exige Next.js
 * (hidratación y estilos en línea); el resto es estricto: sin plugins, sin marcos de otros sitios, formularios y base solo
 * del mismo origen. Las fotos de productos son direcciones https externas, por eso las imágenes permiten https.
 * En desarrollo no se aplica (el recargado en caliente usa eval y WebSocket local).
 */
const politicaContenido = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${origenesWs.join(" ")}`.trim(),
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
  // El navegador habla SIEMPRE con su propio origen (/api/...) y Next reenvía a NestJS.
  // Así las cookies de sesión son de primera parte (sin SameSite=None ni CORS, que Safari/iPad bloquea)
  // y el Proxy de Next puede ver si existe sesión.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_INTERNAL_URL}/api/:path*` },
      // Latido de la API (público, sin prefijo /api): lo usa el aviso de conexión para saber si volvió.
      { source: "/estado-api", destination: `${API_INTERNAL_URL}/health` },
    ];
  },
};

export default nextConfig;
