import { loginAdminAction } from "./actions";
import { sanitizeAdminRedirectAfterLogin } from "@/lib/auth/admin-session";

type SearchParams = Promise<{ from?: string; error?: string }>;

/**
 * Login com senha única para o painel admin.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const redirectDefault = sanitizeAdminRedirectAfterLogin(params.from);
  const hasError = params.error === "1";

  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-col items-center justify-center bg-zinc-100 px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl font-semibold text-zinc-900">
          Painel administrativo
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Introduza a senha para continuar.
        </p>

        <form action={loginAdminAction} className="mt-8 space-y-4">
          <input type="hidden" name="redirect" value={redirectDefault} />
          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium text-zinc-700"
            >
              Senha
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 shadow-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </div>
          {hasError && (
            <p className="text-sm text-red-600" role="alert">
              Senha incorreta. Tente novamente.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-green-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
