import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePropertyFolderVerticalPng } from "@/lib/folder/generate-vertical-image";
import { validatePropertyFolderVerticalPayload } from "@/lib/folder/validate-folder-payload";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

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

  try {
    const buffer = await generatePropertyFolderVerticalPng(validated.payload);
    const filename = `${property.slug}-vertical.png`;
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
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
