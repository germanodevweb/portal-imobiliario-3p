/**
 * Serviço de upload de imagens para Cloudinary.
 * Preparado para expansão (múltiplas imagens, galeria).
 *
 * Variáveis de ambiente:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */

import { v2 as cloudinary } from "cloudinary";
import { validatePropertyImage } from "./validation";

export type UploadPropertyImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET."
    );
  }

  return { cloudName, apiKey, apiSecret };
}

/**
 * Faz upload de uma imagem para Cloudinary.
 * Usado para imagem principal do imóvel — estrutura preparada para galeria.
 */
export async function uploadPropertyImage(
  file: File
): Promise<UploadPropertyImageResult> {
  const error = validatePropertyImage(file);
  if (error) return { ok: false, error };

  const { cloudName, apiKey, apiSecret } = getConfig();
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "3p/properties",
      resource_type: "image",
    });
    return { ok: true, url: result.secure_url };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao fazer upload";
    return { ok: false, error: message };
  }
}
