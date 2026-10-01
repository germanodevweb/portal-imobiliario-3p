"use client";

import { useEffect } from "react";

/** Rola até #servicos após navegação de outras rotas para /#servicos. */
export function HomeServicosHashScroll() {
  useEffect(() => {
    if (window.location.hash !== "#servicos") return;

    const scrollToServicos = () => {
      document.getElementById("servicos")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    const timeoutId = window.setTimeout(scrollToServicos, 50);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
}
