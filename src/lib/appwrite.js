import { Client, Account, Databases } from 'appwrite';

// Appwrite Configuration
const config = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'booking_system',
};

// Validate configuration
if (!config.projectId) {
  console.warn('⚠️ VITE_APPWRITE_PROJECT_ID is not set. Please configure your .env file.');
}

// Initialize Appwrite Client
const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

// Initialize Services
export const account = new Account(client);
export const databases = new Databases(client);

// Export client for realtime subscriptions
export { client };

// Export config for use in services
export const appwriteConfig = {
  ...config,
  collections: {
    resources: 'resources',
    slots: 'slots',
    bookings: 'bookings',
  },
};

// Realtime subscription helper
export function subscribe(channels, callback) {
  return client.subscribe(channels, callback);
}

// Helper to build collection channel
export function getCollectionChannel(collectionId) {
  return `databases.${config.databaseId}.collections.${collectionId}.documents`;
}
