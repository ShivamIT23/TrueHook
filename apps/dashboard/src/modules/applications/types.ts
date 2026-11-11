export interface Application {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  created_at: string;
}

export interface CreateApplicationState {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    description?: string[];
    logo_url?: string[];
    _form?: string[];
  };
  application?: Application;
}

export const initialCreateApplicationState: CreateApplicationState = {
  success: false,
};
