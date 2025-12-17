import { ID, Query, Permission, Role } from 'appwrite';
import { databases, appwriteConfig } from '../lib/appwrite';

const { databaseId, collections } = appwriteConfig;

// ============================================
// RESOURCES API
// ============================================

export const resourcesApi = {
  // Get all active resources
  async getAll() {
    const response = await databases.listDocuments(
      databaseId,
      collections.resources,
      [
        Query.equal('isActive', true),
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ]
    );
    return response.documents;
  },

  // Get all resources (including inactive) for admin
  async getAllAdmin() {
    const response = await databases.listDocuments(
      databaseId,
      collections.resources,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ]
    );
    return response.documents;
  },

  // Get a single resource by ID
  async getById(resourceId) {
    return await databases.getDocument(
      databaseId,
      collections.resources,
      resourceId
    );
  },

  // Get resources by type
  async getByType(type) {
    const response = await databases.listDocuments(
      databaseId,
      collections.resources,
      [
        Query.equal('type', type),
        Query.equal('isActive', true),
        Query.orderAsc('name'),
      ]
    );
    return response.documents;
  },

  // Create a new resource
  async create(data, userId) {
    return await databases.createDocument(
      databaseId,
      collections.resources,
      ID.unique(),
      {
        ...data,
        ownerId: userId,
        isActive: data.isActive ?? true,
        amenities: data.amenities ? JSON.stringify(data.amenities) : '[]',
      }
    );
  },

  // Update a resource
  async update(resourceId, data) {
    const updateData = { ...data };
    if (data.amenities) {
      updateData.amenities = JSON.stringify(data.amenities);
    }
    return await databases.updateDocument(
      databaseId,
      collections.resources,
      resourceId,
      updateData
    );
  },

  // Toggle resource active status
  async toggleActive(resourceId, isActive) {
    return await databases.updateDocument(
      databaseId,
      collections.resources,
      resourceId,
      { isActive }
    );
  },

  // Delete a resource
  async delete(resourceId) {
    return await databases.deleteDocument(
      databaseId,
      collections.resources,
      resourceId
    );
  },

  // Search resources by name
  async search(query) {
    const response = await databases.listDocuments(
      databaseId,
      collections.resources,
      [
        Query.search('name', query),
        Query.equal('isActive', true),
        Query.limit(20),
      ]
    );
    return response.documents;
  },
};

// ============================================
// SLOTS API
// ============================================

export const slotsApi = {
  // Get slots for a resource on a specific date
  async getByResourceAndDate(resourceId, date) {
    const response = await databases.listDocuments(
      databaseId,
      collections.slots,
      [
        Query.equal('resourceId', resourceId),
        Query.equal('date', date),
        Query.orderAsc('startTime'),
      ]
    );
    return response.documents;
  },

  // Get available slots for a resource on a specific date
  async getAvailableByResourceAndDate(resourceId, date) {
    const response = await databases.listDocuments(
      databaseId,
      collections.slots,
      [
        Query.equal('resourceId', resourceId),
        Query.equal('date', date),
        Query.equal('isAvailable', true),
        Query.orderAsc('startTime'),
      ]
    );
    return response.documents;
  },

  // Get all slots for a resource
  async getByResource(resourceId) {
    const response = await databases.listDocuments(
      databaseId,
      collections.slots,
      [
        Query.equal('resourceId', resourceId),
        Query.orderAsc('startTime'),
        Query.limit(500),
      ]
    );
    return response.documents;
  },

  // Get a single slot by ID
  async getById(slotId) {
    return await databases.getDocument(
      databaseId,
      collections.slots,
      slotId
    );
  },

  // Create a new slot
  async create(data) {
    return await databases.createDocument(
      databaseId,
      collections.slots,
      ID.unique(),
      {
        ...data,
        isAvailable: data.isAvailable ?? true,
      }
    );
  },

  // Create multiple slots (bulk)
  async createBulk(slots) {
    const promises = slots.map(slot =>
      databases.createDocument(
        databaseId,
        collections.slots,
        ID.unique(),
        {
          ...slot,
          isAvailable: slot.isAvailable ?? true,
        }
      )
    );
    return await Promise.all(promises);
  },

  // Update a slot
  async update(slotId, data) {
    return await databases.updateDocument(
      databaseId,
      collections.slots,
      slotId,
      data
    );
  },

  // Mark slot as unavailable (when booked)
  async markUnavailable(slotId) {
    return await databases.updateDocument(
      databaseId,
      collections.slots,
      slotId,
      { isAvailable: false }
    );
  },

  // Mark slot as available (when booking cancelled)
  async markAvailable(slotId) {
    return await databases.updateDocument(
      databaseId,
      collections.slots,
      slotId,
      { isAvailable: true }
    );
  },

  // Delete a slot
  async delete(slotId) {
    return await databases.deleteDocument(
      databaseId,
      collections.slots,
      slotId
    );
  },

  // Delete all slots for a resource
  async deleteByResource(resourceId) {
    const slots = await this.getByResource(resourceId);
    const promises = slots.map(slot =>
      databases.deleteDocument(databaseId, collections.slots, slot.$id)
    );
    return await Promise.all(promises);
  },
};

