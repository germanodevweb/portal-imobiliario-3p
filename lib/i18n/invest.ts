/**
 * Conteúdo multilíngue da página de investimento internacional.
 * Vitrine de imóveis a partir de R$ 350.000 — sem simulação de pagamento.
 */

export type InvestLocale = "pt" | "en" | "fr" | "es";

export type InvestContent = {
  locale: InvestLocale;
  route: string;
  hero: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaPrimaryHref: string;
  };
  listing: {
    title: string;
    empty: string;
    emptyHint: string;
    priceDisclaimer: string;
  };
  nar: {
    headline: string;
    associationLine: string;
    ethicalText: string;
    trustMessage: string;
    text: string;
    cta: string;
  };
  credibility: {
    title: string;
    description: string;
  };
  seo: {
    title: string;
    description: string;
  };
};

export const INVEST_ROUTES: Record<InvestLocale, string> = {
  pt: "/investir-no-brasil",
  en: "/en/invest-in-brazil",
  fr: "/fr/investir-au-bresil",
  es: "/es/invertir-en-brasil",
};

export const CONTENT_PT: InvestContent = {
  locale: "pt",
  route: INVEST_ROUTES.pt,
  hero: {
    title: "Investir em Imóveis no Brasil",
    subtitle: "Propriedades para investimento a partir de R$ 350.000",
    ctaPrimary: "Falar com um especialista",
    ctaSecondary: "Ver oportunidades de investimento",
    ctaPrimaryHref:
      "https://wa.me/5511999999999?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20investir%20em%20im%C3%B3veis%20no%20Brasil.",
  },
  listing: {
    title: "Oportunidades de investimento",
    empty: "Nenhum imóvel disponível no momento.",
    emptyHint: "Entre em contato para ser avisado quando surgirem novas oportunidades.",
    priceDisclaimer:
      "Os preços em EUR são estimativas baseadas na cotação atual e podem variar.",
  },
  nar: {
    headline: "Rede imobiliária global",
    associationLine: "Membro associado da National Association of REALTORS® (NAR)",
    ethicalText:
      "Como membros da National Association of REALTORS® (NAR), seguimos os mais altos padrões éticos. Podemos conectar qualquer negócio imobiliário em qualquer parte do mundo.",
    trustMessage: "Com a NAR, sua compra de imóvel no Brasil é mais segura.",
    text: "Somos membros da National Association of REALTORS® (NAR), conectando nossos clientes a oportunidades imobiliárias em qualquer lugar do mundo com profissionais de confiança.",
    cta: "Falar com um especialista global",
  },
  credibility: {
    title: "Consultor imobiliário internacional certificado",
    description:
      "Profissional certificado pela NAR (National Association of Realtors) com expertise em transações imobiliárias internacionais.",
  },
  seo: {
    title: "Investir em Imóveis no Brasil | 3Pinheiros",
    description:
      "Imóveis para investimento no Brasil a partir de R$ 350.000. Novos empreendimentos e oportunidades. Consultor internacional certificado.",
  },
};

export const CONTENT_EN: InvestContent = {
  locale: "en",
  route: INVEST_ROUTES.en,
  hero: {
    title: "Invest in Brazil Real Estate",
    subtitle: "",
    ctaPrimary: "Talk to a specialist",
    ctaSecondary: "View investment opportunities",
    ctaPrimaryHref: "https://wa.me/5511999999999?text=Hi%2C%20I%27m%20interested%20in%20investing%20in%20Brazil%20real%20estate.",
  },
  listing: {
    title: "Investment opportunities",
    empty: "No properties available at the moment.",
    emptyHint: "Contact us to be notified when new opportunities arise.",
    priceDisclaimer:
      "Prices shown in EUR are estimates based on the current exchange rate and may vary.",
  },
  nar: {
    headline: "Global Real Estate Network",
    associationLine: "Associate Member of the National Association of REALTORS® (NAR)",
    ethicalText:
      "As members of the National Association of REALTORS® (NAR), we adhere to the highest ethical standards. We can connect any real estate business anywhere in the world.",
    trustMessage: "With NAR, your property purchase in Brazil is more secure.",
    text: "We are proud members of the National Association of REALTORS® (NAR), connecting our clients to real estate opportunities anywhere in the world with trusted professionals.",
    cta: "Talk to a global specialist",
  },
  credibility: {
    title: "Certified international real estate advisor",
    description:
      "Professional certified by NAR (National Association of Realtors) with expertise in cross-border real estate transactions.",
  },
  seo: {
    title: "Invest in Brazil Real Estate | 3Pinheiros",
    description:
      "Properties for investment in Brazil from R$ 350,000. New developments and investment opportunities. Certified international advisor.",
  },
};

