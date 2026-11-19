export interface AdminUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
  role?: string;
}

export interface BackendAuthData {
  admin: AdminUser;
  token: string;
}

export interface BackendResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
}

export interface AuthActionErrors {
  email?: string[];
  password?: string[];
  _form?: string[];
}

export interface AuthActionState {
  success: boolean;
  message?: string;
  errors?: AuthActionErrors;
  data?: unknown;
}

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  logo_url: string;
  created_at: string;
}

export interface SystemHealthStatus {
  apiStatus: "operational" | "degraded" | "down";
  dbStatus: "connected" | "degraded" | "down";
  latencyMs?: number;
  message?: string;
  checkedAt: string;
}
