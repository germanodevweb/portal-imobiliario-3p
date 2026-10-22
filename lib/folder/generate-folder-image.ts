import { ImageResponse } from "next/og";
import { ApprovedFolderLayout } from "@/lib/folder/approved-layout";
import {
  buildFolderBlurredBackgroundUrl,
  buildFolderMainPhotoUrl,
} from "@/lib/folder/cloudinary-folder-image-url";
import {
  encodeFolderImageBuffer,
  type FolderImageFormat,
} from "@/lib/folder/encode-folder-image";
import { validateFolderPhoneInput } from "@/lib/folder/folder-phone";
import {
  loadFolderLogoDataUrl,
  loadFolderLogoWhiteDataUrl,
  loadFolderOgFonts,
} from "@/lib/folder/load-folder-fonts";
import { FOLDER_LAYOUT_METRICS } from "@/lib/folder/folder-frame-metrics";
import type { FolderVariant, PropertyFolderRenderPayload } from "@/lib/folder/types";

async function renderFolderBuffer(
  payload: PropertyFolderRenderPayload,
  variant: FolderVariant
): Promise<Buffer> {
  const phoneParsed = validateFolderPhoneInput(payload.phone);
  if (!phoneParsed.ok) {
    throw new Error(phoneParsed.error);
  }

  const dim = FOLDER_LAYOUT_METRICS[variant];
  const cropMode = payload.showFullPhoto ? "fit" : "fill";

  const blurredBgUrl = buildFolderBlurredBackgroundUrl(
    payload.primaryPhotoUrl,
    dim.width,
    dim.height
  );
  const mainPhotoUrl = buildFolderMainPhotoUrl(
    payload.primaryPhotoUrl,
    dim.width,
    dim.photoHeight,
    cropMode
  );

  const [fonts, logoSrc, logoWhiteSrc] = await Promise.all([
    loadFolderOgFonts(),
    loadFolderLogoDataUrl(),
    loadFolderLogoWhiteDataUrl(),
  ]);

  const element = ApprovedFolderLayout({
    variant,
    logoSrc,
    logoWhiteSrc,
    blurredBgUrl,
    mainPhotoUrl,
    developmentName: payload.developmentName,
    locationLine: payload.locationLine,
    sealBannerText: payload.sealBannerText,
    highlightBedrooms: payload.highlightBedrooms,
    showLeisure: payload.showLeisure,
    highlightGarage: payload.highlightGarage,
    phone: phoneParsed.display,
  });

  const response = new ImageResponse(element, {
    width: dim.width,
    height: dim.height,
    fonts,
  });

  return Buffer.from(await response.arrayBuffer());
}

export async function generatePropertyFolderImage(
  payload: PropertyFolderRenderPayload,
  variant: FolderVariant,
  format: FolderImageFormat = "png"
): Promise<ArrayBuffer> {
  const png = await renderFolderBuffer(payload, variant);
  const encoded = await encodeFolderImageBuffer(png, format);
  return Uint8Array.from(encoded).buffer;
}

/** @deprecated use generatePropertyFolderImage */
export async function generatePropertyFolderVerticalImage(
  payload: PropertyFolderRenderPayload,
  format: FolderImageFormat = "png"
): Promise<ArrayBuffer> {
  return generatePropertyFolderImage(payload, "vertical", format);
}