// ============================================
// BOOKINGS API
// ============================================

export const bookingsApi = {
  // Get all bookings for a user
  async getByUser(userId) {
    const response = await databases.listDocuments(
      databaseId,
      collections.bookings,
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt'),
        Query.limit(100),
      ]
    );
    return response.documents;
  },

  // Get upcoming bookings for a user
  async getUpcomingByUser(userId) {
    const now = new Date().toISOString();
    const response = await databases.listDocuments(
      databaseId,
      collections.bookings,
      [
        Query.equal('userId', userId),
        Query.greaterThan('startTime', now),
        Query.equal('status', 'confirmed'),
        Query.orderAsc('startTime'),
        Query.limit(50),
      ]
    );
    return response.documents;
  },

  // Get all bookings (admin)
  async getAll() {
    const response = await databases.listDocuments(
      databaseId,
      collections.bookings,
      [
        Query.orderDesc('createdAt'),
        Query.limit(200),
      ]
    );
    return response.documents;
  },

  // Get bookings for a resource
  async getByResource(resourceId) {
    const response = await databases.listDocuments(
      databaseId,
      collections.bookings,
      [
        Query.equal('resourceId', resourceId),
        Query.orderDesc('createdAt'),
        Query.limit(100),
      ]
    );
    return response.documents;
  },

  // Get bookings by status
  async getByStatus(status) {
    const response = await databases.listDocuments(
      databaseId,
      collections.bookings,
      [
        Query.equal('status', status),
        Query.orderDesc('createdAt'),
        Query.limit(100),
      ]
    );
    return response.documents;
  },

  // Get a single booking by ID
  async getById(bookingId) {
    return await databases.getDocument(
      databaseId,
      collections.bookings,
      bookingId
    );
  },

  // Create a new booking
  async create(data) {
    const booking = await databases.createDocument(
      databaseId,
      collections.bookings,
      ID.unique(),
      {
        ...data,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
      [
        // User can read and update their own booking
        Permission.read(Role.user(data.userId)),
        Permission.update(Role.user(data.userId)),
        Permission.delete(Role.user(data.userId)),
        // All users can read (for admin purposes)
        Permission.read(Role.users()),
      ]
    );

    // Mark the slot as unavailable
    await slotsApi.markUnavailable(data.slotId);

    return booking;
  },

  // Update booking status
  async updateStatus(bookingId, status) {
    return await databases.updateDocument(
      databaseId,
      collections.bookings,
      bookingId,
      { status }
    );
  },

  // Cancel a booking
  async cancel(bookingId) {
    const booking = await this.getById(bookingId);

    // Mark the slot as available again
    await slotsApi.markAvailable(booking.slotId);

    // Update booking status
    return await databases.updateDocument(
      databaseId,
      collections.bookings,
      bookingId,
      { status: 'cancelled' }
    );
  },

  // Delete a booking
  async delete(bookingId) {
    const booking = await this.getById(bookingId);

    // Mark the slot as available again
    await slotsApi.markAvailable(booking.slotId);

    return await databases.deleteDocument(
      databaseId,
      collections.bookings,
      bookingId
    );
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Generate time slots for a resource on a date
export function generateTimeSlots(resourceId, date, startHour = 9, endHour = 17, intervalMinutes = 60, price = 0) {
  const slots = [];
  const dateStr = date.toISOString().split('T')[0];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += intervalMinutes) {
      if (hour === endHour - 1 && minutes + intervalMinutes > 60) break;

      const startTime = new Date(date);
      startTime.setHours(hour, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + intervalMinutes);

      slots.push({
        resourceId,
        date: dateStr,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isAvailable: true,
        price,
      });
    }
  }

  return slots;
}

// Parse amenities from JSON string
export function parseAmenities(amenitiesString) {
  try {
    return JSON.parse(amenitiesString || '[]');
  } catch {
    return [];
  }
}
