import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===== FACEBOOK ENUM MAPPING UTILS =====

/**
 * Facebook Campaign Objectives mapping
 * Converts human-readable text to Facebook API enum
 */
export const CAMPAIGN_OBJECTIVE_MAPPING: Record<string, string> = {
  // Standard format
  OUTCOME_ENGAGEMENT: "OUTCOME_ENGAGEMENT",
  OUTCOME_LEADS: "OUTCOME_LEADS",
  OUTCOME_SALES: "OUTCOME_SALES",
  OUTCOME_TRAFFIC: "OUTCOME_TRAFFIC",
  OUTCOME_APP_PROMOTION: "OUTCOME_APP_PROMOTION",
  OUTCOME_AWARENESS: "OUTCOME_AWARENESS",

  // Human readable variations
  "outcome engagement": "OUTCOME_ENGAGEMENT",
  "Outcome Engagement": "OUTCOME_ENGAGEMENT",
  "outcome_engagement": "OUTCOME_ENGAGEMENT",
  engagement: "OUTCOME_ENGAGEMENT",
  Engagement: "OUTCOME_ENGAGEMENT",

  "outcome leads": "OUTCOME_LEADS",
  "Outcome Leads": "OUTCOME_LEADS",
  "outcome_leads": "OUTCOME_LEADS",
  leads: "OUTCOME_LEADS",
  Leads: "OUTCOME_LEADS",
  "lead generation": "OUTCOME_LEADS",
  "Lead Generation": "OUTCOME_LEADS",

  "outcome sales": "OUTCOME_SALES",
  "Outcome Sales": "OUTCOME_SALES",
  "outcome_sales": "OUTCOME_SALES",
  sales: "OUTCOME_SALES",
  Sales: "OUTCOME_SALES",
  conversions: "OUTCOME_SALES",
  Conversions: "OUTCOME_SALES",

  "outcome traffic": "OUTCOME_TRAFFIC",
  "Outcome Traffic": "OUTCOME_TRAFFIC",
  "outcome_traffic": "OUTCOME_TRAFFIC",
  traffic: "OUTCOME_TRAFFIC",
  Traffic: "OUTCOME_TRAFFIC",
  "website traffic": "OUTCOME_TRAFFIC",
  "Website Traffic": "OUTCOME_TRAFFIC",

  "outcome app promotion": "OUTCOME_APP_PROMOTION",
  "Outcome App Promotion": "OUTCOME_APP_PROMOTION",
  "outcome_app_promotion": "OUTCOME_APP_PROMOTION",
  "app promotion": "OUTCOME_APP_PROMOTION",
  "App Promotion": "OUTCOME_APP_PROMOTION",
  "app install": "OUTCOME_APP_PROMOTION",
  "App Install": "OUTCOME_APP_PROMOTION",

  "outcome awareness": "OUTCOME_AWARENESS",
  "Outcome Awareness": "OUTCOME_AWARENESS",
  "outcome_awareness": "OUTCOME_AWARENESS",
  awareness: "OUTCOME_AWARENESS",
  Awareness: "OUTCOME_AWARENESS",
  "brand awareness": "OUTCOME_AWARENESS",
  "Brand Awareness": "OUTCOME_AWARENESS",
  reach: "OUTCOME_AWARENESS",
  Reach: "OUTCOME_AWARENESS",
};

/**
 * Facebook Optimization Goals mapping
 */
