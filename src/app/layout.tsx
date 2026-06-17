import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "La Yunta",
  description: "Agenda nocturna de milongas, salidas y reservas para la escena tanguera de Buenos Aires.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader />
        {children}
        <footer className="mx-3 mb-3 mt-auto border-t border-line bg-panel md:mx-6 md:mb-6 rounded-xl">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-muted md:px-8 md:text-base">
            <p className="font-display text-2xl text-foreground md:text-3xl">La Yunta</p>
            <p>Noches de milonga en una interfaz oscura, precisa y firmada por el shader del club.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
