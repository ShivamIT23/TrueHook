"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getAuthToken, getSessionUser, USER_COOKIE_NAME } from "@/lib/session";
import type {
  AuthActionState,
  AuthUser,
  BackendResponse,
  BackendUserResponse,
} from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_BACKEND_URL ||
  process.env.BACKEND_API_URL ||
  "http://localhost:5000";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getUserAction(): Promise<AuthUser | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return await getSessionUser();
    }

    const body = (await res.json()) as BackendResponse<BackendUserResponse>;
    if (body.status && body.data) {
      return {
        id: body.data.id,
        name: body.data.name,
        email: body.data.email,
        logo_url: body.data.logo_url,
        created_at: body.data.created_at,
      };
    }

    return await getSessionUser();
  } catch (_err) {
    return await getSessionUser();
  }
}

export async function updateUserAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const token = await getAuthToken();
  if (!token) {
    return {
      success: false,
      message: "Authentication required.",
      errors: {
        _form: ["You must be signed in to update your profile."],
      },
    };
  }

  const name = (formData.get("name") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim() ?? "";
  const logo_url = (formData.get("logo_url") as string)?.trim() || "";
  const password = (formData.get("password") as string)?.trim() || "";

  const errors: Record<string, string[]> = {};

  if (!name) {
    errors.name = ["Name is required."];
  }

  if (!email) {
    errors.email = ["Email is required."];
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = ["Please enter a valid email address."];
  }

  if (password && password.length < 8) {
    errors.password = ["New password must be at least 8 characters long."];
  }

  if (logo_url && logo_url.length > 500) {
    errors.logo_url = ["Avatar URL must be under 500 characters."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please correct the form errors.",
      errors,
    };
  }

  try {
    const payload: {
      name: string;
      email: string;
      logo_url?: string;
      password?: string;
    } = {
      name,
      email,
    };

    if (logo_url) {
      payload.logo_url = logo_url;
    }
    if (password) {
      payload.password = password;
    }

    const res = await fetch(`${BACKEND_URL}/api/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = (await res.json()) as BackendResponse<BackendUserResponse>;

    if (!res.ok || !body.status || !body.data) {
      const code = body.error?.code;
      if (code === "EMAIL_EXISTS") {
        return {
          success: false,
          message: "Email is already registered to another account.",
          errors: {
            email: ["Email is already in use."],
          },
        };
      }
      if (code === "WEAK_PASSWORD") {
        return {
          success: false,
          message: "Password does not meet requirements.",
          errors: {
            password: ["Password must be at least 8 characters long."],
          },
        };
      }

      const errorMsg =
        body.error?.message || body.message || "Failed to update profile.";
      return {
        success: false,
        message: errorMsg,
        errors: {
          _form: [errorMsg],
        },
      };
    }

    const updatedUser: AuthUser = {
      id: body.data.id,
      name: body.data.name,
      email: body.data.email,
      logo_url: body.data.logo_url,
      created_at: body.data.created_at,
    };

    // Update user cookie in session
    const cookieStore = await cookies();
    cookieStore.set(USER_COOKIE_NAME, JSON.stringify(updatedUser), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 72 * 60 * 60,
    });

    revalidatePath("/my-account");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return {
      success: true,
      message: "Account profile updated successfully.",
      user: updatedUser,
    };
  } catch (_error) {
    return {
      success: false,
      message: "Unable to connect to user service. Please try again.",
      errors: {
        _form: ["User service unreachable. Ensure backend is running."],
      },
    };
  }
}
