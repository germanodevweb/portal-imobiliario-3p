const ADMIN_PROPERTY_EDIT_PATH = /^\/admin\/imoveis\/([^/]+)\/editar\/?$/;

/**
 * Resolve o ID do imóvel na rota /admin/imoveis/[id]/editar.
 * Fallback via x-pathname (middleware) quando params.id vem vazio no Next.js 16 + Turbopack.
 */
export function resolveAdminPropertyEditId(
  paramId: string | undefined,
  pathname: string | null | undefined
): string | null {
  const fromParam = paramId?.trim();
  if (fromParam) return fromParam;

  const fromPath = pathname?.match(ADMIN_PROPERTY_EDIT_PATH)?.[1]?.trim();
  return fromPath || null;
}