export const OPTIMIZATION_GOAL_MAPPING: Record<string, string> = {
  // Standard format - Updated with Facebook's latest valid values
  NONE: "NONE",
  APP_INSTALLS: "APP_INSTALLS",
  AD_RECALL_LIFT: "AD_RECALL_LIFT",
  ENGAGED_USERS: "ENGAGED_USERS",
  EVENT_RESPONSES: "EVENT_RESPONSES",
  IMPRESSIONS: "IMPRESSIONS",
  LEAD_GENERATION: "LEAD_GENERATION",
  QUALITY_LEAD: "QUALITY_LEAD",
  LINK_CLICKS: "LINK_CLICKS",
  OFFSITE_CONVERSIONS: "OFFSITE_CONVERSIONS",
  PAGE_LIKES: "PAGE_LIKES",
  POST_ENGAGEMENT: "POST_ENGAGEMENT",
  QUALITY_CALL: "QUALITY_CALL",
  REACH: "REACH",
  LANDING_PAGE_VIEWS: "LANDING_PAGE_VIEWS",
  VISIT_INSTAGRAM_PROFILE: "VISIT_INSTAGRAM_PROFILE",
  VALUE: "VALUE",
  THRUPLAY: "THRUPLAY",
  DERIVED_EVENTS: "DERIVED_EVENTS",
  APP_INSTALLS_AND_OFFSITE_CONVERSIONS: "APP_INSTALLS_AND_OFFSITE_CONVERSIONS",
  CONVERSATIONS: "CONVERSATIONS",
  IN_APP_VALUE: "IN_APP_VALUE",
  MESSAGING_PURCHASE_CONVERSION: "MESSAGING_PURCHASE_CONVERSION",
  SUBSCRIBERS: "SUBSCRIBERS",
  REMINDERS_SET: "REMINDERS_SET",
  MEANINGFUL_CALL_ATTEMPT: "MEANINGFUL_CALL_ATTEMPT",
  PROFILE_VISIT: "PROFILE_VISIT",
  PROFILE_AND_PAGE_ENGAGEMENT: "PROFILE_AND_PAGE_ENGAGEMENT",
  ADVERTISER_SILOED_VALUE: "ADVERTISER_SILOED_VALUE",
  AUTOMATIC_OBJECTIVE: "AUTOMATIC_OBJECTIVE",
  MESSAGING_APPOINTMENT_CONVERSION: "MESSAGING_APPOINTMENT_CONVERSION",

  // Human readable variations
  "post engagement": "POST_ENGAGEMENT",
  "Post Engagement": "POST_ENGAGEMENT",
  "post_engagement": "POST_ENGAGEMENT",
  engagement: "POST_ENGAGEMENT",
  Engagement: "POST_ENGAGEMENT",

  // Map "actions" to POST_ENGAGEMENT (common in CSV files)
  actions: "POST_ENGAGEMENT",
  Actions: "POST_ENGAGEMENT",
  action: "POST_ENGAGEMENT",
  Action: "POST_ENGAGEMENT",

  "link clicks": "LINK_CLICKS",
  "Link Clicks": "LINK_CLICKS",
  "link_clicks": "LINK_CLICKS",
  clicks: "LINK_CLICKS",
  Clicks: "LINK_CLICKS",

  "landing page views": "LANDING_PAGE_VIEWS",
  "Landing Page Views": "LANDING_PAGE_VIEWS",
  "landing_page_views": "LANDING_PAGE_VIEWS",
  "page views": "LANDING_PAGE_VIEWS",
  "Page Views": "LANDING_PAGE_VIEWS",

  impressions: "IMPRESSIONS",
  Impressions: "IMPRESSIONS",

  reach: "REACH",
  Reach: "REACH",

  conversions: "OFFSITE_CONVERSIONS",
  Conversions: "OFFSITE_CONVERSIONS",
  "offsite conversions": "OFFSITE_CONVERSIONS",
  "Offsite Conversions": "OFFSITE_CONVERSIONS",

  leads: "LEAD_GENERATION",
  Leads: "LEAD_GENERATION",
  "lead generation": "LEAD_GENERATION",
  "Lead Generation": "LEAD_GENERATION",

  "page likes": "PAGE_LIKES",
  "Page Likes": "PAGE_LIKES",
  "page_likes": "PAGE_LIKES",
  likes: "PAGE_LIKES",
  Likes: "PAGE_LIKES",

  "app installs": "APP_INSTALLS",
  "App Installs": "APP_INSTALLS",
  "app_installs": "APP_INSTALLS",
  installs: "APP_INSTALLS",
  Installs: "APP_INSTALLS",

  // Default for engagement campaigns
  none: "NONE",
  None: "NONE",
  default: "NONE",
  Default: "NONE",
};

/**
 * Facebook Bid Strategy mapping
 */
