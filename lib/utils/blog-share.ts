/**
 * URLs de partilha para artigos do blog (abrem a rede com texto/link pré-preenchidos).
 */

export function buildFacebookShareUrl(pageUrl: string): string {
  const u = new URL("https://www.facebook.com/sharer/sharer.php");
  u.searchParams.set("u", pageUrl);
  return u.toString();
}

export function buildLinkedInShareUrl(pageUrl: string): string {
  const u = new URL("https://www.linkedin.com/sharing/share-offsite/");
  u.searchParams.set("url", pageUrl);
  return u.toString();
}

export function buildTwitterIntentUrl(pageUrl: string, title: string): string {
  const u = new URL("https://twitter.com/intent/tweet");
  u.searchParams.set("url", pageUrl);
  if (title.trim()) u.searchParams.set("text", title.trim());
  return u.toString();
}
