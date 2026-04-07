export const BLOG_POST_TYPES = [
  "investimento",
  "financiamento",
  "regiao",
  "guia",
] as const;

export type BlogPostType = (typeof BLOG_POST_TYPES)[number];

export function getBlogPostTypeLabel(type: BlogPostType): string {
  const labels: Record<BlogPostType, string> = {
    investimento: "Investimento",
    financiamento: "Financiamento",
    regiao: "Região",
    guia: "Guia",
  };
  return labels[type];
}
