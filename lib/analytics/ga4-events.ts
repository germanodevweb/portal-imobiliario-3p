/** Eventos GA4 — usar apenas em Client Components após interação. */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackGa4Event(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}
