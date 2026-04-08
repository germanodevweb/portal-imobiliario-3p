"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Post, PostType } from "@/lib/generated/prisma/client";
import {
  savePostAction,
  searchPropertiesForBlog,
  getPropertiesByIdsForBlog,
  type BlogPropertySearchResult,
} from "@/lib/admin/blog-actions";
import { Sparkles, Loader2, Search, Plus, X } from "lucide-react";

type Props = {
  initialData?: Post;
};

const ADMIN_POST_SAVE_FORM_ID = "admin-post-save";

function slugifyPostTitle(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-");
}

export function AdminPostForm({ initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [aiTheme, setAiTheme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  /** Confirmação visível após a API devolver conteúdo (evita confusão com autofill do browser). */
  const [aiFilledAt, setAiFilledAt] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    type: initialData?.type || PostType.ARTIGO,
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    citySlug: initialData?.citySlug || "",
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    featuredImage: initialData?.featuredImage || "",
    published: initialData?.published || false,
    relatedPropertyIds: initialData?.relatedPropertyIds || [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BlogPropertySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<BlogPropertySearchResult[]>([]);

  // Carregar propriedades já vinculadas ao abrir
  useEffect(() => {
    if (initialData?.relatedPropertyIds && initialData.relatedPropertyIds.length > 0) {
      getPropertiesByIdsForBlog(initialData.relatedPropertyIds).then((props) => {
        setSelectedProperties(props);
      });
    }
  }, [initialData]);

  // Efeito de busca (debounce simples)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        searchPropertiesForBlog(searchQuery).then((results) => {
          setSearchResults(results);
          setIsSearching(false);
        });
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (aiFilledAt === null) return;
    const t = window.setTimeout(() => setAiFilledAt(null), 20_000);
    return () => window.clearTimeout(t);
  }, [aiFilledAt]);

  const handleAddProperty = (prop: BlogPropertySearchResult) => {
    if (!selectedProperties.find((p) => p.id === prop.id)) {
      const newSelected = [...selectedProperties, prop];
      setSelectedProperties(newSelected);
      setFormData((prev) => ({
        ...prev,
        relatedPropertyIds: newSelected.map((p) => p.id),
      }));
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveProperty = (idToRemove: string) => {
    const newSelected = selectedProperties.filter((p) => p.id !== idToRemove);
    setSelectedProperties(newSelected);
    setFormData((prev) => ({
      ...prev,
      relatedPropertyIds: newSelected.map((p) => p.id),
    }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => {
      const newState = { ...prev, title };
      // Auto-gerar slug apenas se for um post novo e o slug atual estiver vazio ou igual ao título gerado anteriormente
      if (!initialData && (!prev.slug || prev.slug === slugifyPostTitle(prev.title))) {
        newState.slug = slugifyPostTitle(title);
      }
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.slug || !formData.content) {
      setError("Título, Slug e Conteúdo são campos obrigatórios.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await savePostAction({
          id: initialData?.id,
          title: formData.title,
          slug: formData.slug,
          type: formData.type as PostType,
          excerpt: formData.excerpt,
          content: formData.content,
          citySlug: formData.citySlug,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          featuredImage: formData.featuredImage,
          published: formData.published,
          relatedPropertyIds: formData.relatedPropertyIds,
        });

        if (res.success) {
          router.push("/admin/blog");
          router.refresh();
        }
      } catch (err) {
        console.error("Erro ao salvar post:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido ao salvar o post.");
      }
    });
  };

  const handleGenerateAI = async () => {
    if (!aiTheme.trim()) {
      setError("Por favor, informe um tema para gerar o artigo.");
      return;
    }

    setError(null);
    setIsGenerating(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 120_000);

    try {
      const httpRes = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ theme: aiTheme.trim() }),
        signal: controller.signal,
      });

      const rawText = await httpRes.text();
      let res: unknown;
      try {
        res = rawText ? JSON.parse(rawText) : null;
      } catch {
        setError(
          `Resposta inválida do servidor (${httpRes.status}). Veja o terminal onde corre \`pnpm dev\`.`
        );
        return;
      }

      const payload = res as
        | { success: true; data: { title: string; metaDescription: string; content: string } }
        | { success: false; error?: string; message?: string }
        | { error?: string };

      if (!httpRes.ok || !payload || typeof payload !== "object" || !("success" in payload) || !payload.success) {
        const msg =
          payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof (payload as { error: unknown }).error === "string"
            ? (payload as { error: string }).error
            : `Erro ${httpRes.status} ao gerar artigo.`;
        setError(msg);
        return;
      }

      const { title, metaDescription, content } = payload.data;
      if (
        typeof title !== "string" ||
        typeof metaDescription !== "string" ||
        typeof content !== "string"
      ) {
        setError("Resposta da API em formato inválido (campos em falta).");
        return;
      }
      const plain = content.replace(/<[^>]+>/g, "").trim();
      if (!title.trim() || plain.length < 20) {
        setError(
          "A resposta da IA veio vazia ou incompleta. Verifique GEMINI_API_KEY no .env, tente de novo em instantes ou use um tema em texto (não só URL)."
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        title: title.trim(),
        slug: initialData ? prev.slug : slugifyPostTitle(title.trim()),
        metaTitle: title.trim(),
        metaDescription: metaDescription.trim(),
        content: content.trim(),
        excerpt: metaDescription.trim(),
      }));
      setAiFilledAt(Date.now());
    } catch (err) {
      console.error("Erro na geração por IA:", err);
      if (err instanceof Error && err.name === "AbortError") {
        setError(
          "Tempo limite (2 min) excedido. A API Gemini pode estar lenta ou sem quota — tente de novo mais tarde."
        );
        return;
      }
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : err &&
                typeof err === "object" &&
                "message" in err &&
                typeof (err as { message: unknown }).message === "string"
              ? (err as { message: string }).message
              : "Erro de rede ou servidor ao chamar a IA. Recarregue a página e tente de novo.";
      setError(msg);
    } finally {
      window.clearTimeout(timeoutId);
      setIsGenerating(false);
    }
  };

  /** Enter em input de uma linha não dispara submit nativo (só o botão «Salvar»). */
  const handlePostFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") return;
    const target = e.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    if (target instanceof HTMLInputElement) {
      const t = target.type;
      if (t === "checkbox" || t === "radio" || t === "submit" || t === "button") return;
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-8 pb-12 text-zinc-950">
      {error && (
        <div
          role="alert"
          className="rounded-lg border-2 border-red-400 bg-white p-4 text-sm font-medium text-red-900 shadow-md dark:border-red-500 dark:bg-red-950/95 dark:text-red-50"
        >
          {error}
        </div>
      )}

      {aiFilledAt !== null &&
        formData.title.trim().length > 0 &&
        formData.content.trim().length > 40 && (
        <div
          role="status"
          className="rounded-lg border-2 border-emerald-500 bg-white p-4 text-sm font-medium text-emerald-900 shadow-md"
        >
          Conteúdo gerado pela IA aplicado ao formulário abaixo. Confira título, slug e corpo do artigo
          antes de salvar. (O texto nos campos brancos é escuro; se não vir nada, faça scroll até «Conteúdo
          do Artigo».)
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-6 md:col-span-2 lg:col-span-2">
          {/* Gerador IA — fora do <form> para Enter/botões não interferirem com «Salvar». */}
          <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-blue-900">Gerar com Inteligência Artificial</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="aiTheme" className="mb-1 block text-sm font-medium text-blue-800">
                  Qual o tema do artigo?
                </label>
                <input
                  id="aiTheme"
                  name="blog_ai_theme_only"
                  type="text"
                  value={aiTheme}
                  onChange={(e) => setAiTheme(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!isGenerating && aiTheme.trim()) void handleGenerateAI();
                    }
                  }}
                  className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-blue-300/80 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: Por que Balneário Camboriú é o melhor lugar para investir?"
                  disabled={isGenerating}
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                onClick={() => void handleGenerateAI()}
                disabled={isGenerating || !aiTheme.trim()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Gerar Artigo
                  </>
                )}
              </button>
            </div>
            <p className="mt-3 text-xs text-blue-600/80">
              A IA irá gerar o conteúdo, o SEO e os metadados. Você poderá revisar tudo antes de salvar.
            </p>
            <p className="mt-1 text-xs text-blue-700/90">
              A geração pode levar 30–90 segundos. No plano gratuito do Gemini há limites de quota por
              modelo; se um modelo atingir o limite, o sistema tenta outro automaticamente.
            </p>
          </section>

          <form
            id={ADMIN_POST_SAVE_FORM_ID}
            onSubmit={handleSubmit}
            onKeyDown={handlePostFormKeyDown}
            autoComplete="off"
            className="space-y-6 text-zinc-950"
          >
          {/* Informações Principais */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Informações Principais</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-1 block text-sm font-medium text-zinc-700">
                  Título do Artigo *
                </label>
                <input
                  id="title"
                  name="admin_post_title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Ex: Como investir no mercado imobiliário em 2025"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="slug" className="mb-1 block text-sm font-medium text-zinc-700">
                  URL Amigável (Slug) *
                </label>
                <input
                  id="slug"
                  name="admin_post_slug"
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-mono text-zinc-950 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="ex: como-investir-em-2025"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="excerpt" className="mb-1 block text-sm font-medium text-zinc-700">
                  Resumo / Linha Fina
                </label>
                <textarea
                  id="excerpt"
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Pequeno resumo que aparecerá nos cards de listagem."
                />
              </div>
            </div>
          </section>

          {/* Conteúdo */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Conteúdo do Artigo *</h2>
            </div>
            
            <div>
              <textarea
                id="content"
                required
                rows={20}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-mono leading-relaxed text-zinc-950 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="<p>Escreva o conteúdo em HTML simples aqui...</p>"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Para esta etapa (Etapa A), insira o conteúdo utilizando tags HTML simples como &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;ul&gt; e &lt;li&gt;.
              </p>
            </div>
          </section>

          {/* Vinculação de Imóveis */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Imóveis Vinculados</h2>
            <div className="space-y-4">
              {/* Busca */}
              <div className="relative">
                <label htmlFor="searchProperty" className="mb-1 block text-sm font-medium text-zinc-700">
                  Buscar Imóvel (Nome ou Cidade)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    id="searchProperty"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white pl-10 pr-10 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Digite para buscar..."
                    autoComplete="off"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />
                  )}
                </div>

                {/* Resultados da busca */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
                    {searchResults.map((prop) => (
                      <button
                        key={prop.id}
                        type="button"
                        onClick={() => handleAddProperty(prop)}
                        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-zinc-50"
                      >
                        <div className="min-w-0 pr-4">
                          <p className="truncate font-medium text-zinc-900">{prop.title}</p>
                          <p className="text-xs text-zinc-500">{prop.city} • R$ {prop.price.toLocaleString("pt-BR")}</p>
                        </div>
                        <Plus className="h-4 w-4 shrink-0 text-green-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Imóveis selecionados */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-700">Imóveis selecionados:</p>
                {selectedProperties.length === 0 ? (
                  <p className="text-sm italic text-zinc-500">Nenhum imóvel vinculado.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedProperties.map((prop) => (
                      <li
                        key={prop.id}
                        className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
                      >
                        <div className="min-w-0 pr-4">
                          <p className="truncate text-sm font-medium text-zinc-900">{prop.title}</p>
                          <p className="text-xs text-zinc-500">{prop.city} • R$ {prop.price.toLocaleString("pt-BR")}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProperty(prop.id)}
                          className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                          title="Remover vínculo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
          </form>
        </div>

        {/* Barra Lateral (Configurações e SEO) */}
        <div className="space-y-6 text-zinc-950 md:col-span-1 lg:col-span-1">
          
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Publicação</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  id="published"
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="published" className="text-sm font-medium text-zinc-700">
                  Publicar agora
                </label>
              </div>

              <div>
                <label htmlFor="type" className="mb-1 block text-sm font-medium text-zinc-700">
                  Tipo de Conteúdo
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as PostType })}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value={PostType.ARTIGO}>Artigo Comum</option>
                  <option value={PostType.GUIA}>Guia Definitivo</option>
                  <option value={PostType.NOTICIA}>Notícia de Mercado</option>
                  <option value={PostType.INVESTIMENTO}>Análise de Investimento</option>
                </select>
              </div>

              <div>
                <label htmlFor="citySlug" className="mb-1 block text-sm font-medium text-zinc-700">
                  Slug da Cidade (SEO Local)
                </label>
                <input
                  id="citySlug"
                  type="text"
                  value={formData.citySlug}
                  onChange={(e) => setFormData({ ...formData, citySlug: e.target.value })}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="ex: balneario-camboriu"
                />
              </div>

              <div>
                <label htmlFor="featuredImage" className="mb-1 block text-sm font-medium text-zinc-700">
                  Imagem de Destaque (URL)
                </label>
                <input
                  id="featuredImage"
                  type="url"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">SEO Técnico</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="metaTitle" className="mb-1 block text-sm font-medium text-zinc-700">
                  Meta Title
                </label>
                <input
                  id="metaTitle"
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Título para o Google (50-60 carac.)"
                />
              </div>

              <div>
                <label htmlFor="metaDescription" className="mb-1 block text-sm font-medium text-zinc-700">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  rows={3}
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Descrição para o Google (150-160 carac.)"
                />
              </div>
            </div>
          </section>

        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-6">
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          disabled={isPending}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form={ADMIN_POST_SAVE_FORM_ID}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-green-700 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar Artigo"}
        </button>
      </div>
    </div>
  );
}
