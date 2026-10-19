import { ImageResponse } from "next/og";
import { buildFolderCloudinaryImageUrl } from "@/lib/folder/cloudinary-folder-image-url";
import {
  encodeFolderImageBuffer,
  type FolderImageFormat,
} from "@/lib/folder/encode-folder-image";
import { PropertyFolderVerticalLayout } from "@/lib/folder/vertical-layout";
import {
  loadFolderLogoDataUrl,
  loadFolderOgFonts,
} from "@/lib/folder/load-folder-fonts";
import type { PropertyFolderVerticalPayload } from "@/lib/folder/types";

const PHOTO_FRAMES: { w: number; h: number }[] = [
  { w: 520, h: 700 },
  { w: 440, h: 300 },
  { w: 440, h: 300 },
];

async function renderFolderPngBuffer(
  payload: PropertyFolderVerticalPayload
): Promise<Buffer> {
  const fonts = await loadFolderOgFonts();
  const logoSrc = await loadFolderLogoDataUrl();

  const framedPhotoUrls = payload.photoUrls.map((url, i) => {
    const frame = PHOTO_FRAMES[i] ?? PHOTO_FRAMES[0];
    return buildFolderCloudinaryImageUrl(url, frame.w, frame.h);
  }) as [string, string, string];

  const element = PropertyFolderVerticalLayout({
    ...payload,
    logoSrc,
    framedPhotoUrls,
  });

  const response = new ImageResponse(element, {
    width: 1080,
    height: 1920,
    fonts,
  });

  return Buffer.from(await response.arrayBuffer());
}

export async function generatePropertyFolderVerticalImage(
  payload: PropertyFolderVerticalPayload,
  format: FolderImageFormat = "png"
): Promise<ArrayBuffer> {
  const png = await renderFolderPngBuffer(payload);
  const encoded = await encodeFolderImageBuffer(png, format);
  return Uint8Array.from(encoded).buffer;
}

/** @deprecated use generatePropertyFolderVerticalImage */
export async function generatePropertyFolderVerticalPng(
  payload: PropertyFolderVerticalPayload
): Promise<ArrayBuffer> {
  return generatePropertyFolderVerticalImage(payload, "png");
}
