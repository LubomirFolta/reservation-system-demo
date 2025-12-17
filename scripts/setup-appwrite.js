#!/usr/bin/env node

/**
 * Appwrite Setup Script for Booking System
 *
 * This script sets up the complete Appwrite backend:
 * - Creates a database
 * - Creates collections: resources, slots, bookings
 * - Sets up attributes for each collection
 * - Creates indexes for efficient querying
 * - Configures permissions (Document Level Security)
 *
 * Usage:
 *   1. Install dependencies: npm install node-appwrite dotenv
 *   2. Create a .env file with your Appwrite credentials
 *   3. Run: node scripts/setup-appwrite.js
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const config = {
  endpoint: process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY,
  databaseId: process.env.APPWRITE_DATABASE_ID || 'booking_system',
};

// Validate required environment variables
if (!config.projectId || !config.apiKey) {
  console.error('❌ Error: Missing required environment variables.');
  console.error('Please create a .env file with:');
  console.error('  APPWRITE_PROJECT_ID=your_project_id');
  console.error('  APPWRITE_API_KEY=your_api_key');
  console.error('  APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 (optional)');
  console.error('  APPWRITE_DATABASE_ID=booking_system (optional)');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

// Collection IDs
const COLLECTIONS = {
  RESOURCES: 'resources',
  SLOTS: 'slots',
  BOOKINGS: 'bookings',
};

// Helper function to wait (Appwrite has rate limits)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to create attribute with retry
async function createAttribute(fn, name) {
  try {
    await fn();
    console.log(`  ✓ Created attribute: ${name}`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ⊘ Attribute already exists: ${name}`);
    } else {
      throw error;
    }
  }
  await wait(500); // Rate limit protection
}

// Helper function to create index with retry
async function createIndex(databaseId, collectionId, key, type, attributes, orders = []) {
  try {
    await databases.createIndex(databaseId, collectionId, key, type, attributes, orders);
    console.log(`  ✓ Created index: ${key}`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ⊘ Index already exists: ${key}`);
    } else {
      throw error;
    }
  }
  await wait(500);
}

async function setupDatabase() {
  console.log('\n🚀 Starting Appwrite Setup for Booking System\n');
  console.log(`📡 Endpoint: ${config.endpoint}`);
  console.log(`📁 Project: ${config.projectId}`);
  console.log(`🗄️  Database: ${config.databaseId}\n`);

  // Step 1: Create Database
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 Creating Database...');
  try {
    await databases.create(config.databaseId, 'Booking System');
    console.log('✓ Database created successfully');
  } catch (error) {
    if (error.code === 409 || error.type === 'document_already_exists') {
      console.log('⊘ Database already exists, continuing...');
    } else if (error.code === 403 && error.type === 'additional_resource_not_allowed') {
      // Database limit reached but database might already exist, try to continue
      console.log('⊘ Database already exists (plan limit reached), continuing...');
    } else {
      throw error;
    }
  }

  // Step 2: Create Resources Collection
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 Creating Resources Collection...');
  try {
    await databases.createCollection(
      config.databaseId,
      COLLECTIONS.RESOURCES,
      'Resources',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log('✓ Resources collection created');
  } catch (error) {
    if (error.code === 409) {
      console.log('⊘ Resources collection already exists');
    } else {
      throw error;
    }
  }

  // Resources Attributes
  console.log('\n📝 Creating Resources Attributes...');

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.RESOURCES, 'name', 255, true
    ),
    'name'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.RESOURCES, 'description', 1000, false
    ),
    'description'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.RESOURCES, 'type', 100, true
    ),
    'type'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.RESOURCES, 'location', 255, false
    ),
    'location'
  );

  await createAttribute(
    () => databases.createIntegerAttribute(
      config.databaseId, COLLECTIONS.RESOURCES, 'capacity', false, 1, 1000, 1
    ),
    'capacity'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.RESOURCES, 'imageUrl', 500, false
    ),
    'imageUrl'
  );

  await createAttribute(
    () => databases.createBooleanAttribute(
      config.databaseId, COLLECTIONS.RESOURCES, 'isActive', false, true
    ),
    'isActive'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.RESOURCES, 'amenities', 2000, false
    ),
    'amenities'
  );

  await createAttribute(
    () => databases.createFloatAttribute(
      config.databaseId, COLLECTIONS.RESOURCES, 'pricePerHour', false, 0, 10000, 0
    ),
    'pricePerHour'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.RESOURCES, 'ownerId', 36, true
    ),
    'ownerId'
  );

  // Resources Indexes
  console.log('\n📇 Creating Resources Indexes...');
  await wait(2000); // Wait for attributes to be ready

  await createIndex(config.databaseId, COLLECTIONS.RESOURCES, 'idx_type', 'key', ['type']);
  await createIndex(config.databaseId, COLLECTIONS.RESOURCES, 'idx_isActive', 'key', ['isActive']);
  await createIndex(config.databaseId, COLLECTIONS.RESOURCES, 'idx_ownerId', 'key', ['ownerId']);
  await createIndex(config.databaseId, COLLECTIONS.RESOURCES, 'idx_name', 'fulltext', ['name']);

  // Step 3: Create Slots Collection
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 Creating Slots Collection...');
  try {
    await databases.createCollection(
      config.databaseId,
      COLLECTIONS.SLOTS,
      'Slots',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log('✓ Slots collection created');
  } catch (error) {
    if (error.code === 409) {
      console.log('⊘ Slots collection already exists');
    } else {
      throw error;
    }
  }

  // Slots Attributes
  console.log('\n📝 Creating Slots Attributes...');

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.SLOTS, 'resourceId', 36, true
    ),
    'resourceId'
  );

  await createAttribute(
    () => databases.createDatetimeAttribute(
      config.databaseId, COLLECTIONS.SLOTS, 'startTime', true
    ),
    'startTime'
  );

  await createAttribute(
    () => databases.createDatetimeAttribute(
      config.databaseId, COLLECTIONS.SLOTS, 'endTime', true
    ),
    'endTime'
  );

  await createAttribute(
    () => databases.createBooleanAttribute(
      config.databaseId, COLLECTIONS.SLOTS, 'isAvailable', false, true
    ),
    'isAvailable'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.SLOTS, 'date', 10, true
    ),
    'date'
  );

  await createAttribute(
    () => databases.createFloatAttribute(
      config.databaseId, COLLECTIONS.SLOTS, 'price', false, 0, 10000, 0
    ),
    'price'
  );

  // Slots Indexes
  console.log('\n📇 Creating Slots Indexes...');
  await wait(2000);

  await createIndex(config.databaseId, COLLECTIONS.SLOTS, 'idx_resourceId', 'key', ['resourceId']);
  await createIndex(config.databaseId, COLLECTIONS.SLOTS, 'idx_date', 'key', ['date']);
  await createIndex(config.databaseId, COLLECTIONS.SLOTS, 'idx_isAvailable', 'key', ['isAvailable']);
  await createIndex(config.databaseId, COLLECTIONS.SLOTS, 'idx_resourceDate', 'key', ['resourceId', 'date']);
  await createIndex(config.databaseId, COLLECTIONS.SLOTS, 'idx_startTime', 'key', ['startTime']);

  // Step 4: Create Bookings Collection
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 Creating Bookings Collection...');
  try {
    await databases.createCollection(
      config.databaseId,
      COLLECTIONS.BOOKINGS,
      'Bookings',
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );
    console.log('✓ Bookings collection created');
  } catch (error) {
    if (error.code === 409) {
      console.log('⊘ Bookings collection already exists');
    } else {
      throw error;
    }
  }

  // Bookings Attributes
  console.log('\n📝 Creating Bookings Attributes...');

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.BOOKINGS, 'userId', 36, true
    ),
    'userId'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.BOOKINGS, 'userName', 255, true
    ),
    'userName'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.BOOKINGS, 'userEmail', 255, true
    ),
    'userEmail'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.BOOKINGS, 'resourceId', 36, true
    ),
    'resourceId'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.BOOKINGS, 'resourceName', 255, true
    ),
    'resourceName'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.BOOKINGS, 'slotId', 36, true
    ),
    'slotId'
  );

  await createAttribute(
    () => databases.createDatetimeAttribute(
      config.databaseId, COLLECTIONS.BOOKINGS, 'startTime', true
    ),
    'startTime'
  );

  await createAttribute(
    () => databases.createDatetimeAttribute(
      config.databaseId, COLLECTIONS.BOOKINGS, 'endTime', true
    ),
    'endTime'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.BOOKINGS, 'status', 50, true
    ),
    'status'
  );

  await createAttribute(
    () => databases.createStringAttribute(
      config.databaseId, COLLECTIONS.BOOKINGS, 'notes', 1000, false
    ),
    'notes'
  );

  await createAttribute(
    () => databases.createFloatAttribute(
      config.databaseId, COLLECTIONS.BOOKINGS, 'totalPrice', false, 0, 100000, 0
    ),
    'totalPrice'
  );

  await createAttribute(
    () => databases.createDatetimeAttribute(
      config.databaseId, COLLECTIONS.BOOKINGS, 'createdAt', true
    ),
    'createdAt'
  );

  // Bookings Indexes
  console.log('\n📇 Creating Bookings Indexes...');
  await wait(2000);

  await createIndex(config.databaseId, COLLECTIONS.BOOKINGS, 'idx_userId', 'key', ['userId']);
  await createIndex(config.databaseId, COLLECTIONS.BOOKINGS, 'idx_resourceId', 'key', ['resourceId']);
  await createIndex(config.databaseId, COLLECTIONS.BOOKINGS, 'idx_status', 'key', ['status']);
  await createIndex(config.databaseId, COLLECTIONS.BOOKINGS, 'idx_slotId', 'key', ['slotId']);
  await createIndex(config.databaseId, COLLECTIONS.BOOKINGS, 'idx_startTime', 'key', ['startTime']);
  await createIndex(config.databaseId, COLLECTIONS.BOOKINGS, 'idx_userResource', 'key', ['userId', 'resourceId']);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Appwrite Setup Complete!\n');
  console.log('📋 Summary:');
  console.log(`   Database: ${config.databaseId}`);
  console.log(`   Collections: ${Object.values(COLLECTIONS).join(', ')}`);
  console.log('\n🔐 Environment Variables for your .env file:');
  console.log(`   VITE_APPWRITE_ENDPOINT=${config.endpoint}`);
  console.log(`   VITE_APPWRITE_PROJECT_ID=${config.projectId}`);
  console.log(`   VITE_APPWRITE_DATABASE_ID=${config.databaseId}`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run setup
setupDatabase().catch((error) => {
  console.error('\n❌ Setup failed:', error.message);
  console.error(error);
  process.exit(1);
});
