import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPropertyDevelopmentNameColumn } from "@/lib/admin/schema-migration";
import type { FolderVariant } from "@/lib/folder/types";
import { generatePropertyFolderVideoFrame } from "@/lib/folder/generate-folder-frame";
import { generatePropertyFolderImage } from "@/lib/folder/generate-folder-image";
import type { FolderImageFormat } from "@/lib/folder/encode-folder-image";
import { mergeFolderPayloadWithCadastro } from "@/lib/folder/merge-folder-payload";
import { validateFolderVerticalEditablePayload } from "@/lib/folder/validate-folder-payload";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function parseFormat(value: string | null): FolderImageFormat {
  if (value === "jpeg" || value === "jpg") return "jpeg";
  return "png";
}

function parseVariant(value: string | null): FolderVariant {
  if (value === "feed") return "feed";
  return "vertical";
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const propertyId = id?.trim();
  if (!propertyId) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const includeDevelopmentName = await hasPropertyDevelopmentNameColumn();

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      slug: true,
      title: true,
      neighborhood: true,
      city: true,
      featuredImage: true,
      ...(includeDevelopmentName ? { developmentName: true } : {}),
      images: {
        where: { isHidden: false },
        select: {
          url: true,
          isPrimary: true,
          isHidden: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
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

  const validated = validateFolderVerticalEditablePayload(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const developmentName =
    includeDevelopmentName && "developmentName" in property
      ? (property.developmentName as string | null)
      : null;

  const merged = mergeFolderPayloadWithCadastro(
    {
      title: property.title,
      developmentName,
      neighborhood: property.neighborhood,
      city: property.city,
      featuredImage: property.featuredImage,
      images: property.images,
    },
    validated.payload
  );

  if ("error" in merged) {
    return NextResponse.json({ error: merged.error }, { status: 400 });
  }

  const variant = parseVariant(req.nextUrl.searchParams.get("variant"));
  const format = parseFormat(req.nextUrl.searchParams.get("format"));
  const frameMode = req.nextUrl.searchParams.get("frame");

  try {
    const buffer =
      frameMode === "video"
        ? await generatePropertyFolderVideoFrame(merged, variant)
        : await generatePropertyFolderImage(merged, variant, format);
    const ext = frameMode === "video" ? "png" : format === "jpeg" ? "jpg" : "png";
    const mime = frameMode === "video" || format === "png" ? "image/png" : "image/jpeg";
    const suffix =
      frameMode === "video"
        ? variant === "feed"
          ? "frame-feed"
          : "frame-vertical"
        : variant === "feed"
          ? "feed"
          : "vertical";
    const filename = `${property.slug}-${suffix}.${ext}`;
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
