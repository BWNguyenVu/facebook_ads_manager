export interface FacebookCampaign {
  account_id: string;
  adlabels?: any[];
  bid_strategy?: string;
  boosted_object_id?: string;
  brand_lift_studies?: any[];
  budget_rebalance_flag?: boolean;
  budget_remaining?: string;
  buying_type?: string;
  can_create_brand_lift_study?: boolean;
  can_use_spend_cap?: boolean;
  configured_status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  created_time: string;
  daily_budget?: string;
  effective_status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' | 'PENDING_REVIEW' | 'DISAPPROVED' | 'PREAPPROVED' | 'PENDING_BILLING_INFO' | 'CAMPAIGN_PAUSED' | 'ADSET_PAUSED' | 'AD_PAUSED';
  id: string;
  is_skadnetwork_attribution?: boolean;
  issues_info?: any[];
  last_budget_toggling_time?: string;
  lifetime_budget?: string;
  name: string;
  objective?: string;
  recommendations?: any[];
  source_campaign?: any;
  source_campaign_id?: string;
  special_ad_categories?: string[];
  special_ad_category?: string;
  special_ad_category_country?: string[];
  spend_cap?: string;
  start_time?: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  stop_time?: string;
  topline_id?: string;
  updated_time: string;
}

export interface FacebookAdSet {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  end_time?: string;
  created_time?: string;
  updated_time?: string;
  campaign_id?: string;
  effective_status?: string;
  optimization_goal?: string;
  bid_strategy?: string;
  targeting?: any;
  attribution_spec?: any[];
  budget_remaining?: string;
}

export interface FacebookAd {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  adset_id: string;
  campaign_id: string;
  created_time: string;
  updated_time: string;
  effective_status: string;
  creative?: any;
  tracking_specs?: any[];
}

export interface CampaignPaging {
  cursors: {
    before: string;
    after: string;
  };
  next?: string;
  previous?: string;
}

export interface FacebookCampaignResponse {
  data: FacebookCampaign[];
  paging?: CampaignPaging;
}

export interface FacebookAdSetResponse {
  data: FacebookAdSet[];
  paging?: CampaignPaging;
}

export interface FacebookAdResponse {
  data: FacebookAd[];
  paging?: CampaignPaging;
}

export interface FacebookCampaignInsights {
  campaign_id?: string;
  campaign_name?: string;
  spend: string;
  impressions: string;
  reach: string;
  clicks: string;
  inline_link_clicks: string;
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  cpc: string;
  cpm: string;
  ctr: string;
  date_start: string;
  date_stop: string;
}

export interface FacebookCampaignWithInsights extends FacebookCampaign {
  insights?: FacebookCampaignInsights;
}
