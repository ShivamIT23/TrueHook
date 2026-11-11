export interface AuthUser {
  id: string;
  name?: string;
  email: string;
  logo_url?: string;
  created_at?: string;
}

export interface BackendUserResponse {
  id: string;
  name: string;
  email: string;
  logo_url?: string;
  created_at: string;
}

export interface BackendAuthData {
  user: BackendUserResponse;
  token: string;
}

export interface BackendResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T | null;
  error: {
    message?: string;
    code?: string;
    detail?: unknown;
  } | null;
}

export interface AuthActionErrors {
  email?: string[];
  name?: string[];
  password?: string[];
  confirmPassword?: string[];
  _form?: string[];
}

export interface AuthActionState {
  success: boolean;
  message?: string;
  errors?: AuthActionErrors;
  user?: AuthUser;
}

export const initialAuthState: AuthActionState = {
  success: false,
};
