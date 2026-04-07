"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_COOKIE_VALUE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  getExpectedAdminPassword,
  sanitizeAdminRedirectAfterLogin,
} from "@/lib/auth/admin-session";

export async function loginAdminAction(formData: FormData): Promise<void> {
  const passwordRaw = formData.get("password");
  const password = typeof passwordRaw === "string" ? passwordRaw : "";
  const redirectRaw = formData.get("redirect");
  const redirectInput = typeof redirectRaw === "string" ? redirectRaw : undefined;

  const expected = getExpectedAdminPassword();
  if (expected === null || password !== expected) {
    const safe = sanitizeAdminRedirectAfterLogin(redirectInput);
    redirect(`/login?error=1&from=${encodeURIComponent(safe)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_AUTH_COOKIE_NAME, ADMIN_AUTH_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  const safePath = sanitizeAdminRedirectAfterLogin(redirectInput);
  redirect(safePath);
}

export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_AUTH_COOKIE_NAME);
  redirect("/login");
}
