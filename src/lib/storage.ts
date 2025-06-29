import { UserSettings, CampaignConfig } from '@/types/campaign';

const STORAGE_KEYS = {
  USER_SETTINGS: 'facebook_ads_user_settings',
  ACCESS_TOKEN: 'facebook_access_token',
  SELECTED_ACCOUNT: 'selected_account_id',
  CAMPAIGN_CONFIG: 'campaign_config'
};

// Default campaign configuration
const DEFAULT_CAMPAIGN_CONFIG: CampaignConfig = {
  default_daily_budget: 50000, // 50,000 VND (~$2 USD)
  default_age_min: 18,
  default_age_max: 45,
  default_geo_countries: ['VN'],
  default_bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
  default_optimization_goal: 'CONVERSATIONS',
  default_billing_event: 'IMPRESSIONS'
};

// Default user settings
const DEFAULT_USER_SETTINGS: UserSettings = {
  access_token: undefined,
  selected_account_id: undefined,
  recent_accounts: [],
  recent_pages: [],
  campaign_config: DEFAULT_CAMPAIGN_CONFIG
};

// Helper function to check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

// Get user settings from localStorage
export function getUserSettings(): UserSettings {
  if (!isLocalStorageAvailable()) {
    return DEFAULT_USER_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_USER_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Error loading user settings:', error);
  }

  return DEFAULT_USER_SETTINGS;
}

// Save user settings to localStorage
export function saveUserSettings(settings: Partial<UserSettings>): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const currentSettings = getUserSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Error saving user settings:', error);
  }
}

// Access token methods
export function getAccessToken(): string | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
}

export function saveAccessToken(token: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    saveUserSettings({ access_token: token });
  } catch (error) {
    console.error('Error saving access token:', error);
  }
}

export function clearAccessToken(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    saveUserSettings({ access_token: undefined });
  } catch (error) {
    console.error('Error clearing access token:', error);
  }
}

// Selected account methods
export function getSelectedAccountId(): string | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_ACCOUNT);
  } catch {
    return null;
  }
}

export function saveSelectedAccountId(accountId: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_ACCOUNT, accountId);
    saveUserSettings({ selected_account_id: accountId });
    
    // Add to recent accounts if not already there
    const settings = getUserSettings();
    const recentAccounts = settings.recent_accounts.filter(id => id !== accountId);
    recentAccounts.unshift(accountId);
    saveUserSettings({ recent_accounts: recentAccounts.slice(0, 10) }); // Keep only 10 recent
  } catch (error) {
    console.error('Error saving selected account:', error);
  }
}

// Campaign config methods
export function getCampaignConfig(): CampaignConfig {
  const settings = getUserSettings();
  return settings.campaign_config;
}

export function saveCampaignConfig(config: Partial<CampaignConfig>): void {
  const currentConfig = getCampaignConfig();
  const newConfig = { ...currentConfig, ...config };
  saveUserSettings({ campaign_config: newConfig });
}

// Recent items management
export function addRecentPage(pageId: string): void {
  const settings = getUserSettings();
  const recentPages = settings.recent_pages.filter(id => id !== pageId);
  recentPages.unshift(pageId);
  saveUserSettings({ recent_pages: recentPages.slice(0, 10) });
}

export function getRecentPages(): string[] {
  const settings = getUserSettings();
  return settings.recent_pages;
}

export function getRecentAccounts(): string[] {
  const settings = getUserSettings();
  return settings.recent_accounts;
}

// Clear all data
export function clearAllData(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}

// Export/Import settings
export function exportSettings(): string {
  const settings = getUserSettings();
  return JSON.stringify(settings, null, 2);
}

export function importSettings(settingsJson: string): boolean {
  try {
    const settings = JSON.parse(settingsJson);
    saveUserSettings(settings);
    return true;
  } catch (error) {
    console.error('Error importing settings:', error);
    return false;
  }
}
