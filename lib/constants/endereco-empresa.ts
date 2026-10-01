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

/**
 * Coordenadas reais do escritório (Google Maps / cadastro).
 * Preencha quando tiver lat/lng confirmados; null = não emitir geo no JSON-LD.
 */
export const EMPRESA_GEO_COORDINATES: {
  latitude: number;
  longitude: number;
} | null = null;

/**
 * Cidades atendidas pela consultoria (JSON-LD areaServed na home).
 * Ajuste conforme operação comercial.
 */
export const EMPRESA_AREA_SERVED_CITIES = [
  "Fortaleza",
  "Caucaia",
  "Eusébio",
  "Aquiraz",
  "Maracanaú",
  "Jericoacoara",
  "Beberibe",
  "Cascavel",
] as const;

/** Horário de atendimento (Schema.org OpeningHoursSpecification). */
export type EmpresaOpeningHoursSpec = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
};

/** Atendimento 24 horas, todos os dias (confirmado pelo cliente). */
export const EMPRESA_OPENING_HOURS_SPEC: EmpresaOpeningHoursSpec[] = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
];

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
