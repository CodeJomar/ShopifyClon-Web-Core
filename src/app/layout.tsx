import type { Metadata } from "next";
import { Inter, Hanken_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/shared/providers/theme-provider"
import { Toaster } from "@/shared/components/ui/toast"
import { ConfirmProvider } from "@/shared/providers/confirm-provider"
import { BloqueoMovil } from "@/shared/components/composed/bloqueo-movil"
import { EstadoConexionModal } from "@/shared/components/composed/estado-conexion-modal"
import "./globals.css";

// Inter: Fuente global por defecto
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

// Hanken Grotesk: Fuente manual para titulares
const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coffy Flow",
  description: "Sistema de gestión para cafeterías",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${hankenGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`${inter.className} min-h-full flex flex-col`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Toaster limit={3} timeout={5000}>
            <BloqueoMovil />
            {/* En celular la app se oculta por completo (display: contents mantiene el layout normal en pantallas grandes) */}
            <div className="contents pantalla-pequena:hidden">
              <ConfirmProvider>{children}</ConfirmProvider>
              <EstadoConexionModal />
            </div>
          </Toaster>
        </ThemeProvider>
      </body>
    </html>
  );
}