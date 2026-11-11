"use server";

import { revalidatePath } from "next/cache";
import { getAuthToken } from "@/lib/session";
import type { EventItem, EventDetail, PublishEventState } from "@/modules/events/types";

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

interface RawEventsListResponse {
  events: EventItem[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Fetches paginated events for an application.
 */
export async function getEventsAction(
  applicationId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<{ events: EventItem[]; total: number }> {
  if (!applicationId) return { events: [], total: 0 };

  const token = await getAuthToken();
  if (!token) return { events: [], total: 0 };

  try {
    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/events?limit=${limit}&offset=${offset}`,
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
        `${BACKEND_URL}/application/${applicationId}/events?limit=${limit}&offset=${offset}`,
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
      return { events: [], total: 0 };
    }

    const body = (await res.json()) as BackendResponse<RawEventsListResponse>;
    if (!body.status || !body.data) {
      return { events: [], total: 0 };
    }

    return {
      events: body.data.events || [],
      total: body.data.total || 0,
    };
  } catch (_error) {
    return { events: [], total: 0 };
  }
}

/**
 * Fetches a single event with its delivery list by ID.
 */
export async function getEventByIdAction(
  applicationId: string,
  eventId: string,
): Promise<EventDetail | null> {
  if (!applicationId || !eventId) return null;

  const token = await getAuthToken();
  if (!token) return null;

  try {
    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/events/${eventId}`,
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
        `${BACKEND_URL}/application/${applicationId}/events/${eventId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );
    }

    if (!res.ok) return null;

    const body = (await res.json()) as BackendResponse<EventDetail>;
    if (!body.status || !body.data) return null;

    return body.data;
  } catch (_error) {
    return null;
  }
}

/**
 * Publishes a new webhook event.
 */
export async function publishEventAction(
  _prevState: PublishEventState,
  formData: FormData,
): Promise<PublishEventState> {
  const token = await getAuthToken();
  if (!token) {
    return {
      success: false,
      message: "Authentication required.",
      errors: {
        _form: ["You must be signed in to publish events."],
      },
    };
  }

  const applicationId = (formData.get("application_id") as string)?.trim() ?? "";
  const eventTypeId = (formData.get("event_type_id") as string)?.trim() ?? "";
  const payloadRaw = (formData.get("payload") as string)?.trim() ?? "";

  const errors: PublishEventState["errors"] = {};

  if (!applicationId) {
    errors._form = ["Application context is missing."];
  }

  if (!eventTypeId) {
    errors.event_type_id = ["Please select an event type."];
  }

  let parsedPayload: Record<string, unknown> = {};
  if (!payloadRaw) {
    errors.payload = ["JSON payload is required."];
  } else {
    try {
      parsedPayload = JSON.parse(payloadRaw);
      if (typeof parsedPayload !== "object" || parsedPayload === null || Array.isArray(parsedPayload)) {
        errors.payload = ["Payload must be a valid JSON object."];
      }
    } catch (_err) {
      errors.payload = ["Payload contains invalid JSON syntax."];
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please correct the form errors.",
      errors,
    };
  }

  try {
    const payload = {
      application_id: applicationId,
      event_type_id: eventTypeId,
      payload: parsedPayload,
    };

    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/events`,
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
        `${BACKEND_URL}/application/${applicationId}/events`,
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

    const body = (await res.json()) as BackendResponse<EventDetail>;

    if (!res.ok || !body.status || !body.data) {
      const errorMsg =
        body.error?.message || body.message || "Failed to publish event.";
      return {
        success: false,
        message: errorMsg,
        errors: {
          _form: [errorMsg],
        },
      };
    }

    revalidatePath("/events");
    revalidatePath("/deliveries");
    return {
      success: true,
      message: "Event published successfully and deliveries scheduled.",
      event: body.data,
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
