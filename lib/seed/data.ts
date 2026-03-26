// ---------------------------------------------------------------------------
// Dados mestres para seed programático do portal imobiliário
//
// Fonte única de verdade para estados, cidades e bairros.
// Garante consistência de slugs entre seed-properties e seed-blog.
// ---------------------------------------------------------------------------

export type StateEntry = {
  stateSlug: string;
  state: string;
};

export type CityEntry = {
  stateSlug: string;
  citySlug: string;
  city: string;
};

export type NeighborhoodEntry = {
  citySlug: string;
  neighborhoodSlug: string;
  neighborhood: string;
};

// ---------------------------------------------------------------------------
// Estados — hierarquia geográfica nível 1
// ---------------------------------------------------------------------------

export const SEED_STATES: StateEntry[] = [
  { stateSlug: "sao-paulo", state: "São Paulo" },
  { stateSlug: "rio-de-janeiro", state: "Rio de Janeiro" },
  { stateSlug: "minas-gerais", state: "Minas Gerais" },
];

// ---------------------------------------------------------------------------
// Cidades — hierarquia geográfica nível 2
// ---------------------------------------------------------------------------

export const SEED_CITIES: CityEntry[] = [
  // São Paulo
  { stateSlug: "sao-paulo", citySlug: "sao-paulo", city: "São Paulo" },
  { stateSlug: "sao-paulo", citySlug: "campinas", city: "Campinas" },
  { stateSlug: "sao-paulo", citySlug: "santos", city: "Santos" },
  { stateSlug: "sao-paulo", citySlug: "ribeirao-preto", city: "Ribeirão Preto" },
  // Rio de Janeiro
  { stateSlug: "rio-de-janeiro", citySlug: "rio-de-janeiro", city: "Rio de Janeiro" },
  { stateSlug: "rio-de-janeiro", citySlug: "niteroi", city: "Niterói" },
  { stateSlug: "rio-de-janeiro", citySlug: "petropolis", city: "Petrópolis" },
  // Minas Gerais
  { stateSlug: "minas-gerais", citySlug: "belo-horizonte", city: "Belo Horizonte" },
  { stateSlug: "minas-gerais", citySlug: "uberlandia", city: "Uberlândia" },
  { stateSlug: "minas-gerais", citySlug: "juiz-de-fora", city: "Juiz de Fora" },
];

// ---------------------------------------------------------------------------
// Bairros — hierarquia geográfica nível 3
// ---------------------------------------------------------------------------

export const SEED_NEIGHBORHOODS: NeighborhoodEntry[] = [
  // São Paulo (capital)
  { citySlug: "sao-paulo", neighborhoodSlug: "pinheiros", neighborhood: "Pinheiros" },
  { citySlug: "sao-paulo", neighborhoodSlug: "vila-madalena", neighborhood: "Vila Madalena" },
  { citySlug: "sao-paulo", neighborhoodSlug: "jardins", neighborhood: "Jardins" },
  { citySlug: "sao-paulo", neighborhoodSlug: "moema", neighborhood: "Moema" },
  { citySlug: "sao-paulo", neighborhoodSlug: "vila-olimpia", neighborhood: "Vila Olímpia" },
  { citySlug: "sao-paulo", neighborhoodSlug: "itaim-bibi", neighborhood: "Itaim Bibi" },
  { citySlug: "sao-paulo", neighborhoodSlug: "centro", neighborhood: "Centro" },
  // Campinas
  { citySlug: "campinas", neighborhoodSlug: "cambui", neighborhood: "Cambuí" },
  { citySlug: "campinas", neighborhoodSlug: "taquaral", neighborhood: "Taquaral" },
  { citySlug: "campinas", neighborhoodSlug: "centro", neighborhood: "Centro" },
  // Santos
  { citySlug: "santos", neighborhoodSlug: "gonzaga", neighborhood: "Gonzaga" },
  { citySlug: "santos", neighborhoodSlug: "boqueirao", neighborhood: "Boqueirão" },
  { citySlug: "santos", neighborhoodSlug: "centro", neighborhood: "Centro" },
  // Ribeirão Preto
  { citySlug: "ribeirao-preto", neighborhoodSlug: "centro", neighborhood: "Centro" },
  { citySlug: "ribeirao-preto", neighborhoodSlug: "alto-da-boa-vista", neighborhood: "Alto da Boa Vista" },
  // Rio de Janeiro
  { citySlug: "rio-de-janeiro", neighborhoodSlug: "copacabana", neighborhood: "Copacabana" },
  { citySlug: "rio-de-janeiro", neighborhoodSlug: "ipanema", neighborhood: "Ipanema" },
  { citySlug: "rio-de-janeiro", neighborhoodSlug: "leblon", neighborhood: "Leblon" },
  { citySlug: "rio-de-janeiro", neighborhoodSlug: "barra-da-tijuca", neighborhood: "Barra da Tijuca" },
  { citySlug: "rio-de-janeiro", neighborhoodSlug: "centro", neighborhood: "Centro" },
  // Niterói
  { citySlug: "niteroi", neighborhoodSlug: "icarai", neighborhood: "Icaraí" },
  { citySlug: "niteroi", neighborhoodSlug: "centro", neighborhood: "Centro" },
  // Petrópolis
  { citySlug: "petropolis", neighborhoodSlug: "centro", neighborhood: "Centro" },
  { citySlug: "petropolis", neighborhoodSlug: "valparaiso", neighborhood: "Valparaíso" },
  // Belo Horizonte
  { citySlug: "belo-horizonte", neighborhoodSlug: "savassi", neighborhood: "Savassi" },
  { citySlug: "belo-horizonte", neighborhoodSlug: "lourdes", neighborhood: "Lourdes" },
  { citySlug: "belo-horizonte", neighborhoodSlug: "funcionarios", neighborhood: "Funcionários" },
  { citySlug: "belo-horizonte", neighborhoodSlug: "centro", neighborhood: "Centro" },
  // Uberlândia
  { citySlug: "uberlandia", neighborhoodSlug: "centro", neighborhood: "Centro" },
  { citySlug: "uberlandia", neighborhoodSlug: "fundinho", neighborhood: "Fundinho" },
  // Juiz de Fora
  { citySlug: "juiz-de-fora", neighborhoodSlug: "centro", neighborhood: "Centro" },
];

// ---------------------------------------------------------------------------
// Tipos de imóvel — alinhado com PROPERTY_TYPE_LABELS em lib/seo.ts
// ---------------------------------------------------------------------------

export const SEED_PROPERTY_TYPES = [
  { slug: "casa", type: "CASA" as const },
  { slug: "apartamento", type: "APARTAMENTO" as const },
  { slug: "cobertura", type: "COBERTURA" as const },
  { slug: "terreno", type: "TERRENO" as const },
  { slug: "comercial", type: "COMERCIAL" as const },
  { slug: "studio", type: "STUDIO" as const },
] as const;