export const BID_STRATEGY_MAPPING: Record<string, string> = {
  // Standard format - Updated with Facebook's latest valid values
  LOWEST_COST_WITHOUT_CAP: "LOWEST_COST_WITHOUT_CAP",
  LOWEST_COST_WITH_BID_CAP: "LOWEST_COST_WITH_BID_CAP",
  COST_CAP: "COST_CAP",
  LOWEST_COST_WITH_MIN_ROAS: "LOWEST_COST_WITH_MIN_ROAS",

  // Human readable variations
  "lowest cost without cap": "LOWEST_COST_WITHOUT_CAP",
  "Lowest Cost Without Cap": "LOWEST_COST_WITHOUT_CAP",
  "lowest_cost_without_cap": "LOWEST_COST_WITHOUT_CAP",
  automatic: "LOWEST_COST_WITHOUT_CAP",
  Automatic: "LOWEST_COST_WITHOUT_CAP",
  "auto bid": "LOWEST_COST_WITHOUT_CAP",
  "Auto Bid": "LOWEST_COST_WITHOUT_CAP",

  "lowest cost with bid cap": "LOWEST_COST_WITH_BID_CAP",
  "Lowest Cost With Bid Cap": "LOWEST_COST_WITH_BID_CAP",
  "lowest_cost_with_bid_cap": "LOWEST_COST_WITH_BID_CAP",
  "bid cap": "LOWEST_COST_WITH_BID_CAP",
  "Bid Cap": "LOWEST_COST_WITH_BID_CAP",

  // Map manual_bid to LOWEST_COST_WITH_BID_CAP (common misconception)
  "manual bid": "LOWEST_COST_WITH_BID_CAP",
  "Manual Bid": "LOWEST_COST_WITH_BID_CAP",
  manual_bid: "LOWEST_COST_WITH_BID_CAP",
  "manual bidding": "LOWEST_COST_WITH_BID_CAP",
  "Manual Bidding": "LOWEST_COST_WITH_BID_CAP",

  "cost cap": "COST_CAP",
  "Cost Cap": "COST_CAP",
  cost_cap: "COST_CAP",

  "target cost": "LOWEST_COST_WITH_MIN_ROAS", // Updated mapping
  "Target Cost": "LOWEST_COST_WITH_MIN_ROAS",
  target_cost: "LOWEST_COST_WITH_MIN_ROAS",
  "lowest cost with min roas": "LOWEST_COST_WITH_MIN_ROAS",
  "Lowest Cost With Min ROAS": "LOWEST_COST_WITH_MIN_ROAS",
  "lowest_cost_with_min_roas": "LOWEST_COST_WITH_MIN_ROAS",
  roas: "LOWEST_COST_WITH_MIN_ROAS",
  ROAS: "LOWEST_COST_WITH_MIN_ROAS",
};

/**
 * Facebook Billing Event mapping
 */
export const BILLING_EVENT_MAPPING: Record<string, string> = {
  // Standard format - Updated with Facebook's latest valid values
  APP_INSTALLS: "APP_INSTALLS",
  CLICKS: "CLICKS",
  IMPRESSIONS: "IMPRESSIONS",
  LINK_CLICKS: "LINK_CLICKS",
  NONE: "NONE",
  OFFER_CLAIMS: "OFFER_CLAIMS",
  PAGE_LIKES: "PAGE_LIKES",
  POST_ENGAGEMENT: "POST_ENGAGEMENT",
  THRUPLAY: "THRUPLAY",
  PURCHASE: "PURCHASE",
  LISTING_INTERACTION: "LISTING_INTERACTION",

  // Human readable variations
  impressions: "IMPRESSIONS",
  Impressions: "IMPRESSIONS",
  impression: "IMPRESSIONS",
  Impression: "IMPRESSIONS",

  clicks: "CLICKS",
  Clicks: "CLICKS",
  click: "CLICKS",
  Click: "CLICKS",
  "link clicks": "LINK_CLICKS",
  "Link Clicks": "LINK_CLICKS",
  "link_clicks": "LINK_CLICKS",

  // Map "action" and "actions" to POST_ENGAGEMENT (common in CSV files)
  actions: "POST_ENGAGEMENT",
  Actions: "POST_ENGAGEMENT",
  action: "POST_ENGAGEMENT",
  Action: "POST_ENGAGEMENT",
  "post engagement": "POST_ENGAGEMENT",
  "Post Engagement": "POST_ENGAGEMENT",
  "post_engagement": "POST_ENGAGEMENT",
  engagement: "POST_ENGAGEMENT",
  Engagement: "POST_ENGAGEMENT",

  conversions: "PURCHASE",
  Conversions: "PURCHASE",
  purchase: "PURCHASE",
  Purchase: "PURCHASE",
  purchases: "PURCHASE",
  Purchases: "PURCHASE",

  "app installs": "APP_INSTALLS",
  "App Installs": "APP_INSTALLS",
  "app_installs": "APP_INSTALLS",
  installs: "APP_INSTALLS",
  Installs: "APP_INSTALLS",

  "page likes": "PAGE_LIKES",
  "Page Likes": "PAGE_LIKES",
  "page_likes": "PAGE_LIKES",
  likes: "PAGE_LIKES",
  Likes: "PAGE_LIKES",

  none: "NONE",
  None: "NONE",
  default: "IMPRESSIONS", // Default to impressions
  Default: "IMPRESSIONS",
};

