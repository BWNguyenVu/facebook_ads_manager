export interface AccountInsight {
  spend: string;
  date_start: string;
  date_stop: string;
  impressions?: string;
  clicks?: string;
  reach?: string;
  frequency?: string;
  cpm?: string;
  cpc?: string;
  ctr?: string;
  cost_per_result?: string;
}

export interface AccountInsightsResponse {
  data: AccountInsight[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

export interface SpendSummary {
  today: number;
  yesterday: number;
  this_month: number;
  last_30d: number;
  maximum: number;
  currency: string;
}

export type DatePreset = 
  | 'today' 
  | 'yesterday' 
  | 'this_month' 
  | 'last_30d' 
  | 'maximum';

export interface AccountSpendData {
  period: DatePreset;
  label: string;
  spend: number;
  date_start: string;
  date_stop: string;
}
