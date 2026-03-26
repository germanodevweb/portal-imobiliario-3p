/**
 * Extrai o ID do vídeo do YouTube a partir de URL ou ID puro.
 *
 * Aceita:
 * - https://www.youtube.com/watch?v=ABC123XYZ
 * - https://youtu.be/ABC123XYZ
 * - ABC123XYZ (ID puro, 11 caracteres alfanuméricos, hífens e underscores)
 *
 * @returns O ID do vídeo ou null se inválido
 */
export function parseYouTubeVideoId(input: string | null | undefined): string | null {
  const trimmed = input?.trim();
  if (!trimmed) return null;

  // ID puro: 11 caracteres (padrão do YouTube)
  const idOnlyMatch = trimmed.match(/^[\w-]{11}$/);
  if (idOnlyMatch) return idOnlyMatch[0];

  // youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?.*v=)([\w-]{11})/);
  if (watchMatch) return watchMatch[1];

  // youtu.be/ID
  const shortMatch = trimmed.match(/youtu\.be\/([\w-]{11})/);
  if (shortMatch) return shortMatch[1];

  return null;
}
