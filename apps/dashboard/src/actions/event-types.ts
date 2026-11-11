"use server";

import { revalidatePath } from "next/cache";
import { getAuthToken } from "@/lib/session";
import type {
  CreateEventTypeState,
  EventType,
  UpdateEventTypeState,
} from "@/modules/event-types/types";

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

interface RawEventType {
  id?: string | { Bytes?: number[] };
  ID?: string | { Bytes?: number[] };
  application_id?: string;
  ApplicationID?: string;
  name?: string;
  Name?: string;
  description?: string | { String?: string };
  Description?: string | { String?: string };
  created_at?: string | { Time?: string };
  CreatedAt?: string | { Time?: string };
}

interface RawEventTypesData {
  EventTypes?: RawEventType[];
  event_types?: RawEventType[];
}

function normalizeEventType(raw: RawEventType): EventType {
  let id = "";
  if (typeof raw.id === "string") {
    id = raw.id;
  } else if (typeof raw.ID === "string") {
    id = raw.ID;
  }

  const name = raw.name || raw.Name || "";

  let description = "";
  if (typeof raw.description === "string") {
    description = raw.description;
  } else if (typeof raw.Description === "string") {
    description = raw.Description;
  } else if (raw.description && typeof raw.description.String === "string") {
    description = raw.description.String;
  } else if (raw.Description && typeof raw.Description.String === "string") {
    description = raw.Description.String;
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
    name,
    description,
    created_at: createdAt || new Date().toISOString(),
  };
}

/**
 * Fetches all event types associated with an application.
 */
export async function getEventTypesAction(
  applicationId: string,
): Promise<EventType[]> {
  if (!applicationId) return [];

  const token = await getAuthToken();
  if (!token) return [];

  try {
    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/event-type`,
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
        `${BACKEND_URL}/application/${applicationId}/event-type`,
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
      RawEventTypesData | RawEventType[]
    >;
    if (!body.status || !body.data) {
      return [];
    }

    let items: RawEventType[] = [];
    if (Array.isArray(body.data)) {
      items = body.data;
    } else if (body.data.EventTypes && Array.isArray(body.data.EventTypes)) {
      items = body.data.EventTypes;
    } else if (body.data.event_types && Array.isArray(body.data.event_types)) {
      items = body.data.event_types;
    }

    return items.map(normalizeEventType);
  } catch (_error) {
    return [];
  }
}

/**
 * Creates a new event type within the specified application.
 */
export async function createEventTypeAction(
  _prevState: CreateEventTypeState,
  formData: FormData,
): Promise<CreateEventTypeState> {
  const token = await getAuthToken();
  if (!token) {
    return {
      success: false,
      message: "Authentication required.",
      errors: {
        _form: ["You must be signed in to create an event type."],
      },
    };
  }

  const applicationId =
    (formData.get("application_id") as string)?.trim() ?? "";
  const name = (formData.get("name") as string)?.trim() ?? "";
  const description = (formData.get("description") as string)?.trim() ?? "";

  const errors: CreateEventTypeState["errors"] = {};

  if (!applicationId) {
    errors._form = ["Application context is missing."];
  }

  if (!name) {
    errors.name = ["Event type name is required."];
  } else if (name.length > 255) {
    errors.name = ["Name must be 255 characters or fewer."];
  }

  if (!description) {
    errors.description = ["Description is required."];
  } else if (description.length < 10) {
    errors.description = ["Description must be at least 10 characters long."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please correct the form errors.",
      errors,
    };
  }

  try {
    const payload = { name, description };

    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/event-type/create`,
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
        `${BACKEND_URL}/application/${applicationId}/event-type/create`,
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

    const body = (await res.json()) as BackendResponse<RawEventType>;

    if (!res.ok || !body.status || !body.data) {
      const code = body.error?.code || "";
      if (code.includes("Already Exist")) {
        return {
          success: false,
          message: "An event type with this name already exists.",
          errors: {
            name: ["An event type with this name already exists."],
          },
        };
      }
      if (code.includes("Description")) {
        return {
          success: false,
          message: "Description must be at least 10 characters long.",
          errors: {
            description: ["Description must be at least 10 characters long."],
          },
        };
      }

      const errorMsg =
        body.error?.message || body.message || "Failed to create event type.";
      return {
        success: false,
        message: errorMsg,
        errors: {
          _form: [errorMsg],
        },
      };
    }

    revalidatePath("/event-type");
    return {
      success: true,
      message: "Event type created successfully.",
      eventType: normalizeEventType(body.data),
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
 * Updates an existing event type.
 */
export async function updateEventTypeAction(
  _prevState: UpdateEventTypeState,
  formData: FormData,
): Promise<UpdateEventTypeState> {
  const token = await getAuthToken();
  if (!token) {
    return {
      success: false,
      message: "Authentication required.",
      errors: {
        _form: ["You must be signed in to update an event type."],
      },
    };
  }

  const applicationId =
    (formData.get("application_id") as string)?.trim() ?? "";
  const eventTypeId = (formData.get("event_type_id") as string)?.trim() ?? "";
  const name = (formData.get("name") as string)?.trim() ?? "";
  const description = (formData.get("description") as string)?.trim() ?? "";

  const errors: UpdateEventTypeState["errors"] = {};

  if (!applicationId || !eventTypeId) {
    errors._form = ["Missing required identifier."];
  }

  if (!name) {
    errors.name = ["Event type name is required."];
  } else if (name.length > 255) {
    errors.name = ["Name must be 255 characters or fewer."];
  }

  if (!description) {
    errors.description = ["Description is required."];
  } else if (description.length < 10) {
    errors.description = ["Description must be at least 10 characters long."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please correct the form errors.",
      errors,
    };
  }

  try {
    const payload = { name, description };

    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/event-type/${eventTypeId}`,
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
        `${BACKEND_URL}/application/${applicationId}/event-type/${eventTypeId}`,
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

    const body = (await res.json()) as BackendResponse<RawEventType>;

    if (!res.ok || !body.status || !body.data) {
      const errorMsg =
        body.error?.message || body.message || "Failed to update event type.";
      return {
        success: false,
        message: errorMsg,
        errors: {
          _form: [errorMsg],
        },
      };
    }

    revalidatePath("/event-type");
    return {
      success: true,
      message: "Event type updated successfully.",
      eventType: normalizeEventType(body.data),
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
 * Deletes an event type by ID.
 */
export async function deleteEventTypeAction(
  applicationId: string,
  eventTypeId: string,
): Promise<{ success: boolean; message?: string }> {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: "Authentication required." };
  }

  if (!applicationId || !eventTypeId) {
    return { success: false, message: "Missing required identifier." };
  }

  try {
    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/event-type/${eventTypeId}`,
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
        `${BACKEND_URL}/application/${applicationId}/event-type/${eventTypeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );
    }

    const body = (await res.json()) as BackendResponse<RawEventType>;

    if (!res.ok || !body.status) {
      return {
        success: false,
        message:
          body.error?.message || body.message || "Failed to delete event type.",
      };
    }

    revalidatePath("/event-type");
    return { success: true, message: "Event type deleted successfully." };
  } catch (_error) {
    return {
      success: false,
      message: "Backend service unreachable.",
    };
  }
}
