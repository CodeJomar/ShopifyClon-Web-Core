import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@/shared/providers/theme-provider"
import { Toaster } from "@/shared/components/ui/toast"
import { ConfirmProvider } from "@/shared/providers/confirm-provider"
import { EstadoConexionModalGuard } from "@/shared/components/composed/estado-conexion-modal-guard"
import "./globals.css";
import "./otemu-capa-visual.css";

// Montserrat: única fuente de la interfaz, los títulos y los códigos (SKU, número de orden, subdominio)
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
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
      className={`${montserrat.variable} h-full antialiased`}
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