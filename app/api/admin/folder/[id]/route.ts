import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePropertyFolderVerticalImage } from "@/lib/folder/generate-vertical-image";
import type { FolderImageFormat } from "@/lib/folder/encode-folder-image";
import { validatePropertyFolderVerticalPayload } from "@/lib/folder/validate-folder-payload";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function parseFormat(value: string | null): FolderImageFormat {
  if (value === "jpeg" || value === "jpg") return "jpeg";
  return "png";
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const propertyId = id?.trim();
  if (!propertyId) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, slug: true },
  });
  if (!property) {
    return NextResponse.json({ error: "Imóvel não encontrado." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const validated = validatePropertyFolderVerticalPayload(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const format = parseFormat(req.nextUrl.searchParams.get("format"));

  try {
    const buffer = await generatePropertyFolderVerticalImage(
      validated.payload,
      format
    );
    const ext = format === "jpeg" ? "jpg" : "png";
    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    const filename = `${property.slug}-vertical.${ext}`;
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("[api/admin/folder]", e);
    const msg =
      e instanceof Error ? e.message : "Erro ao gerar folder.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
