/** Opção serializável de bairro para filtros cidade → bairro (client + server). */
export type FilterLocationNeighborhood = {
  neighborhood: string;
  neighborhoodSlug: string;
  citySlug: string;
};
