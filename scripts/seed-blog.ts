/**
 * Seed programático de posts do blog para o portal imobiliário.
 * Executar com: pnpm seed:blog
 *
 * - Usa DIRECT_URL para conexão direta ao PostgreSQL
 * - Tags coerentes com lib/seed/data.ts (cidade:{slug}, bairro:{slug}, tipo:{slug})
 * - Seguro de re-executar: upsert não duplica posts
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

type PostSeed = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  publishedAt: Date;
};

const POSTS: PostSeed[] = [
  {
    slug: "financiamento-imobiliario-guia-completo",
    title: "Financiamento Imobiliário: Guia Completo para Comprar seu Imóvel",
    excerpt:
      "Entenda como funciona o financiamento imobiliário, quais os tipos disponíveis, como calcular parcelas e quais documentos são necessários para aprovar o crédito.",
    content: `<h2>O que é financiamento imobiliário?</h2>
<p>O financiamento imobiliário é uma modalidade de crédito que permite a compra de imóveis com pagamento parcelado em longo prazo. No Brasil, os principais sistemas são o SFH (Sistema Financeiro de Habitação) e o SFI (Sistema Financeiro Imobiliário).</p>
<h2>Tipos de financiamento</h2>
<ul>
<li><strong>Minha Casa Minha Vida (MCMV):</strong> Para famílias com renda de até R$ 8.000, com taxas subsidiadas pelo governo.</li>
<li><strong>SFH — Sistema Financeiro de Habitação:</strong> Para imóveis de até R$ 1,5 milhão, com taxa máxima de 12% ao ano.</li>
<li><strong>SFI — Sistema Financeiro Imobiliário:</strong> Para imóveis acima desse valor, com taxas negociadas livremente com o banco.</li>
</ul>
<h2>Dicas da 3Pinheiros</h2>
<p>Antes de iniciar o processo, simule o financiamento em pelo menos três bancos diferentes. Nossos consultores acompanham todo o processo — da escolha do imóvel até a assinatura do contrato. CRECI 1317J.</p>`,
    tags: ["tipo:apartamento", "tipo:casa"],
    publishedAt: new Date("2025-01-15T10:00:00.000Z"),
  },
  {
    slug: "comprar-apartamento-em-sao-paulo",
    title: "Como Comprar Apartamento em São Paulo: Passo a Passo",
    excerpt:
      "Guia prático para quem deseja comprar apartamento em São Paulo. Documentação, análise de bairros e dicas para fechar o melhor negócio.",
    content: `<h2>Por que investir em São Paulo?</h2>
<p>São Paulo concentra as principais oportunidades do mercado imobiliário brasileiro. Bairros como Pinheiros, Vila Madalena e Moema oferecem boa valorização e infraestrutura completa.</p>
<h2>Bairros em alta</h2>
<p>Pinheiros e Vila Madalena atraem jovens profissionais. Jardins e Moema são preferidos por famílias. A 3Pinheiros possui imóveis em todos esses bairros — consulte nosso portfólio.</p>
<h2>Documentação necessária</h2>
<p>RG, CPF, comprovante de renda e de residência. Para financiamento, a documentação bancária completa. Nossos consultores orientam em cada etapa.</p>`,
    tags: ["cidade:sao-paulo", "tipo:apartamento", "bairro:pinheiros", "bairro:vila-madalena"],
    publishedAt: new Date("2025-01-20T14:00:00.000Z"),
  },
  {
    slug: "imoveis-no-rio-de-janeiro-guia-de-bairros",
    title: "Imóveis no Rio de Janeiro: Guia de Bairros e Tendências",
    excerpt:
      "Conheça os melhores bairros do Rio para comprar ou alugar. Copacabana, Ipanema, Barra da Tijuca e mais.",
    content: `<h2>Copacabana e Ipanema</h2>
<p>Bairros clássicos com forte demanda de locação e compra. Apartamentos com vista para o mar valorizam acima da média.</p>
<h2>Barra da Tijuca</h2>
<p>Área em expansão, imóveis maiores e preços mais acessíveis. Ideal para famílias que buscam espaço e praia.</p>
<h2>Niterói e região metropolitana</h2>
<p>Icaraí em Niterói oferece qualidade de vida e preços competitivos. Petrópolis atrai quem busca clima serrano.</p>`,
    tags: ["cidade:rio-de-janeiro", "cidade:niteroi", "cidade:petropolis", "bairro:copacabana", "bairro:ipanema"],
    publishedAt: new Date("2025-01-25T09:00:00.000Z"),
  },
  {
    slug: "casa-ou-apartamento-o-que-escolher",
    title: "Casa ou Apartamento: O Que Escolher na Hora de Comprar?",
    excerpt:
      "Prós e contras de casas e apartamentos. Análise para ajudar na decisão de compra do seu imóvel.",
    content: `<h2>Vantagens do apartamento</h2>
<p>Segurança, praticidade, menos manutenção. Ideal para quem trabalha muito e busca conveniência.</p>
<h2>Vantagens da casa</h2>
<p>Mais espaço, privacidade, quintal. Melhor para famílias grandes ou quem gosta de áreas externas.</p>
<h2>E o terreno?</h2>
<p>Terrenos são opção para quem quer construir do zero ou investir a longo prazo. Considere localização e infraestrutura do loteamento.</p>`,
    tags: ["tipo:casa", "tipo:apartamento", "tipo:terreno"],
    publishedAt: new Date("2025-02-01T11:00:00.000Z"),
  },
  {
    slug: "mercado-imobiliario-belo-horizonte-2025",
    title: "Mercado Imobiliário em Belo Horizonte em 2025",
    excerpt:
      "Tendências do mercado de imóveis em BH. Savassi, Lourdes e Funcionários continuam em destaque.",
    content: `<h2>Bairros nobres de BH</h2>
<p>Savassi, Lourdes e Funcionários concentram os imóveis de alto padrão. Boa oferta de apartamentos e coberturas.</p>
<h2>Valorização e demanda</h2>
<p>Belo Horizonte mantém preços estáveis com demanda consistente. Ótima oportunidade para investidores.</p>
<h2>Como a 3Pinheiros pode ajudar</h2>
<p>Atuamos em Belo Horizonte e região metropolitana. Consulte nosso portfólio de imóveis em Savassi, Lourdes e Centro.</p>`,
    tags: ["cidade:belo-horizonte", "bairro:savassi", "bairro:lourdes", "bairro:funcionarios"],
    publishedAt: new Date("2025-02-05T16:00:00.000Z"),
  },
];

async function main() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL ou DATABASE_URL não encontrada.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  for (const post of POSTS) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { tags: post.tags },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags,
        published: true,
        publishedAt: post.publishedAt,
      },
    });
  }

  console.log("Seed de blog concluído:");
  console.log("  posts processados:", POSTS.length);
  console.log("  slugs:", POSTS.map((p) => p.slug).join(", "));

  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error("Erro no seed de blog:", err);
  process.exit(1);
});
