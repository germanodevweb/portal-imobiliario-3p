import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_AUTH_COOKIE_NAME,
  isAdminSessionCookieValue,
  sanitizeAdminRedirectAfterLogin,
} from "@/lib/auth/admin-session";

function hasAdminAuth(request: NextRequest): boolean {
  const value = request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  return isAdminSessionCookieValue(value);
}

/**
 * Repassa o pathname para Server Components (ex.: root layout -> <html lang>).
 * Protege `/admin` e `/api/admin` com cookie de sessão simples.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    if (hasAdminAuth(request)) {
      const from = request.nextUrl.searchParams.get("from") ?? undefined;
      const target = sanitizeAdminRedirectAfterLogin(from);
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  const isProtectedAdmin =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (isProtectedAdmin && !hasAdminAuth(request)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Rotas administrativas explícitas — garante interceção mesmo se o padrão
    // genérico falhar em edge/Vercel em alguns cenários.
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
    "/login",
    // Demais rotas: x-pathname para <html lang> e resto do site.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
