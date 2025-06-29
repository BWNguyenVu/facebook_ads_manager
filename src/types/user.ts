export interface User {
  _id?: string;
  email: string;
  password_hash: string;
  full_name?: string;
  facebook_user_id?: string;
  long_lived_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
  // Facebook App Credentials
  facebook_app_id?: string;
  facebook_app_secret?: string;
  facebook_short_lived_token?: string;
  role: 'admin' | 'user';
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Account {
  _id?: string;
  user_id: string;
  account_id: string;
  account_name: string;
  business_id?: string;
  business_name?: string;
  access_permissions: string[];
  is_primary: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  user_id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
  selected_account?: {
    account_id: string;
    account_name: string;
    business_name?: string;
  };
  long_lived_token?: string;
  facebook_credentials?: {
    facebook_app_id?: string;
    has_credentials: boolean;
    token_valid: boolean;
  } | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  access_token?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: UserSession;
  token?: string;
}

export interface TokenExchangeRequest {
  short_lived_token: string;
}

export interface TokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface FacebookUserInfo {
  id: string;
  name: string;
  email?: string;
}
