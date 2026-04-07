import { AdminPostForm } from "@/app/components/admin/AdminPostForm";

export const dynamic = "force-dynamic";

export default function NovoPostPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Novo Artigo
        </h1>
        <p className="mt-1 text-sm text-zinc-300">
          Crie um novo artigo para o blog.
        </p>
      </div>

      <AdminPostForm />
    </div>
  );
}