/**
 * Facebook Destination Type mapping
 */
export const DESTINATION_TYPE_MAPPING: Record<string, string> = {
  // Standard format - Facebook's valid destination types
  WEBSITE: "WEBSITE",
  APP: "APP",
  MESSENGER: "MESSENGER",
  APPLINKS_AUTOMATIC: "APPLINKS_AUTOMATIC",
  WHATSAPP: "WHATSAPP",
  INSTAGRAM_DIRECT: "INSTAGRAM_DIRECT",
  FACEBOOK: "FACEBOOK",
  MESSAGING_MESSENGER_WHATSAPP: "MESSAGING_MESSENGER_WHATSAPP",
  MESSAGING_INSTAGRAM_DIRECT_MESSENGER: "MESSAGING_INSTAGRAM_DIRECT_MESSENGER",
  MESSAGING_INSTAGRAM_DIRECT_MESSENGER_WHATSAPP: "MESSAGING_INSTAGRAM_DIRECT_MESSENGER_WHATSAPP",
  MESSAGING_INSTAGRAM_DIRECT_WHATSAPP: "MESSAGING_INSTAGRAM_DIRECT_WHATSAPP",
  SHOP_AUTOMATIC: "SHOP_AUTOMATIC",
  ON_AD: "ON_AD",
  ON_POST: "ON_POST",
  ON_EVENT: "ON_EVENT",
  ON_VIDEO: "ON_VIDEO",
  ON_PAGE: "ON_PAGE",
  INSTAGRAM_PROFILE: "INSTAGRAM_PROFILE",
  FACEBOOK_PAGE: "FACEBOOK_PAGE",
  INSTAGRAM_PROFILE_AND_FACEBOOK_PAGE: "INSTAGRAM_PROFILE_AND_FACEBOOK_PAGE",
  INSTAGRAM_LIVE: "INSTAGRAM_LIVE",
  FACEBOOK_LIVE: "FACEBOOK_LIVE",
  IMAGINE: "IMAGINE",

  // Human readable variations
  website: "WEBSITE",
  Website: "WEBSITE",
  web: "WEBSITE",
  Web: "WEBSITE",
  
  app: "APP",
  App: "APP",
  application: "APP",
  Application: "APP",
  
  messenger: "MESSENGER",
  Messenger: "MESSENGER",
  
  whatsapp: "WHATSAPP",
  WhatsApp: "WHATSAPP",
  "whats app": "WHATSAPP",
  "Whats App": "WHATSAPP",
  
  facebook: "FACEBOOK",
  Facebook: "FACEBOOK",
  fb: "FACEBOOK",
  FB: "FACEBOOK",
  
  instagram: "INSTAGRAM_DIRECT",
  Instagram: "INSTAGRAM_DIRECT",
  ig: "INSTAGRAM_DIRECT",
  IG: "INSTAGRAM_DIRECT",
  
  "facebook page": "FACEBOOK_PAGE",
  "Facebook Page": "FACEBOOK_PAGE",
  "facebook_page": "FACEBOOK_PAGE",
  page: "FACEBOOK_PAGE",
  Page: "FACEBOOK_PAGE",
  
  "instagram profile": "INSTAGRAM_PROFILE",
  "Instagram Profile": "INSTAGRAM_PROFILE",
  "instagram_profile": "INSTAGRAM_PROFILE",
  profile: "INSTAGRAM_PROFILE",
  Profile: "INSTAGRAM_PROFILE",
  
  post: "ON_POST",
  Post: "ON_POST",
  "on post": "ON_POST",
  "On Post": "ON_POST",
  
  video: "ON_VIDEO",
  Video: "ON_VIDEO",
  "on video": "ON_VIDEO",
  "On Video": "ON_VIDEO",
  
  // Default for engagement campaigns
  default: "ON_POST",
  Default: "ON_POST",
};

/**
 * Map destination type from human readable to Facebook enum
 */
