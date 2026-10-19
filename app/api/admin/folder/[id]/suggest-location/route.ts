import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { suggestFolderLocationText } from "@/lib/ai/folder";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const propertyId = id?.trim();
  if (!propertyId) {
    return NextResponse.json({ success: false, error: "ID inválido." }, { status: 400 });
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      description: true,
      neighborhood: true,
      city: true,
    },
  });

  if (!property) {
    return NextResponse.json(
      { success: false, error: "Imóvel não encontrado." },
      { status: 404 }
    );
  }

  try {
    const text = await suggestFolderLocationText({
      description: property.description ?? "",
      neighborhood: property.neighborhood ?? "",
      city: property.city,
    });
    return NextResponse.json({ success: true, text });
  } catch (e) {
    console.error("[api/admin/folder/suggest-location]", e);
    const msg = e instanceof Error ? e.message : "Erro ao sugerir texto.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
