import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recomendador PAU Catalunya",
  description: "MVP explicable para orientar la eleccion de grados universitarios en Catalunya."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <header className="border-b border-ink/10 bg-white/70 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/" className="text-sm font-bold uppercase tracking-wide text-ink">
              PAU Match Catalunya
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <Link className="rounded-md px-3 py-2 text-ink/75 hover:bg-ink/5" href="/profile">
                Mi perfil
              </Link>
              <Link className="rounded-md px-3 py-2 text-ink/75 hover:bg-ink/5" href="/admin/import">
                Configurar
              </Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