export function mapDestinationType(value: string): string {
  if (!value || typeof value !== "string") return "ON_POST"; // Default for engagement campaigns

  const trimmedValue = value.trim();

  // Direct mapping first
  if (DESTINATION_TYPE_MAPPING[trimmedValue]) {
    return DESTINATION_TYPE_MAPPING[trimmedValue];
  }

  // Try normalized mapping
  const normalized = normalizeEnumValue(trimmedValue);
  if (DESTINATION_TYPE_MAPPING[normalized]) {
    return DESTINATION_TYPE_MAPPING[normalized];
  }

  // Try case-insensitive search
  const lowerValue = trimmedValue.toLowerCase();
  for (const [key, mappedValue] of Object.entries(DESTINATION_TYPE_MAPPING)) {
    if (key.toLowerCase() === lowerValue) {
      return mappedValue;
    }
  }

  // Return default for engagement campaigns
  return "ON_POST";
}

/**
 * Get compatible destination types for a given campaign objective
 */
export function getCompatibleDestinationTypes(objective: string): string[] {
  switch (objective) {
    case "OUTCOME_ENGAGEMENT":
      return ["ON_POST", "ON_VIDEO", "ON_PAGE", "FACEBOOK_PAGE", "INSTAGRAM_PROFILE"];
    
    case "OUTCOME_TRAFFIC":
      return ["WEBSITE", "ON_POST", "FACEBOOK_PAGE"];
    
    case "OUTCOME_LEADS":
      return ["WEBSITE", "MESSENGER", "WHATSAPP", "INSTAGRAM_DIRECT"];
    
    case "OUTCOME_SALES":
      return ["WEBSITE", "SHOP_AUTOMATIC", "ON_POST"];
    
    case "OUTCOME_APP_PROMOTION":
      return ["APP", "APPLINKS_AUTOMATIC"];
    
    case "OUTCOME_AWARENESS":
      return ["ON_POST", "ON_VIDEO", "FACEBOOK_PAGE", "INSTAGRAM_PROFILE"];
    
    default:
      return ["ON_POST", "ON_VIDEO", "FACEBOOK_PAGE"];
  }
}

/**
 * Auto-select appropriate destination type based on campaign objective
 */
export function getDefaultDestinationType(objective: string): string {
  switch (objective) {
    case "OUTCOME_ENGAGEMENT":
      return "ON_POST";
    
    case "OUTCOME_TRAFFIC":
      return "WEBSITE";
    
    case "OUTCOME_LEADS":
      return "WEBSITE";
    
    case "OUTCOME_SALES":
      return "WEBSITE";
    
    case "OUTCOME_APP_PROMOTION":
      return "APP";
    
    case "OUTCOME_AWARENESS":
      return "ON_POST";
    
    default:
      return "ON_POST";
  }
}

/**
 * Generic function to normalize enum values
 * Removes spaces, converts to uppercase, replaces spaces with underscores
 */
