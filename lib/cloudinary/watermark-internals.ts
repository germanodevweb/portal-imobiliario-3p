function normalizeEnvPublicId(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s.length > 0 ? s : undefined;
}

const DEFAULT_WATERMARK_LOGO_PUBLIC_ID = "3p/logo";

export function resolveWatermarkPublicId(): string {
  const pub = normalizeEnvPublicId(process.env.NEXT_PUBLIC_CLOUDINARY_WATERMARK_PUBLIC_ID);
  const serverOnly = normalizeEnvPublicId(process.env.CLOUDINARY_WATERMARK_PUBLIC_ID);
  return pub ?? serverOnly ?? DEFAULT_WATERMARK_LOGO_PUBLIC_ID;
}
