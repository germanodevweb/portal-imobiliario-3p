// ---------------------------------------------------------------------------
// Governança de indexação para páginas programáticas
//
// POR QUE CENTRALIZAR AQUI:
// Em SEO programático, a maior ameaça é acumular páginas com "thin content"
// (conteúdo raso). O Google penaliza domínios com muitas páginas de baixa
// qualidade — o impacto é sentido em todo o site, não só nas páginas fracas.
//
// Esta camada define as regras de qualidade em um único lugar.
// Ajustar um threshold aqui afeta todas as páginas daquele tipo de entidade
// sem precisar editar múltiplos page.tsx.
//
// DISTINÇÃO IMPORTANTE:
//   shouldExist  → controla notFound() — a página existe?
//   shouldIndex  → controla robots meta — o Google deve indexar?
//
// Essas são decisões independentes. Uma página pode existir (não gerar 404)
// mas ter noindex caso esteja abaixo do threshold de qualidade.
// Isso é mais seguro do que retornar 404 para URLs que o Google já conhece.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Tipos de página programática suportados
// ---------------------------------------------------------------------------

/**
 * Identificador do tipo de página programática.
 * Cada tipo pode ter seu próprio threshold independente.
 */
export type PageType =
  | "state"              // /estado/[stateSlug]
  | "stateCity"          // /estado/[stateSlug]/cidade/[citySlug]
  | "city"               // /cidade/[slug]
  | "neighborhood"       // /bairro/[slug]
  | "propertyType"       // /tipo/[slug]
  | "propertyTypeCity"   // /tipo/[typeSlug]/cidade/[citySlug]
  | "neighborhoodType"   // /bairro/[slug]/tipo/[typeSlug]
  | "cityNeighborhood"   // /cidade/[citySlug]/bairro/[slug]
  | "buyTypeCity"        // /comprar/[typeSlug]/[citySlug]
  | "buyTypeCityNeighborhood";  // /comprar/[typeSlug]/[citySlug]/[neighborhoodSlug]

// ---------------------------------------------------------------------------
// Thresholds mínimos por tipo de entidade
//
// COMO USAR NO FUTURO:
// Para endurecer o critério de indexação de bairros, por exemplo:
//   neighborhood: 3   → exige ao menos 3 imóveis para indexar
//
// Com threshold > 1 o comportamento muda assim:
//   0 imóveis    → shouldExist: false (404)
//   1–(N-1)      → shouldExist: true, shouldIndex: false (noindex)
//   N ou mais    → shouldExist: true, shouldIndex: true  (index)
//
// Valores ajustados por sensibilidade a thin content:
//   - neighborhood, neighborhoodType, cityNeighborhood, buyTypeCityNeighborhood: 2
//     (páginas de bairro têm maior risco de sobreposição e conteúdo fino)
//   - demais: 1 (mantido para não gerar 404 em catálogos pequenos)
// ---------------------------------------------------------------------------

export const INDEXATION_THRESHOLDS: Record<PageType, number> = {
  state: 1,
  stateCity: 1,
  city: 1,
  neighborhood: 2,
  propertyType: 1,
  propertyTypeCity: 1,
  neighborhoodType: 2,
  cityNeighborhood: 2,
  buyTypeCity: 1,
  buyTypeCityNeighborhood: 2,
};

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type IndexationContext = {
  /** Tipo da página programática — determina qual threshold aplicar. */
  pageType: PageType;

  /** Quantidade de imóveis published = true para a entidade. */
  publishedCount: number;
};

export type IndexationResult = {
  /**
   * true  → renderizar normalmente.
   * false → chamar notFound() para retornar 404.
   */
  shouldExist: boolean;

  /**
   * true  → robots: index, follow.
   * false → robots: noindex, follow.
   *
   * Pode ser false mesmo com shouldExist true — quando a página renderiza
   * mas está abaixo do threshold e não deve entrar no índice do Google.
   */
  shouldIndex: boolean;
};

// ---------------------------------------------------------------------------
// Lógica principal
// ---------------------------------------------------------------------------

/**
 * Avalia se uma página programática deve existir e ser indexada,
 * aplicando o threshold específico do tipo de entidade.
 *
 * @example
 * const evaluation = evaluateIndexation({ pageType: "city", publishedCount: count });
 * if (!evaluation.shouldExist) notFound();
 * // em generateMetadata:
 * robots: buildRobotsDirective(evaluation)
 */
export function evaluateIndexation(ctx: IndexationContext): IndexationResult {
  const { pageType, publishedCount } = ctx;
  const threshold = INDEXATION_THRESHOLDS[pageType];

  // Sem nenhum imóvel publicado: a página não deve existir nem ser indexada.
  if (publishedCount === 0) {
    return { shouldExist: false, shouldIndex: false };
  }

  // Abaixo do threshold mínimo: a página existe (sem 404) mas recebe noindex.
  // Com threshold = 1 esta condição nunca é ativada.
  // Aumentar INDEXATION_THRESHOLDS[pageType] para ativar noindex em páginas
  // com estoque baixo sem gerar 404 para URLs que o Google já conhece.
  if (publishedCount < threshold) {
    return { shouldExist: true, shouldIndex: false };
  }

  // Acima do threshold: indexar normalmente.
  return { shouldExist: true, shouldIndex: true };
}

// ---------------------------------------------------------------------------
// Utilitário para generateMetadata
// ---------------------------------------------------------------------------

/**
 * Converte IndexationResult no formato aceito pelo campo `robots` do Next.js.
 *
 * @example
 * return {
 *   title,
 *   robots: buildRobotsDirective(evaluation),
 * };
 */
export function buildRobotsDirective(result: IndexationResult) {
  return {
    index: result.shouldIndex,
    follow: true,
  };
}
