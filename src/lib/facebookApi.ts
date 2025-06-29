import axios from 'axios';
import {
  FacebookAccount,
  FacebookPage,
  FacebookPost,
  CampaignCreateRequest,
  AdSetCreateRequest,
  CreativeCreateRequest,
  AdCreateRequest,
  FacebookCampaignResponse,
  FacebookAdSetResponse,
  FacebookCreativeResponse,
  FacebookAdResponse
} from '@/types/facebook';

const FACEBOOK_API_BASE = 'https://graph.facebook.com/v23.0';

export class FacebookAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Getter for access token
  public getAccessToken(): string {
    return this.accessToken;
  }

  // Lấy danh sách ad accounts
  async getAdAccounts(): Promise<FacebookAccount[]> {
    try {
      const response = await axios.get(`${FACEBOOK_API_BASE}/me/adaccounts`, {
        params: {
          access_token: this.accessToken,
          fields: 'account_id,name,account_status,business,currency,timezone_name,timezone_offset_hours_utc'
        }
      });
      return response.data.data.map((account: any) => ({
        ...account,
        business_name: account.business?.name || null
      }));
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      throw new Error('Failed to fetch ad accounts');
    }
  }

  // Lấy danh sách pages
  async getPages(): Promise<FacebookPage[]> {
    try {
      const response = await axios.get(`${FACEBOOK_API_BASE}/me/accounts`, {
        params: {
          access_token: this.accessToken
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw new Error('Failed to fetch pages');
    }
  }

  // Lấy posts từ page
  async getPagePosts(pageId: string, pageAccessToken?: string): Promise<FacebookPost[]> {
    try {
      const token = pageAccessToken || this.accessToken;
      const response = await axios.get(`${FACEBOOK_API_BASE}/${pageId}/posts`, {
        params: {
          access_token: token,
          fields: 'id,message,created_time,permalink_url'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching page posts:', error);
      throw new Error('Failed to fetch page posts');
    }
  }

  // Tạo campaign
  async createCampaign(accountId: string, data: CampaignCreateRequest): Promise<FacebookCampaignResponse> {
    try {
      const url = `${FACEBOOK_API_BASE}/act_${accountId}/campaigns`;
      const requestData = new URLSearchParams(data as any);
      
      console.log('=== FACEBOOK API CREATE CAMPAIGN ===');
      console.log('URL:', url);
      console.log('Request Data (URLSearchParams):', requestData.toString());
      console.log('Access Token Preview:', data.access_token?.substring(0, 30) + '...');
      console.log('Access Token Length:', data.access_token?.length);
      console.log('Original Data Object:', JSON.stringify(data, null, 2));
      console.log('Account ID:', accountId);
      console.log('==================================');

      const response = await axios.post(url, requestData);
      
      console.log('Campaign creation response:', response.data);
      console.log('Response status:', response.status);
      
      return response.data;
    } catch (error: any) {
      console.error('=== CAMPAIGN CREATION ERROR ===');
      console.error('Error details:', error.response?.data || error);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Request URL:', error.config?.url);
      console.error('Request data:', error.config?.data);
      console.error('==============================');
      
      throw new Error(`Failed to create campaign: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Tạo adset
  async createAdSet(accountId: string, data: AdSetCreateRequest): Promise<FacebookAdSetResponse> {
    try {
      const formData = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await axios.post(
        `${FACEBOOK_API_BASE}/act_${accountId}/adsets`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating adset:', error.response?.data || error);
      throw new Error(`Failed to create adset: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Tạo creative
  async createCreative(accountId: string, data: CreativeCreateRequest): Promise<FacebookCreativeResponse> {
    try {
      const response = await axios.post(
        `${FACEBOOK_API_BASE}/act_${accountId}/adcreatives`,
        new URLSearchParams(data as any)
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating creative:', error.response?.data || error);
      throw new Error(`Failed to create creative: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Tạo ad
  async createAd(accountId: string, data: AdCreateRequest): Promise<FacebookAdResponse> {
    try {
      const formData = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await axios.post(
        `${FACEBOOK_API_BASE}/act_${accountId}/ads`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating ad:', error.response?.data || error);
      throw new Error(`Failed to create ad: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Validate access token
  async validateToken(): Promise<boolean> {
    try {
      await axios.get(`${FACEBOOK_API_BASE}/me`, {
        params: {
          access_token: this.accessToken
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Validate post exists by checking via page
  async validatePost(postId: string, pageId?: string): Promise<boolean> {
    try {
      // Method 1: Try to get post directly with different API version
      try {
        const response = await axios.get(`${FACEBOOK_API_BASE}/${postId}`, {
          params: {
            access_token: this.accessToken,
            fields: 'id,message,created_time'
          }
        });
        console.log('Post validation result (direct):', response.data);
        return !!response.data.id;
      } catch (directError) {
        console.log('Direct post access failed, trying alternative method...');
      }

      // Method 2: If we have pageId, check via page posts
      if (pageId) {
        try {
          const response = await axios.get(`${FACEBOOK_API_BASE}/${pageId}/posts`, {
            params: {
              access_token: this.accessToken,
              fields: 'id,message,created_time',
              limit: 100
            }
          });
          
          const posts = response.data.data || [];
          const postExists = posts.some((post: any) => 
            post.id === postId || 
            post.id === `${pageId}_${postId}` ||
            post.id.endsWith(`_${postId}`)
          );
          
          console.log('Post validation via page posts:', postExists);
          return postExists;
        } catch (pageError) {
          console.log('Page posts access failed, assuming post is valid...');
        }
      }

      // Method 3: Skip validation and assume post is valid
      // This is because the post_id format might be correct but API access is restricted
      console.log('Post validation skipped - assuming post is valid');
      return true;
      
    } catch (error: any) {
      console.error('Post validation failed:', error.response?.data || error);
      // If validation fails, we'll assume the post is valid and let Facebook validate during creative creation
      console.log('Post validation inconclusive - assuming post is valid');
      return true;
    }
  }
}

// Helper function to validate post ID format
function validatePostIdFormat(postId: string, pageId: string): { isValid: boolean; suggestion?: string } {
  // Remove any whitespace
  const cleanPostId = postId.trim();
  const cleanPageId = pageId.trim();
  
  // Check if post_id contains page_id (common mistake)
  if (cleanPostId.includes(cleanPageId)) {
    const correctedPostId = cleanPostId.replace(`${cleanPageId}_`, '');
    return {
      isValid: false,
      suggestion: correctedPostId
    };
  }
  
  // Check if it's just numbers and reasonable length (Facebook post IDs are typically 15-16 digits)
  if (!/^\d+$/.test(cleanPostId)) {
    return { isValid: false };
  }
  
  if (cleanPostId.length < 10 || cleanPostId.length > 20) {
    return { isValid: false };
  }
  
  return { isValid: true };
}

// Helper function để tạo full campaign từ CSV data
export async function createFullCampaign(
  facebookApi: FacebookAPI,
  accountId: string,
  campaignData: any,
  config: any = {}
) {
  const results = {
    campaign_id: '',
    adset_id: '',
    creative_id: '',
    ad_id: '',
    error: ''
  };

  try {
    console.log('=== CREATING FULL CAMPAIGN ===');
    console.log('Account ID:', accountId);
    console.log('Campaign Data:', JSON.stringify(campaignData, null, 2));
    console.log('Config:', JSON.stringify(config, null, 2));

    // Auto-map Facebook enums before processing
    const { autoMapFacebookEnums } = await import('./utils');
    const mappedCampaignData = autoMapFacebookEnums(campaignData);
    console.log('Mapped Campaign Data:', JSON.stringify(mappedCampaignData, null, 2));

    // 1. Tạo Campaign
    const campaignRequest: CampaignCreateRequest = {
      access_token: facebookApi.getAccessToken(),
      buying_type: 'AUCTION',
      name: mappedCampaignData.name,
      objective: mappedCampaignData.campaign_objective || 'OUTCOME_ENGAGEMENT',
      status: 'PAUSED',
      special_ad_categories: ['NONE']
    };

    console.log('=== CAMPAIGN REQUEST ===');
    console.log('Campaign Request:', JSON.stringify(campaignRequest, null, 2));
    console.log('Calling createCampaign with accountId:', accountId);

    const campaign = await facebookApi.createCampaign(accountId, campaignRequest);
    console.log('Campaign created successfully:', campaign);
    results.campaign_id = campaign.id;

    // 2. Tạo AdSet
    const adsetRequest: AdSetCreateRequest = {
      access_token: facebookApi.getAccessToken(),
      name: `${mappedCampaignData.name} - AdSet`,
      campaign_id: campaign.id,
      daily_budget: String(Math.max(30000, mappedCampaignData.daily_budget)), // VND minimum 30,000 ≈ $1.2 USD
      billing_event: mappedCampaignData.billing_event || 'IMPRESSIONS',
      optimization_goal: mappedCampaignData.optimization_goal || 'POST_ENGAGEMENT',
      bid_strategy: mappedCampaignData.bid_strategy || 'LOWEST_COST_WITHOUT_CAP',
      destination_type: mappedCampaignData.destination_type || 'ON_POST',
      start_time: mappedCampaignData.start_time,
      targeting: {
        geo_locations: { countries: ['VN'] },
        age_min: mappedCampaignData.age_min || 18,
        age_max: mappedCampaignData.age_max || 65,
        targeting_automation: {
          advantage_audience: 0
        }
      }
    };

    console.log('=== ADSET REQUEST ===');
    console.log('AdSet Request:', JSON.stringify(adsetRequest, null, 2));
    console.log('=====================');

    if (mappedCampaignData.end_time) {
      adsetRequest.end_time = mappedCampaignData.end_time;
    }

    const adset = await facebookApi.createAdSet(accountId, adsetRequest);
    results.adset_id = adset.id;

    // 3. Validate post ID format before validation
    const postIdValidation = validatePostIdFormat(mappedCampaignData.post_id, mappedCampaignData.page_id);
    if (!postIdValidation.isValid) {
      if (postIdValidation.suggestion) {
        throw new Error(`Post ID format appears incorrect. Found: "${mappedCampaignData.post_id}" but it should probably be: "${postIdValidation.suggestion}". Post ID should not include the page ID prefix.`);
      } else {
        throw new Error(`Post ID format is invalid: "${mappedCampaignData.post_id}". Post ID should be a numeric string (15-16 digits) without page ID prefix.`);
      }
    }

    // 4. Validate post before creating creative (with enhanced validation)
    console.log('Validating post ID:', mappedCampaignData.post_id, 'for page:', mappedCampaignData.page_id);
    const isPostValid = await facebookApi.validatePost(mappedCampaignData.post_id, mappedCampaignData.page_id);
    if (!isPostValid) {
      console.warn(`Post ID ${mappedCampaignData.post_id} validation failed, but proceeding with creative creation...`);
      // We'll continue anyway since Facebook will give a more specific error if the post is truly invalid
    }

    // 5. Tạo Creative
    console.log('Creating creative with post ID:', mappedCampaignData.post_id, 'and page ID:', mappedCampaignData.page_id);
    const creativeRequest: CreativeCreateRequest = {
      access_token: facebookApi.getAccessToken(),
      name: `${mappedCampaignData.name} - Creative`,
      object_story_id: `${mappedCampaignData.page_id}_${mappedCampaignData.post_id}`
    };

    let creative;
    try {
      creative = await facebookApi.createCreative(accountId, creativeRequest);
      results.creative_id = creative.id;
    } catch (creativeError: any) {
      // Enhanced error message for creative creation
      const errorMessage = creativeError.response?.data?.error?.message || creativeError.message;
      const errorCode = creativeError.response?.data?.error?.code;
      
      let enhancedError = `Failed to create creative: ${errorMessage}`;
      
      if (errorCode === 100 || errorMessage.includes('promoted object is invalid')) {
        enhancedError += `\n\nPossible causes:
1. Post ID ${mappedCampaignData.post_id} does not exist or was deleted
2. Page ID ${mappedCampaignData.page_id} is incorrect
3. The post is not published or is set to private
4. You don't have permission to access this post
5. The post ID format is incorrect (should be just the number, not page_id_post_id)

Please verify:
- Post exists on the page: https://facebook.com/${mappedCampaignData.page_id}/posts/${mappedCampaignData.post_id}
- Post is published and public
- Your access token has permission to access this page and post`;
      }
      
      throw new Error(enhancedError);
    }

    // 6. Tạo Ad
    const adRequest: AdCreateRequest = {
      access_token: facebookApi.getAccessToken(),
      name: `${mappedCampaignData.name} - Ad`,
      adset_id: adset.id,
      creative: {
        creative_id: creative.id
      },
      status: 'PAUSED'
    };

    const ad = await facebookApi.createAd(accountId, adRequest);
    results.ad_id = ad.id;

    return results;
  } catch (error: any) {
    results.error = error.message;
    throw error;
  }
}

// Utility functions for authentication and validation
export async function validateFacebookToken(accessToken: string): Promise<boolean> {
  try {
    const response = await axios.get(`${FACEBOOK_API_BASE}/me`, {
      params: {
        access_token: accessToken
      }
    });
    return response.status === 200 && response.data.id;
  } catch (error) {
    console.error('Error validating Facebook token:', error);
    return false;
  }
}

export async function getFacebookAccounts(accessToken: string): Promise<{ data: FacebookAccount[] } | null> {
  try {
    const response = await axios.get(`${FACEBOOK_API_BASE}/me/adaccounts`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,account_id,account_status,business'
      }
    });
    return {
      data: response.data.data.map((account: any) => ({
        ...account,
        access_token: accessToken
      }))
    };
  } catch (error) {
    console.error('Error fetching Facebook accounts:', error);
    return null;
  }
}

export async function getFacebookUserInfo(accessToken: string): Promise<{
  id: string;
  name: string;
  email?: string;
} | null> {
  try {
    const response = await axios.get(`${FACEBOOK_API_BASE}/me`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,email'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Facebook user info:', error);
    return null;
  }
}
