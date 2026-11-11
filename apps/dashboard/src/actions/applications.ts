"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearSelectedAppSession,
  getAuthToken,
  setSelectedAppSession,
} from "@/lib/session";
import type {
  Application,
  CreateApplicationState,
} from "@/modules/applications/types";

const BACKEND_URL =
  process.env.NEXT_BACKEND_URL ||
  process.env.BACKEND_API_URL ||
  "http://localhost:5000";

interface BackendResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T | null;
  error: {
    message?: string;
    code?: string;
  } | null;
}

interface ApplicationsData {
  applications: Application[];
}

/**
 * Fetches all applications registered to the authenticated user.
 */
export async function getApplicationsAction(): Promise<Application[]> {
  const token = await getAuthToken();
  if (!token) {
    return [];
  }

  try {
    let res = await fetch(`${BACKEND_URL}/api/v1/application`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.status === 404) {
      res = await fetch(`${BACKEND_URL}/application`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
    }

    if (!res.ok) {
      return [];
    }

    const body = (await res.json()) as BackendResponse<ApplicationsData>;
    if (body.status && body.data?.applications) {
      return body.data.applications;
    }

    return [];
  } catch (_error) {
    return [];
  }
}

/**
 * BFF Server Action to create a new application.
 */
export async function createApplicationAction(
  _prevState: CreateApplicationState,
  formData: FormData,
): Promise<CreateApplicationState> {
  const token = await getAuthToken();
  if (!token) {
    return {
      success: false,
      message: "Authentication required.",
      errors: {
        _form: ["You must be signed in to create an application."],
      },
    };
  }

  const name = (formData.get("name") as string)?.trim() ?? "";
  const description = (formData.get("description") as string)?.trim() ?? "";
  const logo_url = (formData.get("logo_url") as string)?.trim() || "";

  const errors: CreateApplicationState["errors"] = {};

  if (!name) {
    errors.name = ["Application name is required."];
  } else if (name.length > 255) {
    errors.name = ["Application name must be under 255 characters."];
  }

  if (!description) {
    errors.description = ["Description is required."];
  } else if (description.length < 10) {
    errors.description = ["Description must be at least 10 characters long."];
  }

  if (logo_url && logo_url.length > 500) {
    errors.logo_url = ["Logo URL must be under 500 characters."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please correct the form errors.",
      errors,
    };
  }

  try {
    const payload: { name: string; description: string; logo_url?: string } = {
      name,
      description,
    };
    if (logo_url) {
      payload.logo_url = logo_url;
    }

    let res = await fetch(`${BACKEND_URL}/api/v1/application/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (res.status === 404) {
      res = await fetch(`${BACKEND_URL}/application/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
    }

    const body = (await res.json()) as BackendResponse<Application>;

    if (!res.ok || !body.status || !body.data) {
      const code = body.error?.code;
      if (code === "Application Already Exist") {
        return {
          success: false,
          message: "An application with this name already exists.",
          errors: {
            name: ["An application with this name already exists."],
          },
        };
      }

      const errorMsg =
        body.error?.message || body.message || "Failed to create application.";

      return {
        success: false,
        message: errorMsg,
        errors: {
          _form: [errorMsg],
        },
      };
    }

    revalidatePath("/");
    return {
      success: true,
      message: "Application created successfully.",
      application: body.data,
    };
  } catch (_error) {
    return {
      success: false,
      message: "Unable to connect to application service. Please try again.",
      errors: {
        _form: ["Application service unreachable. Ensure backend is running."],
      },
    };
  }
}

/**
 * BFF Server Action to select an active application.
 */
export async function selectApplicationAction(
  app: Application,
): Promise<{ success: boolean; message?: string }> {
  const token = await getAuthToken();
  if (!token) {
    return {
      success: false,
      message: "Authentication required.",
    };
  }

  await setSelectedAppSession(app);
  return { success: true };
}

/**
 * BFF Server Action to clear active application and return to application selector.
 */
export async function clearSelectedApplicationAction(): Promise<void> {
  await clearSelectedAppSession();
  redirect("/?switch=true");
}
