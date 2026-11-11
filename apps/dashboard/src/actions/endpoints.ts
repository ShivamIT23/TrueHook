"use server";

import { revalidatePath } from "next/cache";
import { getAuthToken } from "@/lib/session";
import type {
  CreateEndpointState,
  Endpoint,
  UpdateEndpointState,
} from "@/modules/endpoints/types";

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

interface RawEndpoint {
  id?: string | { Bytes?: number[] };
  ID?: string | { Bytes?: number[] };
  application_id?: string;
  ApplicationID?: string;
  url?: string;
  Url?: string;
  secret_encrypted?: string;
  SecretEncrypted?: string;
  enabled?: boolean;
  Enabled?: boolean;
  created_at?: string | { Time?: string };
  CreatedAt?: string | { Time?: string };
}

interface RawEndpointsData {
  Endpoints?: RawEndpoint[];
  endpoints?: RawEndpoint[];
}

function normalizeEndpoint(raw: RawEndpoint): Endpoint {
  let id = "";
  if (typeof raw.id === "string") {
    id = raw.id;
  } else if (typeof raw.ID === "string") {
    id = raw.ID;
  }

  const url = raw.url || raw.Url || "";
  const secret_encrypted = raw.secret_encrypted || raw.SecretEncrypted || "";

  let enabled = true;
  if (typeof raw.enabled === "boolean") {
    enabled = raw.enabled;
  } else if (typeof raw.Enabled === "boolean") {
    enabled = raw.Enabled;
  }

  let createdAt = "";
  if (typeof raw.created_at === "string") {
    createdAt = raw.created_at;
  } else if (typeof raw.CreatedAt === "string") {
    createdAt = raw.CreatedAt;
  } else if (raw.created_at && typeof raw.created_at.Time === "string") {
    createdAt = raw.created_at.Time;
  } else if (raw.CreatedAt && typeof raw.CreatedAt.Time === "string") {
    createdAt = raw.CreatedAt.Time;
  }

  return {
    id,
    application_id: raw.application_id || raw.ApplicationID || "",
    url,
    secret_encrypted,
    enabled,
    created_at: createdAt || new Date().toISOString(),
  };
}

function isValidHttpUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

/**
 * Fetches all registered webhook endpoints for an application.
 */
export async function getEndpointsAction(
  applicationId: string,
): Promise<Endpoint[]> {
  if (!applicationId) return [];

  const token = await getAuthToken();
  if (!token) return [];

  try {
    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/endpoint`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (res.status === 404) {
      res = await fetch(
        `${BACKEND_URL}/application/${applicationId}/endpoint`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );
    }

    if (!res.ok) {
      return [];
    }

    const body = (await res.json()) as BackendResponse<
      RawEndpointsData | RawEndpoint[]
    >;
    if (!body.status || !body.data) {
      return [];
    }

    let items: RawEndpoint[] = [];
    if (Array.isArray(body.data)) {
      items = body.data;
    } else if (body.data.Endpoints && Array.isArray(body.data.Endpoints)) {
      items = body.data.Endpoints;
    } else if (body.data.endpoints && Array.isArray(body.data.endpoints)) {
      items = body.data.endpoints;
    }

    return items.map(normalizeEndpoint);
  } catch (_error) {
    return [];
  }
}

/**
 * Creates and registers a new webhook endpoint for an application.
 */
export async function createEndpointAction(
  _prevState: CreateEndpointState,
  formData: FormData,
): Promise<CreateEndpointState> {
  const token = await getAuthToken();
  if (!token) {
    return {
      success: false,
      message: "Authentication required.",
      errors: {
        _form: ["You must be signed in to register an endpoint."],
      },
    };
  }

  const applicationId =
    (formData.get("application_id") as string)?.trim() ?? "";
  const url = (formData.get("url") as string)?.trim() ?? "";
  const secret = (formData.get("secret") as string)?.trim() ?? "";

  const errors: CreateEndpointState["errors"] = {};

  if (!applicationId) {
    errors._form = ["Application context is missing."];
  }

  if (!url) {
    errors.url = ["Destination URL is required."];
  } else if (!isValidHttpUrl(url)) {
    errors.url = [
      "Please enter a valid HTTP or HTTPS URL (e.g. https://api.yourdomain.com/webhooks).",
    ];
  } else if (url.length > 2048) {
    errors.url = ["URL must be 2048 characters or fewer."];
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
      application_id: string;
      url: string;
      secret_encrypted?: string;
    } = {
      application_id: applicationId,
      url,
    };

    if (secret) {
      payload.secret_encrypted = secret;
    }

    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/endpoint/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    if (res.status === 404) {
      res = await fetch(
        `${BACKEND_URL}/application/${applicationId}/endpoint/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
          cache: "no-store",
        },
      );
    }

    const body = (await res.json()) as BackendResponse<RawEndpoint>;

    if (!res.ok || !body.status || !body.data) {
      const code = body.error?.code || "";
      if (code.includes("ENDPOINT_ALREADY_EXISTS")) {
        return {
          success: false,
          message: "An endpoint with this destination URL already exists.",
          errors: {
            url: ["An endpoint with this destination URL already exists."],
          },
        };
      }
      if (code.includes("INVALID_URL")) {
        return {
          success: false,
          message: "The destination URL is invalid or malformed.",
          errors: {
            url: ["The destination URL is invalid or malformed."],
          },
        };
      }

      const errorMsg =
        body.error?.message || body.message || "Failed to create endpoint.";
      return {
        success: false,
        message: errorMsg,
        errors: {
          _form: [errorMsg],
        },
      };
    }

    revalidatePath("/endpoints");
    return {
      success: true,
      message: "Webhook endpoint registered successfully.",
      endpoint: normalizeEndpoint(body.data),
    };
  } catch (_error) {
    return {
      success: false,
      message: "Unable to connect to the backend service. Please try again.",
      errors: {
        _form: ["Backend service unreachable."],
      },
    };
  }
}

