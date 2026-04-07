import Link from "next/link";
import type { AdminPostListItem } from "@/lib/admin/blog-actions";
import { PostRowActions } from "@/app/components/admin/PostRowActions";

type Props = {
  posts: AdminPostListItem[];
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function PostTypeBadge({ type }: { type: string }) {
  const typeMap: Record<string, { label: string, classes: string }> = {
    ARTIGO: { label: "Artigo", classes: "bg-blue-100 text-blue-800" },
    GUIA: { label: "Guia", classes: "bg-purple-100 text-purple-800" },
    NOTICIA: { label: "Notícia", classes: "bg-orange-100 text-orange-800" },
    INVESTIMENTO: { label: "Investimento", classes: "bg-emerald-100 text-emerald-800" },
  };

  const config = typeMap[type] || { label: type, classes: "bg-zinc-100 text-zinc-800" };

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}

/**
 * Hover em <tr> é pouco confiável no WebKit; fundo verde em cada <td> com .group no <tr>.
 */
function adminPostTableTd(
  published: boolean,
  align: "top" | "middle" = "middle",
): string {
  const alignCls = align === "top" ? "align-top" : "align-middle";
  return published
    ? `px-4 py-3 ${alignCls} bg-white transition-colors duration-200 group-hover:bg-green-50`
    : `px-4 py-3 ${alignCls} bg-zinc-100/60 transition-colors duration-200 group-hover:bg-green-50`;
}

function PostStatusBadges({ post }: { post: AdminPostListItem }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
          post.published
            ? "bg-green-100 text-green-800"
            : "bg-amber-100 text-amber-800"
        }`}
      >
        {post.published ? "Publicado" : "Rascunho"}
      </span>
      <PostTypeBadge type={post.type} />
    </div>
  );
}

function AdminPostCard({ post }: { post: AdminPostListItem }) {
  return (
    <article
      className={`rounded-xl border-2 border-zinc-300 bg-white p-4 shadow-sm ring-0 transition-all duration-200 space-y-3 hover:border-green-600 hover:bg-green-50 hover:shadow-lg hover:ring-2 hover:ring-green-200/80 ${
        post.published ? "" : "border-zinc-300 bg-zinc-100/70 hover:bg-green-50"
      }`}
    >
      <div>
        <p
          className={`text-base font-semibold leading-snug wrap-break-word ${
            post.published ? "text-zinc-900" : "text-zinc-700"
          }`}
        >
          {post.title}
        </p>
        <p className="mt-1 break-all font-mono text-sm text-zinc-500">
          {post.slug}
        </p>
      </div>

      <PostStatusBadges post={post} />

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">{formatDate(post.updatedAt)}</p>
        <PostRowActions
          postId={post.id}
          title={post.title}
          slug={post.slug}
          published={post.published}
        />
      </div>
    </article>
  );
}

export function AdminPostsTable({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center">
        <p className="text-zinc-500">
          Nenhum artigo cadastrado.
        </p>
        <Link
          href="/admin/blog/novo"
          className="mt-4 inline-block text-sm font-medium text-green-700 hover:text-green-800"
        >
          Escrever primeiro artigo →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 lg:hidden">
        {posts.map((post) => (
          <AdminPostCard key={post.id} post={post} />
        ))}
      </div>

      <div className="hidden rounded-xl border border-zinc-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
                >
                  Artigo
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
                >
                  Status / Tipo
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600"
                >
                  Atualizado
                </th>
                <th scope="col" className="relative px-4 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="group border-b border-zinc-200 last:border-b-0"
                >
                  <td className={adminPostTableTd(post.published)}>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-medium ${
                          post.published ? "text-zinc-900" : "text-zinc-600"
                        }`}
                      >
                        {post.title}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-zinc-500">
                        {post.slug}
                      </p>
                    </div>
                  </td>
                  <td className={adminPostTableTd(post.published)}>
                    <PostStatusBadges post={post} />
                  </td>
                  <td
                    className={`${adminPostTableTd(post.published)} text-sm text-zinc-500`}
                  >
                    {formatDate(post.updatedAt)}
                  </td>
                  <td className={adminPostTableTd(post.published, "top")}>
                    <PostRowActions
                      postId={post.id}
                      title={post.title}
                      slug={post.slug}
                      published={post.published}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