export function normalizeEnumValue(value: string): string {
  if (!value || typeof value !== "string") return value;

  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

/**
 * Map campaign objective from human readable to Facebook enum
 */
export function mapCampaignObjective(value: string): string {
  if (!value || typeof value !== "string") return value;

  const trimmedValue = value.trim();

  // Direct mapping first
  if (CAMPAIGN_OBJECTIVE_MAPPING[trimmedValue]) {
    return CAMPAIGN_OBJECTIVE_MAPPING[trimmedValue];
  }

  // Try normalized mapping
  const normalized = normalizeEnumValue(trimmedValue);
  if (CAMPAIGN_OBJECTIVE_MAPPING[normalized]) {
    return CAMPAIGN_OBJECTIVE_MAPPING[normalized];
  }

  // Try case-insensitive search
  const lowerValue = trimmedValue.toLowerCase();
  for (const [key, mappedValue] of Object.entries(CAMPAIGN_OBJECTIVE_MAPPING)) {
    if (key.toLowerCase() === lowerValue) {
      return mappedValue;
    }
  }

  // Return normalized value as fallback
  return normalized || value;
}

/**
 * Get compatible optimization goals for a given campaign objective
 */
export function getCompatibleOptimizationGoals(objective: string): string[] {
  switch (objective) {
    case "OUTCOME_ENGAGEMENT":
      return ["POST_ENGAGEMENT", "REACH", "IMPRESSIONS", "PAGE_LIKES"];
    
    case "OUTCOME_TRAFFIC":
      return ["LINK_CLICKS", "LANDING_PAGE_VIEWS", "REACH", "IMPRESSIONS"];
    
    case "OUTCOME_LEADS":
      return ["LEAD_GENERATION", "QUALITY_LEAD", "OFFSITE_CONVERSIONS"];
    
    case "OUTCOME_SALES":
      return ["OFFSITE_CONVERSIONS", "VALUE", "LINK_CLICKS", "LANDING_PAGE_VIEWS"];
    
    case "OUTCOME_APP_PROMOTION":
      return ["APP_INSTALLS", "APP_INSTALLS_AND_OFFSITE_CONVERSIONS", "IN_APP_VALUE"];
    
    case "OUTCOME_AWARENESS":
      return ["REACH", "IMPRESSIONS", "AD_RECALL_LIFT"];
    
    default:
      return ["POST_ENGAGEMENT", "REACH", "IMPRESSIONS"];
  }
}

/**
 * Auto-select appropriate optimization goal based on campaign objective
 */
export function getDefaultOptimizationGoal(objective: string): string {
  switch (objective) {
    case "OUTCOME_ENGAGEMENT":
      return "POST_ENGAGEMENT";
    
    case "OUTCOME_TRAFFIC":
      return "LINK_CLICKS";
    
    case "OUTCOME_LEADS":
      return "LEAD_GENERATION";
    
    case "OUTCOME_SALES":
      return "OFFSITE_CONVERSIONS";
    
    case "OUTCOME_APP_PROMOTION":
      return "APP_INSTALLS";
    
    case "OUTCOME_AWARENESS":
      return "REACH";
    
    default:
      return "POST_ENGAGEMENT";
  }
}

/**
 * Map optimization goal with compatibility check
 */
export function mapOptimizationGoalWithCompatibility(value: string, objective: string): string {
  if (!value || typeof value !== "string") {
    return getDefaultOptimizationGoal(objective);
  }

  // First try to map the value normally
  const mappedGoal = mapOptimizationGoal(value);
  
  // Check if the mapped goal is compatible with the objective
  const compatibleGoals = getCompatibleOptimizationGoals(objective);
  
  if (compatibleGoals.includes(mappedGoal)) {
    return mappedGoal;
  }
  
  // If not compatible, return the default for this objective
  console.warn(`⚠️ Optimization goal "${mappedGoal}" is not compatible with objective "${objective}". Using default: "${getDefaultOptimizationGoal(objective)}"`);
  return getDefaultOptimizationGoal(objective);
}

export function mapOptimizationGoal(value: string): string {
  if (!value || typeof value !== "string") return "POST_ENGAGEMENT"; // Safe default

  const trimmedValue = value.trim();

  // Direct mapping first
  if (OPTIMIZATION_GOAL_MAPPING[trimmedValue]) {
    return OPTIMIZATION_GOAL_MAPPING[trimmedValue];
  }

  // Try normalized mapping
  const normalized = normalizeEnumValue(trimmedValue);
  if (OPTIMIZATION_GOAL_MAPPING[normalized]) {
    return OPTIMIZATION_GOAL_MAPPING[normalized];
  }

  // Try case-insensitive search
  const lowerValue = trimmedValue.toLowerCase();
  for (const [key, mappedValue] of Object.entries(OPTIMIZATION_GOAL_MAPPING)) {
    if (key.toLowerCase() === lowerValue) {
      return mappedValue;
    }
  }

  // Return safe default instead of normalized value
  console.warn(`⚠️ Unknown optimization goal "${value}". Using safe default: POST_ENGAGEMENT`);
  return "POST_ENGAGEMENT";
}

/**
 * Map bid strategy from human readable to Facebook enum
 */
export function mapBidStrategy(value: string): string {
  if (!value || typeof value !== "string") return "LOWEST_COST_WITHOUT_CAP"; // Safe default

  const trimmedValue = value.trim();

  // Direct mapping first
  if (BID_STRATEGY_MAPPING[trimmedValue]) {
    return BID_STRATEGY_MAPPING[trimmedValue];
  }

  // Try normalized mapping
  const normalized = normalizeEnumValue(trimmedValue);
  if (BID_STRATEGY_MAPPING[normalized]) {
    return BID_STRATEGY_MAPPING[normalized];
  }

  // Try case-insensitive search
  const lowerValue = trimmedValue.toLowerCase();
  for (const [key, mappedValue] of Object.entries(BID_STRATEGY_MAPPING)) {
    if (key.toLowerCase() === lowerValue) {
      return mappedValue;
    }
  }

  // Return safe default instead of normalized value
  console.warn(`⚠️ Unknown bid strategy "${value}". Using safe default: LOWEST_COST_WITHOUT_CAP`);
  return "LOWEST_COST_WITHOUT_CAP";
}

/**
 * Map billing event from human readable to Facebook enum
 */
export function mapBillingEvent(value: string): string {
  if (!value || typeof value !== "string") return "IMPRESSIONS"; // Safe default

  const trimmedValue = value.trim();

  // Direct mapping first
  if (BILLING_EVENT_MAPPING[trimmedValue]) {
    return BILLING_EVENT_MAPPING[trimmedValue];
  }

  // Try normalized mapping
  const normalized = normalizeEnumValue(trimmedValue);
  if (BILLING_EVENT_MAPPING[normalized]) {
    return BILLING_EVENT_MAPPING[normalized];
  }

  // Try case-insensitive search
  const lowerValue = trimmedValue.toLowerCase();
  for (const [key, mappedValue] of Object.entries(BILLING_EVENT_MAPPING)) {
    if (key.toLowerCase() === lowerValue) {
      return mappedValue;
    }
  }

  // Return safe default instead of normalized value
  console.warn(`⚠️ Unknown billing event "${value}". Using safe default: IMPRESSIONS`);
  return "IMPRESSIONS";
}

/**
 * Main function to auto-map all enum fields in campaign data
 */
export function autoMapFacebookEnums(campaignData: any): any {
  if (!campaignData || typeof campaignData !== "object") {
    return campaignData;
  }

  const mapped = { ...campaignData };

  // Map campaign objective first
  if (mapped.campaign_objective) {
    const originalValue = mapped.campaign_objective;
    mapped.campaign_objective = mapCampaignObjective(originalValue);
    if (mapped.campaign_objective !== originalValue) {
      console.log(
        `✅ Auto-mapped Campaign Objective: "${originalValue}" → "${mapped.campaign_objective}"`
      );
    }
  }

  // Map optimization goal with compatibility check
  if (mapped.optimization_goal) {
    const originalValue = mapped.optimization_goal;
    mapped.optimization_goal = mapOptimizationGoalWithCompatibility(
      originalValue, 
      mapped.campaign_objective || "OUTCOME_ENGAGEMENT"
    );
    if (mapped.optimization_goal !== originalValue) {
      console.log(
        `✅ Auto-mapped Optimization Goal: "${originalValue}" → "${mapped.optimization_goal}" (compatible with ${mapped.campaign_objective})`
      );
    }
  } else if (mapped.campaign_objective) {
    // Auto-set optimization goal if not provided
    mapped.optimization_goal = getDefaultOptimizationGoal(mapped.campaign_objective);
    console.log(
      `✅ Auto-set Optimization Goal: "${mapped.optimization_goal}" (default for ${mapped.campaign_objective})`
    );
  }

  // Map bid strategy
  if (mapped.bid_strategy) {
    const originalValue = mapped.bid_strategy;
    mapped.bid_strategy = mapBidStrategy(originalValue);
    if (mapped.bid_strategy !== originalValue) {
      console.log(
        `✅ Auto-mapped Bid Strategy: "${originalValue}" → "${mapped.bid_strategy}"`
      );
    }
  }

  // Map billing event
  if (mapped.billing_event) {
    const originalValue = mapped.billing_event;
    mapped.billing_event = mapBillingEvent(originalValue);
    if (mapped.billing_event !== originalValue) {
      console.log(
        `✅ Auto-mapped Billing Event: "${originalValue}" → "${mapped.billing_event}"`
      );
    }
  }

  // Map destination type
  if (mapped.destination_type) {
    const originalValue = mapped.destination_type;
    mapped.destination_type = mapDestinationType(originalValue);
    if (mapped.destination_type !== originalValue) {
      console.log(
        `✅ Auto-mapped Destination Type: "${originalValue}" → "${mapped.destination_type}"`
      );
    }
  } else if (mapped.campaign_objective) {
    // Auto-set destination type if not provided
    mapped.destination_type = getDefaultDestinationType(mapped.campaign_objective);
    console.log(
      `✅ Auto-set Destination Type: "${mapped.destination_type}" (default for ${mapped.campaign_objective})`
    );
  }

  return mapped;
}

/**
 * Validate Facebook enum values after mapping
 */
export function validateFacebookEnums(
  campaignData: any
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!campaignData || typeof campaignData !== "object") {
    return { isValid: false, errors: ["Invalid campaign data object"] };
  }

  // Validate campaign objective
  const validObjectives = [
    "OUTCOME_ENGAGEMENT",
    "OUTCOME_LEADS",
    "OUTCOME_SALES",
    "OUTCOME_TRAFFIC",
    "OUTCOME_APP_PROMOTION",
    "OUTCOME_AWARENESS",
  ];
  if (
    campaignData.campaign_objective &&
    !validObjectives.includes(campaignData.campaign_objective)
  ) {
    errors.push(
      `Invalid campaign objective: "${campaignData.campaign_objective}". Valid values: ${validObjectives.join(
        ", "
      )}`
    );
  }

  // Validate optimization goal
  const validOptimizationGoals = [
    "NONE", "APP_INSTALLS", "AD_RECALL_LIFT", "ENGAGED_USERS", "EVENT_RESPONSES", 
    "IMPRESSIONS", "LEAD_GENERATION", "QUALITY_LEAD", "LINK_CLICKS", "OFFSITE_CONVERSIONS", 
    "PAGE_LIKES", "POST_ENGAGEMENT", "QUALITY_CALL", "REACH", "LANDING_PAGE_VIEWS", 
    "VISIT_INSTAGRAM_PROFILE", "VALUE", "THRUPLAY", "DERIVED_EVENTS", 
    "APP_INSTALLS_AND_OFFSITE_CONVERSIONS", "CONVERSATIONS", "IN_APP_VALUE", 
    "MESSAGING_PURCHASE_CONVERSION", "SUBSCRIBERS", "REMINDERS_SET", 
    "MEANINGFUL_CALL_ATTEMPT", "PROFILE_VISIT", "PROFILE_AND_PAGE_ENGAGEMENT", 
    "ADVERTISER_SILOED_VALUE", "AUTOMATIC_OBJECTIVE", "MESSAGING_APPOINTMENT_CONVERSION"
  ];
  if (
    campaignData.optimization_goal &&
    !validOptimizationGoals.includes(campaignData.optimization_goal)
  ) {
    errors.push(
      `Invalid optimization goal: "${campaignData.optimization_goal}". Valid values: ${validOptimizationGoals.join(
        ", "
      )}`
    );
  }

  // Validate bid strategy
  const validBidStrategies = [
    "LOWEST_COST_WITHOUT_CAP",
    "LOWEST_COST_WITH_BID_CAP",
    "COST_CAP",
    "LOWEST_COST_WITH_MIN_ROAS",
  ];
  if (campaignData.bid_strategy && !validBidStrategies.includes(campaignData.bid_strategy)) {
    errors.push(`Invalid bid strategy: "${campaignData.bid_strategy}". Valid values: ${validBidStrategies.join(', ')}`);
  }
  
  // Validate billing event
  const validBillingEvents = [
    'APP_INSTALLS', 'CLICKS', 'IMPRESSIONS', 'LINK_CLICKS', 'NONE', 
    'OFFER_CLAIMS', 'PAGE_LIKES', 'POST_ENGAGEMENT', 'THRUPLAY', 
    'PURCHASE', 'LISTING_INTERACTION'
  ];
  if (campaignData.billing_event && !validBillingEvents.includes(campaignData.billing_event)) {
    errors.push(`Invalid billing event: "${campaignData.billing_event}". Valid values: ${validBillingEvents.join(', ')}`);
  }

  // Validate destination type
  const validDestinationTypes = [
    'WEBSITE', 'APP', 'MESSENGER', 'APPLINKS_AUTOMATIC', 'WHATSAPP', 
    'INSTAGRAM_DIRECT', 'FACEBOOK', 'MESSAGING_MESSENGER_WHATSAPP', 
    'MESSAGING_INSTAGRAM_DIRECT_MESSENGER', 'MESSAGING_INSTAGRAM_DIRECT_MESSENGER_WHATSAPP', 
    'MESSAGING_INSTAGRAM_DIRECT_WHATSAPP', 'SHOP_AUTOMATIC', 'ON_AD', 'ON_POST', 
    'ON_EVENT', 'ON_VIDEO', 'ON_PAGE', 'INSTAGRAM_PROFILE', 'FACEBOOK_PAGE', 
    'INSTAGRAM_PROFILE_AND_FACEBOOK_PAGE', 'INSTAGRAM_LIVE', 'FACEBOOK_LIVE', 'IMAGINE'
  ];
  if (campaignData.destination_type && !validDestinationTypes.includes(campaignData.destination_type)) {
    errors.push(`Invalid destination type: "${campaignData.destination_type}". Valid values: ${validDestinationTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
