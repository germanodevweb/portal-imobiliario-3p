import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Repassa o pathname para Server Components (ex.: root layout → <html lang>).
 * Padrão Next.js App Router: alterar headers na *request*, não só na response.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