export const CONTENT_FR: InvestContent = {
  locale: "fr",
  route: INVEST_ROUTES.fr,
  hero: {
    title: "Investir dans l'immobilier au Brésil",
    subtitle: "",
    ctaPrimary: "Parler à un spécialiste",
    ctaSecondary: "Voir les opportunités d'investissement",
    ctaPrimaryHref: "https://wa.me/5511999999999?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20l%27investissement%20immobilier%20au%20Br%C3%A9sil.",
  },
  listing: {
    title: "Opportunités d'investissement",
    empty: "Aucun bien disponible pour le moment.",
    emptyHint: "Contactez-nous pour être informé des nouvelles opportunités.",
    priceDisclaimer:
      "Les prix en EUR sont des estimations basées sur le taux de change actuel et peuvent varier.",
  },
  nar: {
    headline: "Réseau immobilier mondial",
    associationLine: "Membre associé de la National Association of REALTORS® (NAR)",
    ethicalText:
      "En tant que membres de la National Association of REALTORS® (NAR), nous respectons les standards éthiques les plus élevés. Nous pouvons connecter toute entreprise immobilière partout dans le monde.",
    trustMessage: "Avec la NAR, votre achat immobilier au Brésil est plus sécurisé.",
    text: "Nous sommes fiers d'être membres de la National Association of REALTORS® (NAR), reliant nos clients aux opportunités immobilières partout dans le monde avec des professionnels de confiance.",
    cta: "Parler à un spécialiste international",
  },
  credibility: {
    title: "Conseiller immobilier international certifié",
    description:
      "Professionnel certifié par la NAR (National Association of Realtors) avec expertise en transactions immobilières transfrontalières.",
  },
  seo: {
    title: "Investir au Brésil | 3Pinheiros",
    description:
      "Biens pour investissement au Brésil à partir de R$ 350 000. Nouveaux programmes et opportunités d'investissement.",
  },
};

export const CONTENT_ES: InvestContent = {
  locale: "es",
  route: INVEST_ROUTES.es,
  hero: {
    title: "Invertir en inmuebles en Brasil",
    subtitle: "Propiedades para inversión desde R$ 350.000",
    ctaPrimary: "Hablar con un especialista",
    ctaSecondary: "Ver oportunidades de inversión",
    ctaPrimaryHref: "https://wa.me/5511999999999?text=Hola%2C%20estoy%20interesado%20en%20invertir%20en%20inmuebles%20en%20Brasil.",
  },
  listing: {
    title: "Oportunidades de inversión",
    empty: "No hay propiedades disponibles en este momento.",
    emptyHint: "Contáctenos para ser notificado cuando surjan nuevas oportunidades.",
    priceDisclaimer:
      "Los precios en EUR son estimaciones basadas en el tipo de cambio actual y pueden variar.",
  },
  nar: {
    headline: "Red inmobiliaria global",
    associationLine: "Miembro asociado de la National Association of REALTORS® (NAR)",
    ethicalText:
      "Como miembros de la National Association of REALTORS® (NAR), cumplimos con los más altos estándares éticos. Podemos conectar cualquier negocio inmobiliario en cualquier parte del mundo.",
    trustMessage: "Con la NAR, tu compra de propiedad en Brasil es más segura.",
    text: "Somos miembros orgullosos de la National Association of REALTORS® (NAR), conectando a nuestros clientes con oportunidades inmobiliarias en cualquier parte del mundo con profesionales de confianza.",
    cta: "Hablar con un especialista global",
  },
  credibility: {
    title: "Asesor inmobiliario internacional certificado",
    description:
      "Profesional certificado por NAR (National Association of Realtors) con experiencia en transacciones inmobiliarias transfronterizas.",
  },
  seo: {
    title: "Invertir en Brasil | 3Pinheiros",
    description:
      "Propiedades para inversión en Brasil desde R$ 350.000. Nuevos desarrollos y oportunidades de inversión.",
  },
};
