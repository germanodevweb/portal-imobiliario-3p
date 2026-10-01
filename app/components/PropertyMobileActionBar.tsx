"use client";

import { PropertyWhatsAppLink } from "@/app/components/PropertyWhatsAppLink";

type PropertyMobileActionBarProps = {
  whatsAppHref: string;
  propertySlug: string;
};

/**
 * Barra fixa mobile (< lg) — WhatsApp + scroll para #interesse.
 */
export function PropertyMobileActionBar({
  whatsAppHref,
  propertySlug,
}: PropertyMobileActionBarProps) {
  const scrollToInterest = () => {
    document.getElementById("interesse")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/90 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden"
      role="region"
      aria-label="Ações rápidas"
    >
      <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3 sm:px-6">
        <PropertyWhatsAppLink
          href={whatsAppHref}
          propertySlug={propertySlug}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-green-600 px-4 py-2.5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-50"
        >
          WhatsApp
        </PropertyWhatsAppLink>
        <button
          type="button"
          onClick={scrollToInterest}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
        >
          Tenho interesse
        </button>
      </div>
    </div>
  );
}
