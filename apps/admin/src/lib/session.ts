import { cookies } from "next/headers";
import type { AdminUser } from "@/lib/types";

export const ADMIN_AUTH_COOKIE_NAME = "truehook_admin_token";
export const ADMIN_USER_COOKIE_NAME = "truehook_admin_user";

// 72 hours matching Go backend JWT expiry (72h)
const COOKIE_MAX_AGE = 72 * 60 * 60;

/**
 * Stores operator authentication credentials in secure HTTP-only cookies on the server.
 */
export async function setAdminSession(
  token: string,
  admin: AdminUser,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  cookieStore.set(ADMIN_USER_COOKIE_NAME, JSON.stringify(admin), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/**
 * Clears administrator authentication session cookies.
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_AUTH_COOKIE_NAME);
  cookieStore.delete(ADMIN_USER_COOKIE_NAME);
}

/**
 * Reads the active admin JWT token from the server cookie store.
 */
export async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE_NAME);
  return token?.value ?? null;
}

/**
 * Reads the active operator profile from the server cookie store.
 */
export async function getAdminSessionUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(ADMIN_USER_COOKIE_NAME);
  if (!userCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(userCookie.value) as AdminUser;
  } catch {
    return null;
  }
}
