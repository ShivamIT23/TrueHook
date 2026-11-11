"use server";

import { revalidatePath } from "next/cache";
import { getAuthToken } from "@/lib/session";
import type { DeliveryItem, DeliveryDetail, DeliveryAttemptItem } from "@/modules/deliveries/types";

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

interface RawDeliveriesListResponse {
  deliveries: DeliveryItem[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Fetches paginated deliveries for an application.
 */
export async function getDeliveriesAction(
  applicationId: string,
  limit: number = 50,
  offset: number = 0,
  endpointId?: string,
  eventId?: string,
): Promise<{ deliveries: DeliveryItem[]; total: number }> {
  if (!applicationId) return { deliveries: [], total: 0 };

  const token = await getAuthToken();
  if (!token) return { deliveries: [], total: 0 };

  let query = `limit=${limit}&offset=${offset}`;
  if (endpointId) query += `&endpoint_id=${encodeURIComponent(endpointId)}`;
  if (eventId) query += `&event_id=${encodeURIComponent(eventId)}`;

  try {
    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/deliveries?${query}`,
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
        `${BACKEND_URL}/application/${applicationId}/deliveries?${query}`,
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
      return { deliveries: [], total: 0 };
    }

    const body = (await res.json()) as BackendResponse<RawDeliveriesListResponse>;
    if (!body.status || !body.data) {
      return { deliveries: [], total: 0 };
    }

    return {
      deliveries: body.data.deliveries || [],
      total: body.data.total || 0,
    };
  } catch (_error) {
    return { deliveries: [], total: 0 };
  }
}

/**
 * Fetches full delivery details, attempts, and original event payload.
 */
export async function getDeliveryByIdAction(
  applicationId: string,
  deliveryId: string,
): Promise<DeliveryDetail | null> {
  if (!applicationId || !deliveryId) return null;

  const token = await getAuthToken();
  if (!token) return null;

  try {
    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/deliveries/${deliveryId}`,
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
        `${BACKEND_URL}/application/${applicationId}/deliveries/${deliveryId}`,
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

    const body = (await res.json()) as BackendResponse<DeliveryDetail>;
    if (!body.status || !body.data) return null;

    return body.data;
  } catch (_error) {
    return null;
  }
}

/**
 * Triggers a manual replay/retry of a delivery.
 */
export async function replayDeliveryAction(
  applicationId: string,
  deliveryId: string,
): Promise<{ success: boolean; message?: string; delivery?: DeliveryDetail }> {
  if (!applicationId || !deliveryId) {
    return { success: false, message: "Missing required identifiers." };
  }

  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: "Authentication required." };
  }

  try {
    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/deliveries/${deliveryId}/replay`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (res.status === 404) {
      res = await fetch(
        `${BACKEND_URL}/application/${applicationId}/deliveries/${deliveryId}/replay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );
    }

    const body = (await res.json()) as BackendResponse<DeliveryDetail>;
    if (!res.ok || !body.status) {
      return {
        success: false,
        message: body.error?.message || body.message || "Failed to trigger replay.",
      };
    }

    revalidatePath("/deliveries");
    return {
      success: true,
      message: "Delivery replay scheduled successfully.",
      delivery: body.data || undefined,
    };
  } catch (_error) {
    return { success: false, message: "Backend service unreachable." };
  }
}

/**
 * Fetches attempts for a specific delivery.
 */
export async function getDeliveryAttemptsAction(
  applicationId: string,
  deliveryId: string,
): Promise<DeliveryAttemptItem[]> {
  if (!applicationId || !deliveryId) return [];

  const token = await getAuthToken();
  if (!token) return [];

  try {
    let res = await fetch(
      `${BACKEND_URL}/api/v1/application/${applicationId}/deliveries/${deliveryId}/attempts`,
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
        `${BACKEND_URL}/application/${applicationId}/deliveries/${deliveryId}/attempts`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );
    }

    if (!res.ok) return [];

    const body = (await res.json()) as BackendResponse<{ attempts: DeliveryAttemptItem[] }>;
    if (!body.status || !body.data) return [];

    return body.data.attempts || [];
  } catch (_error) {
    return [];
  }
}
