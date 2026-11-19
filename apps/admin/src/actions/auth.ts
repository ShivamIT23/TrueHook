"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  getAdminSessionUser,
  setAdminSession,
} from "../lib/session";
import type {
  AdminUser,
  AuthActionErrors,
  AuthActionState,
  BackendAuthData,
  BackendResponse,
} from "../lib/types";

const BACKEND_URL =
  process.env.NEXT_BACKEND_URL ||
  process.env.BACKEND_API_URL ||
  "http://localhost:8080";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return "Email is required.";
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  return null;
}

/**
 * BFF Server Action for administrator authentication.
 * Proxies request to Go API /api/v1/admin/signin, validates payload, and provisions HTTP-only session cookie.
 */
export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = (formData.get("email") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";

  const errors: AuthActionErrors = {};
  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = [emailError];
  }

  if (!password) {
    errors.password = ["Password is required."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please check your operator credentials.",
      errors,
    };
  }

  let shouldRedirect = false;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/admin/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const body = (await res.json()) as BackendResponse<BackendAuthData>;

    if (!res.ok || !body.status || !body.data) {
      const code = body.error?.code;
      const errorMsg =
        code === "INVALID_CREDENTIALS"
          ? "Invalid operator email or password."
          : body.error?.message ||
            body.message ||
            "Authentication failed. Please verify your operator credentials.";

      return {
        success: false,
        message: errorMsg,
        errors: {
          _form: [errorMsg],
        },
      };
    }

    await setAdminSession(body.data.token, body.data.admin);
    shouldRedirect = true;
  } catch (_error) {
    return {
      success: false,
      message:
        "Unable to reach the admin authentication service. Please ensure the backend is running.",
      errors: {
        _form: [
          "Authentication service unreachable. Ensure TrueHook API is running at " +
            BACKEND_URL,
        ],
      },
    };
  }

  if (shouldRedirect) {
    redirect("/overview");
  }

  return { success: true };
}

/**
 * BFF Server Action for operator sign out.
 */
export async function signOutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/signin");
}

/**
 * BFF Server Action to retrieve the current operator session.
 */
export async function getAdminSessionAction(): Promise<AdminUser | null> {
  return await getAdminSessionUser();
}
