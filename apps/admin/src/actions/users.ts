"use server";

import { getAdminToken } from "../lib/session";
import type {
  BackendResponse,
  SystemHealthStatus,
  TenantUser,
} from "../lib/types";

const BACKEND_URL =
  process.env.NEXT_BACKEND_URL ||
  process.env.BACKEND_API_URL ||
  "http://localhost:8080";

/**
 * BFF Server Action to retrieve all registered users/tenants for admin inspection.
 * Requires valid administrator JWT in HTTP-only cookie.
 */
export async function getAdminUsersAction(): Promise<{
  users: TenantUser[];
  error?: string;
}> {
  const token = await getAdminToken();
  if (!token) {
    return { users: [], error: "Unauthorized: Admin session required." };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/admin/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { users: [], error: "Admin authorization failed or expired." };
      }
      return { users: [], error: `Failed to fetch users: HTTP ${res.status}` };
    }

    const body = (await res.json()) as BackendResponse<{ users: TenantUser[] }>;
    return {
      users: body.data?.users || [],
    };
  } catch (error) {
    return {
      users: [],
      error:
        error instanceof Error
          ? error.message
          : "Network error connecting to backend service.",
    };
  }
}

/**
 * BFF Server Action to inspect a specific tenant by ID.
 */
export async function getAdminUserDetailAction(
  userId: string,
): Promise<{ user: TenantUser | null; error?: string }> {
  const token = await getAdminToken();
  if (!token) {
    return { user: null, error: "Unauthorized: Admin session required." };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/admin/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { user: null, error: `Failed to fetch user: HTTP ${res.status}` };
    }

    const body = (await res.json()) as BackendResponse<TenantUser>;
    return { user: body.data || null };
  } catch (error) {
    return {
      user: null,
      error:
        error instanceof Error
          ? error.message
          : "Network error connecting to backend service.",
    };
  }
}

/**
 * BFF Server Action to probe TrueHook API and Database health.
 */
export async function getSystemHealthAction(): Promise<SystemHealthStatus> {
  const now = new Date().toISOString();
  const startTime = Date.now();

  try {
    const res = await fetch(`${BACKEND_URL}/healthz`, {
      method: "GET",
      cache: "no-store",
    });

    const latency = Date.now() - startTime;

    if (res.ok) {
      return {
        apiStatus: "operational",
        dbStatus: "connected",
        latencyMs: latency,
        message: "All internal services operating within normal parameters",
        checkedAt: now,
      };
    }

    return {
      apiStatus: "degraded",
      dbStatus: "degraded",
      latencyMs: latency,
      message: `API returned HTTP ${res.status}`,
      checkedAt: now,
    };
  } catch {
    return {
      apiStatus: "down",
      dbStatus: "down",
      latencyMs: Date.now() - startTime,
      message: `Backend API unreachable at ${BACKEND_URL}`,
      checkedAt: now,
    };
  }
}
