import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { CampaignLog } from '@/types/campaign';
import { User, Account } from '@/types/user';
import bcrypt from 'bcryptjs';

// MongoDB connection
let client: MongoClient;
let db: Db;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'facebook_ads_manager';

export async function connectToDatabase(): Promise<{ db: Db; client: MongoClient }> {
  if (client && db) {
    return { db, client };
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB);
    
    console.log('Connected to MongoDB');
    return { db, client };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function getCampaignLogsCollection(): Promise<Collection<CampaignLog>> {
  const { db } = await connectToDatabase();
  return db.collection<CampaignLog>('campaign_logs');
}

export async function getUsersCollection(): Promise<Collection<User>> {
  const { db } = await connectToDatabase();
  return db.collection<User>('users');
}

export async function getAccountsCollection(): Promise<Collection<Account>> {
  const { db } = await connectToDatabase();
  return db.collection<Account>('accounts');
}

// User service
export class UserService {
  private collection: Collection<User> | null = null;

  private async getCollection(): Promise<Collection<User>> {
    if (!this.collection) {
      this.collection = await getUsersCollection();
      // Create unique index on email
      await this.collection.createIndex({ email: 1 }, { unique: true });
    }
    return this.collection;
  }

  async createUser(userData: {
    email: string;
    password: string;
    full_name?: string;
    role?: 'admin' | 'user';
  }): Promise<User> {
    const collection = await this.getCollection();
    
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user: Omit<User, '_id'> = {
      email: userData.email.toLowerCase(),
      password_hash: hashedPassword,
      full_name: userData.full_name,
      role: userData.role || 'user',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await collection.insertOne(user as User);
    return { ...user, _id: result.insertedId.toString() } as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ email: email.toLowerCase() });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password_hash);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    const collection = await this.getCollection();
    
    try {
      console.log('Updating user:', userId, 'with updates:', Object.keys(updates));
      
      // Convert userId string to ObjectId
      const objectId = new ObjectId(userId);
      
      const result = await collection.updateOne(
        { _id: objectId } as any,
        { 
          $set: { 
            ...updates, 
            updated_at: new Date() 
          } 
        }
      );

      console.log('Update result:', { 
        matchedCount: result.matchedCount, 
        modifiedCount: result.modifiedCount 
      });

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async updateLastLogin(userId: string): Promise<boolean> {
    return this.updateUser(userId, { last_login: new Date() });
  }

  async updateTokens(userId: string, tokenData: {
    facebook_user_id?: string;
    long_lived_token?: string;
    refresh_token?: string;
    token_expires_at?: Date;
  }): Promise<boolean> {
    return this.updateUser(userId, tokenData);
  }

  async updateFacebookCredentials(userId: string, credentials: {
    facebook_app_id?: string;
    facebook_app_secret?: string;
    facebook_short_lived_token?: string;
    long_lived_token?: string;
    token_expires_at?: Date;
  }): Promise<boolean> {
    return this.updateUser(userId, credentials);
  }

  async getFacebookCredentials(userId: string): Promise<{
    facebook_app_id?: string;
    facebook_app_secret?: string;
    facebook_short_lived_token?: string;
    long_lived_token?: string;
    token_expires_at?: Date;
  } | null> {
    const collection = await this.getCollection();
    
    try {
      console.log('Getting Facebook credentials for user:', userId);
      
      // Convert userId string to ObjectId
      const objectId = new ObjectId(userId);
      
      const user = await collection.findOne(
        { _id: objectId } as any,
        { 
          projection: { 
            facebook_app_id: 1, 
            facebook_app_secret: 1, 
            facebook_short_lived_token: 1,
            long_lived_token: 1, 
            token_expires_at: 1 
          } 
        }
      );
      
      if (!user) {
        console.log('User not found');
        return null;
      }
      
      console.log('Found credentials:', {
        has_app_id: !!user.facebook_app_id,
        has_app_secret: !!user.facebook_app_secret,
        has_short_token: !!user.facebook_short_lived_token,
        has_long_token: !!user.long_lived_token,
        token_expires_at: user.token_expires_at
      });
      
      return {
        facebook_app_id: user.facebook_app_id,
        facebook_app_secret: user.facebook_app_secret,
        facebook_short_lived_token: user.facebook_short_lived_token,
        long_lived_token: user.long_lived_token,
        token_expires_at: user.token_expires_at,
      };
    } catch (error) {
      console.error('Error getting Facebook credentials:', error);
      throw error;
    }
  }
}

// Account service
export class AccountService {
  private collection: Collection<Account> | null = null;

  private async getCollection(): Promise<Collection<Account>> {
    if (!this.collection) {
      this.collection = await getAccountsCollection();
      // Create compound index
      await this.collection.createIndex({ user_id: 1, account_id: 1 }, { unique: true });
    }
    return this.collection;
  }

  async createAccount(accountData: {
    user_id: string;
    account_id: string;
    account_name: string;
    business_id?: string;
    business_name?: string;
    access_permissions?: string[];
    is_primary?: boolean;
  }): Promise<Account> {
    const collection = await this.getCollection();
    
    const account: Omit<Account, '_id'> = {
      user_id: accountData.user_id,
      account_id: accountData.account_id,
      account_name: accountData.account_name,
      business_id: accountData.business_id,
      business_name: accountData.business_name,
      access_permissions: accountData.access_permissions || [],
      is_primary: accountData.is_primary || false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await collection.insertOne(account as Account);
    return { ...account, _id: result.insertedId.toString() } as Account;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const collection = await this.getCollection();
    return await collection
      .find({ user_id: userId, is_active: true })
      .sort({ is_primary: -1, created_at: -1 })
      .toArray();
  }

  async findByUserIdAndAccountId(userId: string, accountId: string): Promise<Account | null> {
    const collection = await this.getCollection();
    return await collection.findOne({
      user_id: userId,
      account_id: accountId,
      is_active: true
    });
  }

  async updateAccount(accountId: string, updates: Partial<Account>): Promise<boolean> {
    const collection = await this.getCollection();
    
    const objectId = new ObjectId(accountId);
    const result = await collection.updateOne(
      { _id: objectId } as any,
      { 
        $set: { 
          ...updates, 
          updated_at: new Date() 
        } 
      }
    );

    return result.modifiedCount > 0;
  }

  async setPrimaryAccount(userId: string, accountId: string): Promise<boolean> {
    const collection = await this.getCollection();
    
    // First unset all primary flags for this user
    await collection.updateMany(
      { user_id: userId },
      { $set: { is_primary: false, updated_at: new Date() } }
    );

    // Then set the new primary
    const result = await collection.updateOne(
      { user_id: userId, account_id: accountId },
      { $set: { is_primary: true, updated_at: new Date() } }
    );

    return result.modifiedCount > 0;
  }
}

// CRUD operations for campaign logs
export class CampaignLogService {
  private collection: Collection<CampaignLog> | null = null;

  private async getCollection(): Promise<Collection<CampaignLog>> {
    if (!this.collection) {
      this.collection = await getCampaignLogsCollection();
    }
    return this.collection;
  }

  async createLog(logData: Omit<CampaignLog, '_id' | 'created_at' | 'updated_at'>): Promise<CampaignLog> {
    const collection = await this.getCollection();
    
    const log: Omit<CampaignLog, '_id'> = {
      ...logData,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await collection.insertOne(log as CampaignLog);
    return { ...log, _id: result.insertedId.toString() } as CampaignLog;
  }

  async updateLog(id: string, updates: Partial<CampaignLog>): Promise<boolean> {
    const collection = await this.getCollection();
    
    const result = await collection.updateOne(
      { _id: id as any },
      { 
        $set: { 
          ...updates, 
          updated_at: new Date() 
        } 
      }
    );

    return result.modifiedCount > 0;
  }

  async getLogById(id: string): Promise<CampaignLog | null> {
    const collection = await this.getCollection();
    const objectId = new ObjectId(id);
    return await collection.findOne({ _id: objectId } as any);
  }

  async getAllLogs(limit: number = 100, skip: number = 0): Promise<CampaignLog[]> {
    const collection = await this.getCollection();
    return await collection
      .find({})
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  async getLogsByUser(userId: string, limit: number = 100, skip: number = 0): Promise<CampaignLog[]> {
    const collection = await this.getCollection();
    return await collection
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  async getLogsByUserAndAccount(userId: string, accountId: string, limit: number = 100, skip: number = 0): Promise<CampaignLog[]> {
    const collection = await this.getCollection();
    return await collection
      .find({ user_id: userId, account_id: accountId })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  async getLogsByStatus(status: 'success' | 'error' | 'pending', limit: number = 100): Promise<CampaignLog[]> {
    const collection = await this.getCollection();
    return await collection
      .find({ status })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();
  }

  async deleteLog(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: id as any });
    return result.deletedCount > 0;
  }

  async getStats(): Promise<{
    total: number;
    success: number;
    error: number;
    pending: number;
  }> {
    const collection = await this.getCollection();
    
    const [total, success, error, pending] = await Promise.all([
      collection.countDocuments(),
      collection.countDocuments({ status: 'success' }),
      collection.countDocuments({ status: 'error' }),
      collection.countDocuments({ status: 'pending' })
    ]);

    return { total, success, error, pending };
  }

  async getStatsByUser(userId: string): Promise<{
    total: number;
    success: number;
    error: number;
    pending: number;
  }> {
    const collection = await this.getCollection();
    
    const [total, success, error, pending] = await Promise.all([
      collection.countDocuments({ user_id: userId }),
      collection.countDocuments({ user_id: userId, status: 'success' }),
      collection.countDocuments({ user_id: userId, status: 'error' }),
      collection.countDocuments({ user_id: userId, status: 'pending' })
    ]);

    return { total, success, error, pending };
  }

  async getStatsByUserAndAccount(userId: string, accountId: string): Promise<{
    total: number;
    success: number;
    error: number;
    pending: number;
  }> {
    const collection = await this.getCollection();
    
    const [total, success, error, pending] = await Promise.all([
      collection.countDocuments({ user_id: userId, account_id: accountId }),
      collection.countDocuments({ user_id: userId, account_id: accountId, status: 'success' }),
      collection.countDocuments({ user_id: userId, account_id: accountId, status: 'error' }),
      collection.countDocuments({ user_id: userId, account_id: accountId, status: 'pending' })
    ]);

    return { total, success, error, pending };
  }

  async getDetailedStatsByUser(userId: string, startDate?: Date): Promise<{
    total_campaigns: number;
    successful_campaigns: number;
    failed_campaigns: number;
    pending_campaigns: number;
    success_rate: number;
    total_budget: number;
    average_budget: number;
    campaigns_by_status: {
      success: number;
      error: number;
      pending: number;
    };
    campaigns_by_account: Array<{
      account_id: string;
      total: number;
      success: number;
      error: number;
      pending: number;
    }>;
    recent_campaigns: Array<{
      name: string;
      status: string;
      created_at: string;
      daily_budget?: number;
    }>;
    daily_stats?: Array<{
      date: string;
      total: number;
      success: number;
      error: number;
    }>;
  }> {
    const collection = await this.getCollection();
    
    // Build filter with date range
    const filter: any = { user_id: userId };
    if (startDate) {
      filter.created_at = { $gte: startDate };
    }

    // Get basic counts
    const [total, success, error, pending] = await Promise.all([
      collection.countDocuments(filter),
      collection.countDocuments({ ...filter, status: 'success' }),
      collection.countDocuments({ ...filter, status: 'error' }),
      collection.countDocuments({ ...filter, status: 'pending' })
    ]);

    const success_rate = total > 0 ? (success / total) * 100 : 0;

    // Get campaigns with budget info
    const campaignsWithBudget = await collection.find(filter).toArray();
    const total_budget = campaignsWithBudget.reduce((sum, campaign) => {
      return sum + (campaign.daily_budget || 0);
    }, 0);
    const average_budget = total > 0 ? total_budget / total : 0;

    // Group by account
    const accountStats = await collection.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$account_id',
          total: { $sum: 1 },
          success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          error: { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
        }
      }
    ]).toArray();

    const campaigns_by_account = accountStats.map(stat => ({
      account_id: stat._id || 'unknown',
      total: stat.total,
      success: stat.success,
      error: stat.error,
      pending: stat.pending
    }));

    // Get recent campaigns
    const recent_campaigns_data = await collection.find(filter)
      .sort({ created_at: -1 })
      .limit(10)
      .toArray();

    const recent_campaigns = recent_campaigns_data.map(campaign => ({
      name: campaign.name,
      status: campaign.status,
      created_at: campaign.created_at.toISOString(),
      daily_budget: campaign.daily_budget
    }));

    // Get daily stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyFilter = { ...filter };
    if (!startDate || startDate < thirtyDaysAgo) {
      dailyFilter.created_at = { $gte: thirtyDaysAgo };
    }

    const dailyStats = await collection.aggregate([
      { $match: dailyFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
          },
          total: { $sum: 1 },
          success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          error: { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const daily_stats = dailyStats.map(stat => ({
      date: stat._id,
      total: stat.total,
      success: stat.success,
      error: stat.error
    }));

    return {
      total_campaigns: total,
      successful_campaigns: success,
      failed_campaigns: error,
      pending_campaigns: pending,
      success_rate,
      total_budget,
      average_budget,
      campaigns_by_status: {
        success,
        error,
        pending
      },
      campaigns_by_account,
      recent_campaigns,
      daily_stats
    };
  }

  async getDetailedStatsByUserAndAccount(userId: string, accountId: string, startDate?: Date): Promise<{
    total_campaigns: number;
    successful_campaigns: number;
    failed_campaigns: number;
    pending_campaigns: number;
    success_rate: number;
    total_budget: number;
    average_budget: number;
    campaigns_by_status: {
      success: number;
      error: number;
      pending: number;
    };
    recent_campaigns: Array<{
      name: string;
      status: string;
      created_at: string;
      daily_budget?: number;
    }>;
    daily_stats?: Array<{
      date: string;
      total: number;
      success: number;
      error: number;
    }>;
  }> {
    const collection = await this.getCollection();
    
    // Build filter with date range
    const filter: any = { user_id: userId, account_id: accountId };
    if (startDate) {
      filter.created_at = { $gte: startDate };
    }

    // Get basic counts
    const [total, success, error, pending] = await Promise.all([
      collection.countDocuments(filter),
      collection.countDocuments({ ...filter, status: 'success' }),
      collection.countDocuments({ ...filter, status: 'error' }),
      collection.countDocuments({ ...filter, status: 'pending' })
    ]);

    const success_rate = total > 0 ? (success / total) * 100 : 0;

    // Get campaigns with budget info
    const campaignsWithBudget = await collection.find(filter).toArray();
    const total_budget = campaignsWithBudget.reduce((sum, campaign) => {
      return sum + (campaign.daily_budget || 0);
    }, 0);
    const average_budget = total > 0 ? total_budget / total : 0;

    // Get recent campaigns
    const recent_campaigns_data = await collection.find(filter)
      .sort({ created_at: -1 })
      .limit(10)
      .toArray();

    const recent_campaigns = recent_campaigns_data.map(campaign => ({
      name: campaign.name,
      status: campaign.status,
      created_at: campaign.created_at.toISOString(),
      daily_budget: campaign.daily_budget
    }));

    // Get daily stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyFilter = { ...filter };
    if (!startDate || startDate < thirtyDaysAgo) {
      dailyFilter.created_at = { $gte: thirtyDaysAgo };
    }

    const dailyStats = await collection.aggregate([
      { $match: dailyFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
          },
          total: { $sum: 1 },
          success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          error: { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const daily_stats = dailyStats.map(stat => ({
      date: stat._id,
      total: stat.total,
      success: stat.success,
      error: stat.error
    }));

    return {
      total_campaigns: total,
      successful_campaigns: success,
      failed_campaigns: error,
      pending_campaigns: pending,
      success_rate,
      total_budget,
      average_budget,
      campaigns_by_status: {
        success,
        error,
        pending
      },
      recent_campaigns,
      daily_stats
    };
  }
}

// Singleton instances
export const userService = new UserService();
export const accountService = new AccountService();
export const campaignLogService = new CampaignLogService();
