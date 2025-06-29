export interface CampaignLog {
  _id?: string;
  user_id: string;
  account_id: string;
  name: string;
  csvRow: any;
  status: 'success' | 'error' | 'pending';
  daily_budget?: number;
  facebook_ids?: {
    campaign_id?: string;
    adset_id?: string;
    creative_id?: string;
    ad_id?: string;
  };
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CampaignConfig {
  default_daily_budget: number;
  default_age_min: number;
  default_age_max: number;
  default_geo_countries: string[];
  default_bid_strategy: string;
  default_optimization_goal: string;
  default_billing_event: string;
}

export interface UserSettings {
  access_token?: string;
  selected_account_id?: string;
  recent_accounts: string[];
  recent_pages: string[];
  campaign_config: CampaignConfig;
}
