import { NextRequest, NextResponse } from "next/server";
import { generateBlogContent } from "@/lib/ai/blog";

/**
 * Geração de artigo por IA (admin).
 * Usa Route Handler em vez de Server Action para evitar o POST RSC na página
 * `/admin/blog/novo`, que em alguns casos revalida a árvore e o formulário cliente
 * perde o estado mesmo após resposta bem-sucedida.
 *
 * Auth: cookie de sessão admin (middleware em `/api/admin/*`).
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const theme =
    typeof body === "object" &&
    body !== null &&
    "theme" in body &&
    typeof (body as { theme: unknown }).theme === "string"
      ? (body as { theme: string }).theme.trim()
      : "";

  if (!theme) {
    return NextResponse.json(
      { success: false, error: "O tema é obrigatório." },
      { status: 400 }
    );
  }

  try {
    const result = await generateBlogContent({ theme });
    const bodyText = result.content.replace(/<[^>]+>/g, "").trim();
    if (
      !result.title?.trim() ||
      !result.metaDescription?.trim() ||
      bodyText.length < 20
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A IA não devolveu texto suficiente. Tente outro tema ou aguarde e tente de novo.",
        },
        { status: 422 }
      );
    }
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    console.error("[api/admin/blog/generate]", e);
    const msg = e instanceof Error ? e.message : "Erro ao gerar artigo.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
