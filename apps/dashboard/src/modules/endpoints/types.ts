export interface Endpoint {
  id: string;
  application_id?: string;
  url: string;
  secret_encrypted?: string;
  enabled: boolean;
  event_types?: Array<{
    id: string | { Bytes?: number[] };
    name: string;
    description?: string | { String?: string };
  }>;
  event_type_ids?: string[];
  created_at: string;
}

export interface CreateEndpointState {
  success: boolean;
  message?: string;
  errors?: {
    url?: string[];
    secret?: string[];
    _form?: string[];
  };
  endpoint?: Endpoint;
}

export const initialCreateEndpointState: CreateEndpointState = {
  success: false,
};

export interface UpdateEndpointState {
  success: boolean;
  message?: string;
  errors?: {
    url?: string[];
    secret?: string[];
    _form?: string[];
  };
  endpoint?: Endpoint;
}

export const initialUpdateEndpointState: UpdateEndpointState = {
  success: false,
};
