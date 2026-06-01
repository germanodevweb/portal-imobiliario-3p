/**
 * Endereço oficial da 3 Pinheiros (NAP — alinhado ao rodapé e JSON-LD).
 */
export const EMPRESA_POSTAL_ADDRESS = {
  streetAddress: "Rua Desembargador João Firmino, n° 74",
  addressNeighborhood: "Montese",
  addressLocality: "Fortaleza",
  addressRegion: "CE",
  postalCode: "60425-560",
  addressCountry: "BR",
} as const;

export function buildEmpresaPostalAddressJsonLd(): Record<string, string> {
  return {
    "@type": "PostalAddress",
    ...EMPRESA_POSTAL_ADDRESS,
  };
}

/** Linhas exibidas no rodapé e páginas de contato. */
export const EMPRESA_ENDERECO_DISPLAY = {
  linha1: EMPRESA_POSTAL_ADDRESS.streetAddress,
  linha2: `${EMPRESA_POSTAL_ADDRESS.addressNeighborhood} — CEP ${EMPRESA_POSTAL_ADDRESS.postalCode}`,
  linha3: `${EMPRESA_POSTAL_ADDRESS.addressLocality} — ${EMPRESA_POSTAL_ADDRESS.addressRegion}`,
} as const;

export function buildEmpresaMapsSearchQuery(): string {
  const { streetAddress, addressNeighborhood, addressLocality, addressRegion, postalCode } =
    EMPRESA_POSTAL_ADDRESS;
  return `3 Pinheiros Consultoria Imobiliária ${streetAddress} ${addressNeighborhood} ${addressLocality} ${addressRegion} ${postalCode}`;
}
