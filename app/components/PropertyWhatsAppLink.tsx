"use client";

import type { ReactNode } from "react";
import { trackGa4Event } from "@/lib/analytics/ga4-events";

type PropertyWhatsAppLinkProps = {
  href: string;
  propertySlug: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function PropertyWhatsAppLink({
  href,
  propertySlug,
  children,
  className,
  ariaLabel,
}: PropertyWhatsAppLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={() => {
        trackGa4Event("contact_whatsapp", { property_slug: propertySlug });
      }}
    >
      {children}
    </a>
  );
}
