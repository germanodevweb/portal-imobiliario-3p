import Link from "next/link";
import { getAdminPosts } from "@/lib/admin/blog-actions";
import { AdminPostsTable } from "@/app/components/admin/AdminPostsTable";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  let posts;
  try {
    posts = await getAdminPosts();
  } catch (err) {
    console.error("[AdminBlogPage] Erro ao carregar posts:", err);
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">Erro ao carregar posts do blog</h2>
        <p className="mt-2 text-sm text-red-700">
          {err instanceof Error ? err.message : String(err)}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Blog
          </h1>
          <p className="mt-1 text-sm text-zinc-300">
            {posts.length}{" "}
            {posts.length !== 1 ? "artigos cadastrados" : "artigo cadastrado"}
          </p>
        </div>
        <Link
          href="/admin/blog/novo"
          className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
        >
          Novo artigo
        </Link>
      </div>

      <AdminPostsTable posts={posts} />
    </div>
  );
}
