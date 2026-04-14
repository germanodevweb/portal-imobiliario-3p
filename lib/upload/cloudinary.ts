/**
 * Serviço de upload de imagens para Cloudinary.
 * Preparado para expansão (múltiplas imagens, galeria).
 *
 * Variáveis de ambiente:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */

import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { validatePropertyImage } from "./validation";

export type UploadPropertyImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

let attemptedEnvFileLoad = false;

/**
 * Em dev com Turbopack, o Server Action por vezes não recebe ainda o .env;
 * carregar explicitamente alinha com Prisma (prisma.config.ts usa dotenv).
 */
function ensureCloudinaryEnvLoaded(): void {
  if (attemptedEnvFileLoad) return;
  attemptedEnvFileLoad = true;

  const hasAll =
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    process.env.CLOUDINARY_API_KEY?.trim() &&
    process.env.CLOUDINARY_API_SECRET?.trim();
  if (hasAll) return;

  const root = process.cwd();
  loadDotenv({ path: resolve(root, ".env") });
  loadDotenv({ path: resolve(root, ".env.local"), override: true });
}

function getConfig() {
  ensureCloudinaryEnvLoaded();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  const missing: string[] = [];
  if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!apiKey) missing.push("CLOUDINARY_API_KEY");
  if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");

  if (missing.length > 0) {
    throw new Error(
      [
        `Cloudinary não configurado. Em falta: ${missing.join(", ")}.`,
        "Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET em .env ou .env.local na raiz do projeto e reinicie o servidor (pnpm dev).",
        "Em produção, configure as mesmas variáveis no painel do host (ex.: Vercel).",
      ].join(" ")
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
