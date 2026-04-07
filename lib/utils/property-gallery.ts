/**
 * Monta a lista de imagens da galeria do imóvel (mesma ordem lógica da página).
 * Usado no Server Component; dados serializáveis para o Client Component.
 *
 * Prioridade de dados (alinhada à migração Code49 + admin):
 * 1. PropertyImage (consulta pública: isHidden=false, orderBy isPrimary desc, sortOrder asc)
 * 2. featuredImage / featuredImageAlt — reordenam a capa quando batem com uma URL da lista
 * 3. Se featured não existir em PropertyImage, insere capa explícita (ex.: migração parcial)
 * 4. Sem PropertyImage: fallback featuredImage + galleryImages (legado)
 */

import { normalizePublicImageUrl } from "@/lib/utils/normalize-image-url";

export type PropertyGalleryItem = {
  url: string;
  alt: string;
};

type PropertyLike = {
  title: string;
  city: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  galleryImages: string[];
  images: readonly { url: string; alt: string | null }[];
};

function dedupeByUrl(items: PropertyGalleryItem[]): PropertyGalleryItem[] {
  const seen = new Set<string>();
  const out: PropertyGalleryItem[] = [];
  for (const item of items) {
    const u = normalizePublicImageUrl(item.url).trim();
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push({
      ...item,
      url: u,
      alt: item.alt,
    });
  }
  return out;
}

export function buildPropertyGalleryItems(property: PropertyLike): PropertyGalleryItem[] {
  const baseAlt = `${property.title} — ${property.city}`;

  if (property.images.length > 0) {
    const fromDb: PropertyGalleryItem[] = property.images.map((img, i) => ({
      url: normalizePublicImageUrl(img.url),
      alt: img.alt?.trim() || `${baseAlt} — foto ${i + 1}`,
    }));

    const featured = property.featuredImage?.trim();
    if (!featured) return dedupeByUrl(fromDb);

    const featuredNorm = normalizePublicImageUrl(featured);
    const idx = fromDb.findIndex(
      (x) => normalizePublicImageUrl(x.url) === featuredNorm
    );
    if (idx === -1) {
      const capa: PropertyGalleryItem = {
        url: featuredNorm,
        alt: property.featuredImageAlt?.trim() || baseAlt,
      };
      return dedupeByUrl([capa, ...fromDb]);
    }
    if (idx === 0) return dedupeByUrl(fromDb);

    const copy = [...fromDb];
    const [capa] = copy.splice(idx, 1);
    return dedupeByUrl([capa, ...copy]);
  }

  const out: PropertyGalleryItem[] = [];

  const push = (url: string, alt: string) => {
    const u = normalizePublicImageUrl(url).trim();
    if (!u) return;
    out.push({ url: u, alt });
  };

  if (property.featuredImage?.trim()) {
    push(
      property.featuredImage,
      property.featuredImageAlt?.trim() || baseAlt
    );
  }

  for (const url of property.galleryImages) {
    if (!url?.trim()) continue;
    push(url, `${baseAlt} — foto ${out.length + 1}`);
  }

  return dedupeByUrl(out);
}

export type PropertyGalleryBadge = {
  id: string;
  label: string;
  className: string;
};
