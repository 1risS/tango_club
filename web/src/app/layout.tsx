import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Baires Tango Club",
  description: "Agenda, detalle de eventos y reservas para una app de milongas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader />
        {children}
        <footer className="border-t border-line/70 bg-panel/80">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-muted md:px-8 md:text-base">
            <p>Baires Tango Club</p>
            <p>Base lista para conectar la capa de reservas con Neon DB cuando haga falta.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
