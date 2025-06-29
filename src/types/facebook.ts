export interface FacebookAccount {
  account_id: string;
  id: string;
  name?: string;
  account_status?: number;
  business?: {
    id: string;
    name: string;
  };
  business_name?: string;
  currency?: string;
  timezone_name?: string;
  timezone_offset_hours_utc?: number;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token?: string;
}

export interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  permalink_url?: string;
}

export interface CampaignData {
  name: string;
  page_id: string;
  post_id: string;
  daily_budget: number;
  age_min: number;
  age_max: number;
  start_time: string;
  end_time?: string;
  account_id?: string;
  campaign_objective?: string;
  optimization_goal?: string;
  bid_strategy?: string;
  billing_event?: string;
  destination_type?: string;
}

export interface FacebookCampaignResponse {
  id: string;
}

export interface FacebookAdSetResponse {
  id: string;
}

export interface FacebookCreativeResponse {
  id: string;
}

export interface FacebookAdResponse {
  id: string;
}

export interface CampaignCreateRequest {
  access_token: string;
  buying_type: string;
  name: string;
  objective: string;
  status: string;
  special_ad_categories: string[];
}

export interface AdSetCreateRequest {
  access_token: string;
  name: string;
  campaign_id: string;
  daily_budget: string;
  billing_event: string;
  optimization_goal: string;
  bid_strategy: string;
  destination_type?: string; // Added destination_type
  start_time: string;
  end_time?: string;
  targeting: {
    geo_locations: { countries: string[] };
    age_min: number;
    age_max: number;
    targeting_automation: {
      advantage_audience: number;
    };
  };
}

export interface CreativeCreateRequest {
  access_token: string;
  name: string;
  object_story_id: string;
}

export interface AdCreateRequest {
  access_token: string;
  name: string;
  adset_id: string;
  creative: {
    creative_id: string;
  };
  status: string;
}
