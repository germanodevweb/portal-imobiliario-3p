import { NextRequest, NextResponse } from "next/server";

/** Hosts permitidos (evita SSRF). Amplie com ADMIN_IMAGE_PROXY_HOSTS no .env (hosts extras, separados por vírgula). */
const BASE_ALLOWED = [
  "res.cloudinary.com",
  "picsum.photos",
  "images.unsplash.com",
  "www.3pinheirosconsultoria.com.br",
  "3pinheirosconsultoria.com.br",
];

const MAX_URL_LENGTH = 2048;

function isAllowedHost(hostname: string): boolean {
  if (BASE_ALLOWED.includes(hostname)) return true;
  if (hostname.endsWith(".cloudinary.com")) return true;
  const extra = process.env.ADMIN_IMAGE_PROXY_HOSTS?.split(",").map((h) => h.trim()).filter(Boolean) ?? [];
  return extra.includes(hostname);
}

/**
 * Proxy só para miniaturas no painel admin — o servidor busca a imagem e devolve bytes,
 * contornando bloqueio de hotlink / referrer no navegador.
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

  if (!isAllowedHost(parsed.hostname)) {
    return NextResponse.json({ error: "Host não permitido" }, { status: 403 });
  }

  try {
    const res = await fetch(raw, {
      redirect: "follow",
      headers: {
        Accept: "image/*,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (compatible; 3PinheirosAdmin/1.0; +https://www.3pinheirosconsultoria.com.br)",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Imagem indisponível" }, { status: 502 });
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Não é imagem" }, { status: 400 });
    }

    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Falha ao buscar imagem" }, { status: 502 });
  }
}
