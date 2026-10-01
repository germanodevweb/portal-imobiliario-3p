"use client";

import Script from "next/script";

const GA_MEASUREMENT_ID = "G-KYHCRPZ1C4";

/**
 * GA4: um único `gtag('config')` no carregamento (page_view inicial).
 * Navegações no App Router: confiar na medição otimizada do GA4
 * («Alterações de página com base no histórico do navegador»), sem `useEffect`
 * extra — evita page_view duplicado no first load e em cada rota.
 * Admin GA4 → Fluxo de dados → Medição otimizada: ativar o item acima.
 */
export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
