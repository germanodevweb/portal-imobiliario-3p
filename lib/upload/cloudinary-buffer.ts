import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import { v2 as cloudinary } from "cloudinary";

export type CloudinaryBufferUploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

let attemptedEnvFileLoad = false;

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

function getCloudinaryConfig() {
  ensureCloudinaryEnvLoaded();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  const missing: string[] = [];
  if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!apiKey) missing.push("CLOUDINARY_API_KEY");
  if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");

  if (missing.length > 0) {
    throw new Error(`Cloudinary não configurado. Em falta: ${missing.join(", ")}`);
  }

  return { cloudName, apiKey, apiSecret };
}

export async function uploadImageBufferToCloudinary(
  buffer: Buffer,
  mimeType: string
): Promise<CloudinaryBufferUploadResult> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

  const base64 = buffer.toString("base64");
  const dataUri = `data:${mimeType || "image/jpeg"};base64,${base64}`;

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
