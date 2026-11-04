import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/shared/providers/theme-provider"
import { Toaster } from "@/shared/components/ui/toast"
import { ConfirmProvider } from "@/shared/providers/confirm-provider"
import { EstadoConexionModalGuard } from "@/shared/components/composed/estado-conexion-modal-guard"
import "./globals.css";
import "./otemu-capa-visual.css";

// DM Sans: fuente de toda la interfaz y los títulos (docs/diseno-web.md §3)
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-dm-sans",
  display: "swap",
});

// JetBrains Mono: solo códigos (SKU, número de orden, subdominio)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
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
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="otemu-studio min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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