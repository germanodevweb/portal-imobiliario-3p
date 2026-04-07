import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/app/components/admin/AdminHeader";
import {
  ADMIN_AUTH_COOKIE_NAME,
  isAdminSessionCookieValue,
  sanitizeAdminRedirectAfterLogin,
} from "@/lib/auth/admin-session";

export const metadata: Metadata = {
  title: "Painel Admin | 3Pinheiros",
  robots: "noindex, nofollow",
};

/**
 * Layout da área administrativa.
 * Isolado do layout público — sem Header/Footer do portal.
 *
 * Reforço de auth no servidor: se o middleware não interceptar (ex.: edge em produção),
 * sem cookie válido não renderiza o painel e redireciona para /login.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  if (!isAdminSessionCookieValue(session)) {
    const headerList = await headers();
    const pathname = headerList.get("x-pathname") ?? "";
    const from =
      pathname.startsWith("/admin") && pathname.length > 0
        ? sanitizeAdminRedirectAfterLogin(pathname)
        : "/admin";
    redirect(`/login?from=${encodeURIComponent(from)}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-emerald-900 via-green-800 to-emerald-950">
      <AdminHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 text-zinc-100 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}
