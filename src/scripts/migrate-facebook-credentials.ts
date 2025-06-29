/**
 * Migration script to update existing users with new Facebook credentials fields
 * Run this script once to migrate existing data
 */

import { connectToDatabase } from '@/lib/mongodb';

async function migrateFacebookCredentials() {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Add new fields to existing users
    const result = await usersCollection.updateMany(
      {}, // Update all users
      {
        $set: {
          facebook_app_id: null,
          facebook_app_secret: null,
          facebook_short_lived_token: null,
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} users with new Facebook credentials fields`);

    // Create indexes for the new fields
    await usersCollection.createIndex({ facebook_app_id: 1 });
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateFacebookCredentials();
}

export { migrateFacebookCredentials };
