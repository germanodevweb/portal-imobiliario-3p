import { resolveLegacyPropertyImageFetchUrl } from "@/lib/property/legacy-image-url";

export type FetchedPropertyImage =
  | { ok: true; buffer: ArrayBuffer; contentType: string }
  | { ok: false; status: number; reason: string };

/**
 * Busca bytes de imagem de imóvel (proxy público/admin e scripts de migração).
 */
export async function fetchPropertyImageBytes(
  rawUrl: string
): Promise<FetchedPropertyImage> {
  const fetchUrl = resolveLegacyPropertyImageFetchUrl(rawUrl);

  try {
    const res = await fetch(fetchUrl, {
      redirect: "follow",
      headers: {
        Accept: "image/*,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (compatible; 3PinheirosPropertyImage/1.0; +https://www.3pinheirosconsultoria.com.br)",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        reason: `HTTP ${res.status} ao buscar ${fetchUrl}`,
      };
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return {
        ok: false,
        status: 400,
        reason: `Resposta não é imagem (${contentType}) — verifique LEGACY_PROPERTY_IMAGE_ORIGIN`,
      };
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength === 0) {
      return { ok: false, status: 502, reason: "Imagem vazia" };
    }

    return { ok: true, buffer, contentType };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 502, reason: message };
  }
}
