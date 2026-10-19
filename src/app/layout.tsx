import type { Metadata } from "next";
import { Inter, Hanken_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/shared/providers/theme-provider"
import { Toaster } from "@/shared/components/ui/toast"
import { ConfirmProvider } from "@/shared/providers/confirm-provider"
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
            <ConfirmProvider>{children}</ConfirmProvider>
            <EstadoConexionModal />
          </Toaster>
        </ThemeProvider>
      </body>
    </html>
  );
}