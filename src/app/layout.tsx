import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/shared/providers/theme-provider"
import { Toaster } from "@/shared/components/ui/toast"
import { TEMA_UNICO } from "@/shared/config/tema"
import { ConfirmProvider } from "@/shared/providers/confirm-provider"
import { EstadoConexionModalGuard } from "@/shared/components/composed/estado-conexion-modal-guard"
import "./globals.css";
import "./otemu-capa-visual.css";

// Space Grotesk: única fuente de la interfaz, los títulos y los códigos (SKU, número de orden, subdominio). Llega hasta el peso 700:
// donde el diseño pide 800 (font-extrabold) el navegador usa el 700.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OTemu",
  description: "Crea tu tienda en línea y vende por redes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} h-full antialiased${TEMA_UNICO === "dark" ? " dark" : ""}`}
      suppressHydrationWarning
    >
      <body className="otemu-studio min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme={TEMA_UNICO ?? "light"}
          forcedTheme={TEMA_UNICO}
          enableSystem={false}
          disableTransitionOnChange
        >
          <Toaster limit={3} timeout={5000}>
            <ConfirmProvider>{children}</ConfirmProvider>
            <EstadoConexionModalGuard />
          </Toaster>
        </ThemeProvider>
      </body>
    </html>
  );
}