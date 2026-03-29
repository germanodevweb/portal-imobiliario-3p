import type { Metadata } from "next";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import {
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  SITE_NAME,
} from "@/lib/seo";
import { submitContatoAction } from "@/lib/actions/contato";

const canonical = buildCanonicalUrl("/contato");

export const metadata: Metadata = {
  title: `Contato | ${SITE_NAME}`,
  description:
    "Entre em contato com a 3Pinheiros. Tire dúvidas via WhatsApp, chat online ou preencha o formulário. Consultoria imobiliária especializada. CRECI 1317J.",
  alternates: { canonical },
  openGraph: buildOpenGraph({
    title: `Contato | ${SITE_NAME}`,
    description:
      "Entre em contato com a 3Pinheiros. Tire dúvidas via WhatsApp, chat online ou preencha o formulário. CRECI 1317J.",
    url: canonical,
  }),
  twitter: buildTwitterCard({
    title: `Contato | ${SITE_NAME}`,
    description:
      "Entre em contato com a 3Pinheiros. Tire dúvidas via WhatsApp, chat online ou preencha o formulário. CRECI 1317J.",
  }),
  robots: { index: true, follow: true },
};

const ASSUNTO_OPCOES = [
  { value: "", label: "Escolha um assunto" },
  { value: "comprar-imovel", label: "Comprar imóvel" },
  { value: "vender-imovel", label: "Vender imóvel" },
  { value: "parceria", label: "Parceria" },
  { value: "reuniao-online", label: "Marcar uma reunião online" },
  { value: "outros", label: "Outros" },
] as const;

const WHATSAPP_URL = "https://wa.me/5511999999999";

export default function ContatoPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-zinc-50">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <h1 className="mb-10 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Fale conosco
          </h1>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
            {/* Sidebar — contato rápido (mesmo tom neutro da home) */}
            <aside className="flex flex-col gap-6">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50/80"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-50 ring-1 ring-zinc-200/80">
                  <svg
                    className="size-6 text-green-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Tire suas dúvidas rapidamente</p>
                  <p className="mt-0.5 font-medium text-zinc-900">Contato via WhatsApp</p>
                </div>
              </a>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50/80"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-50 ring-1 ring-zinc-200/80">
                  <svg
                    className="size-6 text-green-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Plantão de vendas</p>
                  <p className="mt-0.5 font-medium text-zinc-900">Chat Online</p>
                </div>
              </a>
            </aside>

            {/* Formulário — mesmos campos que LeadForm (home) */}
            <div className="relative">
              <form
                action={submitContatoAction}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 space-y-4"
              >
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-zinc-700">
                    Nome completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    required
                    autoComplete="name"
                    className="mt-1 block min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                    placeholder=""
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-zinc-700">
                      DDD + Celular
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      autoComplete="tel"
                      className="mt-1 block min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                      E-mail <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      autoComplete="email"
                      className="mt-1 block min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                      placeholder=""
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="assunto" className="block text-sm font-medium text-zinc-700">
                    Assunto <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="assunto"
                    name="assunto"
                    required
                    className="mt-1 block min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 [&>option]:bg-white [&>option]:text-zinc-900"
                  >
                    {ASSUNTO_OPCOES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="mensagem" className="block text-sm font-medium text-zinc-700">
                    Deixe sua mensagem <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    rows={4}
                    required
                    className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                    placeholder=""
                  />
                </div>

                <button
                  type="submit"
                  className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
                >
                  Enviar mensagem
                </button>
              </form>

              {/* Botão flutuante WhatsApp */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 flex size-14 items-center justify-center rounded-full bg-green-700 shadow-lg transition-all duration-300 hover:bg-linear-to-b hover:from-emerald-900 hover:via-green-800 hover:to-emerald-950 lg:bottom-8 lg:right-8"
                aria-label="Contato via WhatsApp"
              >
                <svg
                  className="size-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
