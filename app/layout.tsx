import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import {
  buildOrganizationJsonLd,
  serializeJsonLd,
} from "@/lib/seo/site-entity-jsonld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3Pinheiros Consultoria Imobiliária | CRECI 1317J",
  description:
    "Encontre casas, apartamentos e imóveis comerciais com a 3Pinheiros Consultoria Imobiliária. Atendimento personalizado para compra, venda e investimento. CRECI 1317J.",
  icons: {
    icon: "/favicon.ico",
  },
};

/** Mobile-first: largura do dispositivo, sem zoom indesejado ao focar inputs. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Rotas de investimento internacional: /en/..., /fr/..., /es/... (ver middleware.ts -> x-pathname). */
function getLangFromPath(pathname: string): string {
  if (!pathname) return "pt-BR";
  if (pathname.startsWith("/en/") || pathname === "/en") return "en";
  if (pathname.startsWith("/fr/") || pathname === "/fr") return "fr";
  if (pathname.startsWith("/es/") || pathname === "/es") return "es";
  return "pt-BR";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const lang = getLangFromPath(pathname);

  const organizationJsonLd = serializeJsonLd(buildOrganizationJsonLd());

  return (
    <html lang={lang} className="overflow-x-clip">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
        />
        {children}
      </body>
    </html>
  );
}
