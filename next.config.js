/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite acesso via IP de rede em desenvolvimento (não afeta produção)
  allowedDevOrigins: ["192.168.0.15", "192.168.0.107"],
  async redirects() {
    return [
      {
        source: "/imoveis/apartamentos-acima-15-milhao",
        destination: "/imoveis/alto-padrao",
        permanent: true,
      },
      // Migração Code 49 → novo portal (SEO 301)
      {
        source: "/696/imoveis/venda-chacara-trairi-ce",
        destination: "/imoveis/fazenda-em-trairi-ce-160-hectares-com-producao-ativa-peixe-e-camarao",
        permanent: true,
      },
      {
        source: "/695/imoveis/venda-apartamento-2-dormitorios-fortaleza-ce",
        destination: "/imoveis/oportunidade-no-coracao-do-meireles-edificio-villa-damasco",
        permanent: true,
      },
      {
        source: "/694/imoveis/venda-casa-6-dormitorios-pecem-sao-goncalo-do-amarante-ce",
        destination: "/imoveis/casa-duplex-espetacular-no-pecem-com-mais-de-4-600m-de-terreno",
        permanent: true,
      },
      {
        source: "/692/imoveis/venda-apartamento-2-dormitorios-presidente-kennedy-fortaleza-ce",
        destination: "/imoveis/jardino-passeio-kennedy-conectado-com-tudo-completo-como-voce-merece",
        permanent: true,
      },
      {
        source: "/691/imoveis/venda-apartamento-2-dormitorios-presidente-kennedy-fortaleza-ce",
        destination: "/imoveis/parque-dos-ipes-mais-que-morar-e-viver-bem-todos-os-dias",
        permanent: true,
      },
      {
        source: "/690/imoveis/venda-apartamento-2-dormitorios-jacarecanga-fortaleza-ce",
        destination: "/imoveis/viver-club-mais-que-morar-e-pertencer",
        permanent: true,
      },
      {
        source: "/689/imoveis/venda-apartamento-beira-mar-fortaleza-ce",
        destination: "/imoveis/q-tower-vista-panoramica-para-o-mar-e-53-andares-de-luxo-e-sofisticacao",
        permanent: true,
      },
      {
        source: "/688/imoveis/venda-apartamento-2-dormitorios-fortaleza-ce",
        destination: "/imoveis/marbello-residence-descubra-o-que-esta-surgindo-a-poucos-passos-do-mar",
        permanent: true,
      },
      {
        source: "/687/imoveis/venda-apartamento-aldeota-fortaleza-ce",
        destination: "/imoveis/aura-mais-que-localizacao-conexao-com-a-vida",
        permanent: true,
      },
      {
        source: "/686/imoveis/venda-casa-trairi-ce",
        destination: "/imoveis/the-coral-resort-unico-condominio-de-luxo-em-trairi-flecheiras",
        permanent: true,
      },
      {
        source: "/685/imoveis/venda-apartamento-3-dormitorios-papicu-fortaleza-ce",
        destination: "/imoveis/lancamento-no-papicu-bella-rio-a-venda-ao-lado-do-shopping-riomar",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.3pinheirosconsultoria.com.br",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "3pinheirosconsultoria.com.br",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
