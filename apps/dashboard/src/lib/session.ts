import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/types";
import type { Application } from "@/modules/applications/types";

export const AUTH_COOKIE_NAME = "truehook_token";
export const USER_COOKIE_NAME = "truehook_user";
export const SELECTED_APP_COOKIE_NAME = "truehook_selected_app";
export const SELECTED_APP_ID_COOKIE_NAME = "truehook_selected_app_id";

// 72 hours matching Go backend JWT expiry (72h)
const COOKIE_MAX_AGE = 72 * 60 * 60;

/**
 * Stores authentication credentials in secure HTTP-only cookies on the server (BFF).
 * Sensitive JWT token is kept inaccessible to client JavaScript.
 */
export async function setAuthSession(
  token: string,
  user: AuthUser,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  cookieStore.set(USER_COOKIE_NAME, JSON.stringify(user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/**
 * Clears authentication and selected application session cookies on the server (BFF).
 */
export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(USER_COOKIE_NAME);
  cookieStore.delete(SELECTED_APP_COOKIE_NAME);
  cookieStore.delete(SELECTED_APP_ID_COOKIE_NAME);
}

/**
 * Reads the active JWT token from the server cookie store.
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  return token?.value ?? null;
}

/**
 * Reads the active user profile from the server cookie store.
 */
export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_COOKIE_NAME);
  if (!userCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(userCookie.value) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Stores the currently selected application in cookies on the server (BFF).
 */
export async function setSelectedAppSession(app: Application): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SELECTED_APP_COOKIE_NAME, JSON.stringify(app), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  cookieStore.set(SELECTED_APP_ID_COOKIE_NAME, app.id, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/**
 * Reads the currently selected application from server cookies.
 */
export async function getSelectedAppSession(): Promise<Application | null> {
  const cookieStore = await cookies();
  const appCookie = cookieStore.get(SELECTED_APP_COOKIE_NAME);
  if (!appCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(appCookie.value) as Application;
  } catch {
    return null;
  }
}

/**
 * Reads the currently selected application ID from server cookies.
 */
export async function getSelectedAppId(): Promise<string | null> {
  const cookieStore = await cookies();
  const appIdCookie = cookieStore.get(SELECTED_APP_ID_COOKIE_NAME);
  return appIdCookie?.value ?? null;
}

/**
 * Clears the selected application cookies from server cookies.
 */
export async function clearSelectedAppSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SELECTED_APP_COOKIE_NAME);
  cookieStore.delete(SELECTED_APP_ID_COOKIE_NAME);
}
