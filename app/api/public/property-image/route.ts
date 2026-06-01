import { NextRequest, NextResponse } from "next/server";
import { isAllowedImageProxyHost } from "@/lib/property/image-proxy-allowlist";
import { fetchPropertyImageBytes } from "@/lib/property/fetch-property-image";

const MAX_URL_LENGTH = 2048;

/**
 * Proxy público para imagens de imóveis.
 * URLs legadas Code49 (/admin/imovel/) usam LEGACY_PROPERTY_IMAGE_ORIGIN quando definida.
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw || raw.length > MAX_URL_LENGTH) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return NextResponse.json({ error: "Protocolo inválido" }, { status: 400 });
  }

  if (!isAllowedImageProxyHost(parsed.hostname)) {
    return NextResponse.json({ error: "Host não permitido" }, { status: 403 });
  }

  const fetched = await fetchPropertyImageBytes(raw);
  if (!fetched.ok) {
    return NextResponse.json({ error: fetched.reason }, { status: fetched.status });
  }

  return new NextResponse(fetched.buffer, {
    headers: {
      "Content-Type": fetched.contentType,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
