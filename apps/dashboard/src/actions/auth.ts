"use server";

import { redirect } from "next/navigation";
import { clearAuthSession, setAuthSession } from "../lib/session";
import type {
  AuthActionErrors,
  AuthActionState,
  BackendAuthData,
  BackendResponse,
} from "../lib/types";

const BACKEND_URL =
  process.env.NEXT_BACKEND_URL ||
  process.env.BACKEND_API_URL ||
  "http://localhost:5000";

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

function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  return null;
}

/**
 * BFF Server Action for customer authentication.
 * Proxies request to Go API /api/v1/auth/signin, validates payload, and provisions HTTP-only session cookie.
 */
export async function loginAction(
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
      message: "Please check your login details.",
      errors,
    };
  }

  let shouldRedirect = false;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
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
          ? "Invalid email or password."
          : body.error?.message ||
            body.message ||
            "Authentication failed. Please verify your credentials.";

      return {
        success: false,
        message: errorMsg,
        errors: {
          _form: [errorMsg],
        },
      };
    }

    await setAuthSession(body.data.token, {
      id: body.data.user.id,
      name: body.data.user.name,
      email: body.data.user.email,
      logo_url: body.data.user.logo_url,
      created_at: body.data.user.created_at,
    });

    shouldRedirect = true;
  } catch (_error) {
    return {
      success: false,
      message:
        "Unable to reach the authentication service. Please check your network connection.",
      errors: {
        _form: [
          "Authentication service unreachable. Ensure backend is running.",
        ],
      },
    };
  }

  if (shouldRedirect) {
    redirect("/");
  }

  return { success: true };
}

/**
 * BFF Server Action for customer registration.
 * Proxies request to Go API /api/v1/auth/signup, validates payload, and provisions HTTP-only session cookie.
 */
export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = (formData.get("email") as string)?.trim() ?? "";
  const name = (formData.get("name") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  const errors: AuthActionErrors = {};
  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = [emailError];
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = [passwordError];
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = ["Passwords do not match."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please check your registration details.",
      errors,
    };
  }

  let shouldRedirect = false;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
      cache: "no-store",
    });

    const body = (await res.json()) as BackendResponse<BackendAuthData>;

    if (!res.ok || !body.status || !body.data) {
      const code = body.error?.code;
      if (code === "EMAIL_EXISTS") {
        return {
          success: false,
          message: "An account with this email address already exists.",
          errors: {
            email: ["An account with this email address already exists."],
            _form: ["Email address is already in use."],
          },
        };
      }

      if (code === "WEAK_PASSWORD") {
        return {
          success: false,
          message: "Password does not meet security requirements.",
          errors: {
            password: ["Password must be at least 8 characters long."],
          },
        };
      }

      const errorMsg =
        body.error?.message ||
        body.message ||
        "Registration failed. Please try again.";

      return {
        success: false,
        message: errorMsg,
        errors: {
          _form: [errorMsg],
        },
      };
    }

    await setAuthSession(body.data.token, {
      id: body.data.user.id,
      name: body.data.user.name,
      email: body.data.user.email,
      logo_url: body.data.user.logo_url,
      created_at: body.data.user.created_at,
    });

    shouldRedirect = true;
  } catch (_error) {
    return {
      success: false,
      message:
        "Unable to reach the registration service. Please check your network connection.",
      errors: {
        _form: ["Registration service unreachable. Ensure backend is running."],
      },
    };
  }

  if (shouldRedirect) {
    redirect("/");
  }

  return { success: true };
}

/**
 * BFF Server Action to log out the user by clearing session cookies.
 */
export async function logoutAction(): Promise<void> {
  await clearAuthSession();
  redirect("/login");
}
