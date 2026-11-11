export interface EventType {
  id: string;
  application_id?: string;
  name: string;
  description: string;
  created_at: string;
}

export interface CreateEventTypeState {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    description?: string[];
    _form?: string[];
  };
  eventType?: EventType;
}

export const initialCreateEventTypeState: CreateEventTypeState = {
  success: false,
};

export interface UpdateEventTypeState {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    description?: string[];
    _form?: string[];
  };
  eventType?: EventType;
}

export const initialUpdateEventTypeState: UpdateEventTypeState = {
  success: false,
};