/**
 * Updates an existing webhook endpoint's destination URL, secret, or enabled status.
 */
export async function updateEndpointAction(
  _prevState: UpdateEndpointState,
  formData: FormData,
): Promise<UpdateEndpointState> {
  const token = await getAuthToken();
  if (!token) {
    return {
      success: false,
      message: "Authentication required.",
      errors: {
        _form: ["You must be signed in to update an endpoint."],
      },
    };
  }

  const applicationId =
    (formData.get("application_id") as string)?.trim() ?? "";
  const endpointId = (formData.get("endpoint_id") as string)?.trim() ?? "";
  const url = (formData.get("url") as string)?.trim() ?? "";
  const secret = (formData.get("secret") as string)?.trim() ?? "";
  const enabledStr = (formData.get("enabled") as string)?.trim() ?? "true";
  const enabled = enabledStr === "true" || enabledStr === "on";

  const errors: UpdateEndpointState["errors"] = {};

  if (!applicationId || !endpointId) {
    errors._form = ["Missing required endpoint identifier."];
  }

  if (!url) {
    errors.url = ["Destination URL is required."];
  } else if (!isValidHttpUrl(url)) {
    errors.url = [
      "Please enter a valid HTTP or HTTPS URL (e.g. https://api.yourdomain.com/webhooks).",
    ];
  } else if (url.length > 2048) {
    errors.url = ["URL must be 2048 characters or fewer."];
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
      id: string;
      application_id: string;
      url: string;
      secret_encrypted?: string;
      enabled: boolean;
    } = {
      id: endpointId,
      application_id: applicationId,
      url,
      enabled,
    };

    if (secret) {
      payload.secret_encrypted = secret;
    }

    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/endpoint/${endpointId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    if (res.status === 404) {
      res = await fetch(
        `${BACKEND_URL}/application/${applicationId}/endpoint/${endpointId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
          cache: "no-store",
        },
      );
    }

    const body = (await res.json()) as BackendResponse<RawEndpoint>;

    if (!res.ok || !body.status || !body.data) {
      const errorMsg =
        body.error?.message || body.message || "Failed to update endpoint.";
      return {
        success: false,
        message: errorMsg,
        errors: {
          _form: [errorMsg],
        },
      };
    }

    revalidatePath("/endpoints");
    return {
      success: true,
      message: "Endpoint updated successfully.",
      endpoint: normalizeEndpoint(body.data),
    };
  } catch (_error) {
    return {
      success: false,
      message: "Unable to connect to the backend service. Please try again.",
      errors: {
        _form: ["Backend service unreachable."],
      },
    };
  }
}

/**
 * Deletes an endpoint by ID.
 */
export async function deleteEndpointAction(
  applicationId: string,
  endpointId: string,
): Promise<{ success: boolean; message?: string }> {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: "Authentication required." };
  }

  if (!applicationId || !endpointId) {
    return { success: false, message: "Missing required identifier." };
  }

  try {
    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/endpoint/${endpointId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (res.status === 404) {
      res = await fetch(
        `${BACKEND_URL}/application/${applicationId}/endpoint/${endpointId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );
    }

    const body = (await res.json()) as BackendResponse<RawEndpoint>;

    if (!res.ok || !body.status) {
      return {
        success: false,
        message:
          body.error?.message || body.message || "Failed to delete endpoint.",
      };
    }

    revalidatePath("/endpoints");
    return { success: true, message: "Endpoint deleted successfully." };
  } catch (_error) {
    return {
      success: false,
      message: "Backend service unreachable.",
    };
  }
}
