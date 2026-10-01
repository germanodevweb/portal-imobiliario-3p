
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Geist } from "next/font/google";
import { GoogleAnalytics } from "@/app/components/GoogleAnalytics";
import { SITE_METADATA_BASE } from "@/lib/seo";
import {
  buildSiteEntityGraphJsonLd,
  serializeJsonLd,
} from "@/lib/seo/site-entity-jsonld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: SITE_METADATA_BASE,
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

  const siteEntityGraphJsonLd = serializeJsonLd(buildSiteEntityGraphJsonLd());
  return (
    <html lang={lang} className="overflow-x-clip">
      <body className={`${geistSans.variable} min-h-dvh antialiased`}>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: siteEntityGraphJsonLd }}
        />

        {children}
      </body>
    </html>
  );
}
