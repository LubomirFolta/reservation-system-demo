# BookingSystem - Modern Resource Reservation Platform

A showcase-ready, multi-tenant booking system built with React, Tailwind CSS, and Appwrite. Perfect for managing meeting rooms, workspaces, equipment, and services.

## Features

- **User Authentication** - Secure login/register with Appwrite Auth
- **Resource Management** - Create and manage bookable resources (meeting rooms, workspaces, equipment, services)
- **Interactive Calendar** - Visual date picker for selecting booking dates
- **Time Slot System** - Flexible time slot management with pricing support
- **Real-time Updates** - Instant availability updates using Appwrite Realtime
- **Admin Dashboard** - Comprehensive admin panel for managing resources and bookings
- **Dark Mode** - Full dark mode support with system preference detection
- **Responsive Design** - Mobile-first design that works on all devices
- **Modern UI** - Clean, premium SaaS-style interface

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **State Management**: React Context + TanStack Query
- **Backend**: Appwrite (Auth, Databases, Realtime)
- **Date Handling**: date-fns

## Project Structure

```
reservation-system-demo/
├── scripts/
│   └── setup-appwrite.js    # Appwrite database setup script
├── src/
│   ├── components/
│   │   ├── admin/           # Admin panel components
│   │   │   ├── BookingsTable.jsx
│   │   │   ├── ResourceForm.jsx
│   │   │   └── SlotGenerator.jsx
│   │   ├── auth/            # Authentication components
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── booking/         # Booking components
│   │   │   ├── BookingCard.jsx
│   │   │   ├── BookingModal.jsx
│   │   │   ├── Calendar.jsx
│   │   │   ├── ResourceCard.jsx
│   │   │   └── TimeSlots.jsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── ui/              # Reusable UI components
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Select.jsx
│   │       └── Spinner.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx  # Authentication context
│   ├── lib/
│   │   └── appwrite.js      # Appwrite client initialization
│   ├── pages/
│   │   ├── Admin.jsx        # Admin panel page
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── Login.jsx        # Login page
│   │   ├── MyBookings.jsx   # User bookings page
│   │   └── Register.jsx     # Registration page
│   ├── services/
│   │   └── api.js           # API service layer
│   ├── App.jsx              # Main app component
│   ├── index.css            # Global styles
│   └── main.jsx             # App entry point
├── .env.example             # Environment variables template
├── index.html               # HTML template
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- An Appwrite account (cloud or self-hosted)

### 1. Clone and Install

```bash
git clone <repository-url>
cd reservation-system-demo
npm install
```

### 2. Set Up Appwrite

1. Create a new project in [Appwrite Console](https://cloud.appwrite.io)
2. Go to **Settings** > **API Keys** and create an API key with the following scopes:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `attributes.read`
   - `attributes.write`
   - `indexes.read`
   - `indexes.write`
   - `documents.read`
   - `documents.write`

3. Copy your Project ID and API Key

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Appwrite credentials:

```env
# Frontend
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=booking_system

# Setup Script
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=booking_system
```

### 4. Run the Setup Script

Install the Node.js Appwrite SDK and run the setup script:

```bash
npm install node-appwrite dotenv
node scripts/setup-appwrite.js
```

This will create:
- A database called `booking_system`
- Three collections: `resources`, `slots`, `bookings`
- All necessary attributes and indexes
- Document-level security permissions

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage Guide

### For Users

1. **Register/Login** - Create an account or sign in
2. **Browse Resources** - View available resources on the dashboard
3. **Book a Resource** - Click "View Availability" on any resource
4. **Select Date & Time** - Choose a date and available time slot
5. **Confirm Booking** - Review and confirm your reservation
6. **Manage Bookings** - View and cancel bookings in "My Bookings"

### For Admins

1. **Access Admin Panel** - Click "Admin" in the navigation
2. **Create Resources** - Add new bookable resources with details
3. **Generate Time Slots** - Create available time slots for resources
4. **Manage Bookings** - View, approve, or cancel bookings
5. **Toggle Availability** - Enable/disable resources as needed

## Database Schema

### Resources Collection
| Field | Type | Description |
|-------|------|-------------|
| name | string | Resource name |
| description | string | Resource description |
| type | string | Resource type (meeting-room, workspace, equipment, service) |
| location | string | Physical location |
| capacity | integer | Maximum capacity |
| imageUrl | string | Image URL |
| isActive | boolean | Availability status |
| amenities | string | JSON array of amenities |
| pricePerHour | float | Hourly rate |
| ownerId | string | Owner's user ID |

### Slots Collection
| Field | Type | Description |
|-------|------|-------------|
| resourceId | string | Associated resource ID |
| date | string | Date (YYYY-MM-DD) |
| startTime | datetime | Slot start time |
| endTime | datetime | Slot end time |
| isAvailable | boolean | Availability status |
| price | float | Slot price |

### Bookings Collection
| Field | Type | Description |
|-------|------|-------------|
| userId | string | Booking user's ID |
| userName | string | User's name |
| userEmail | string | User's email |
| resourceId | string | Booked resource ID |
| resourceName | string | Resource name |
| slotId | string | Booked slot ID |
| startTime | datetime | Booking start |
| endTime | datetime | Booking end |
| status | string | Status (confirmed, cancelled, pending) |
| notes | string | User notes |
| totalPrice | float | Total booking price |
| createdAt | datetime | Creation timestamp |

## Customization

### Adding Resource Types

Edit `src/pages/Dashboard.jsx` and `src/components/admin/ResourceForm.jsx`:

```javascript
const resourceTypes = [
  { value: 'meeting-room', label: 'Meeting Rooms' },
  { value: 'workspace', label: 'Workspaces' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'service', label: 'Services' },
  // Add more types here
];
```

### Styling

The project uses Tailwind CSS v4. Customize the design by:

1. Editing `src/index.css` for global styles
2. Modifying component classes directly
3. Updating the color palette in component files

### Time Slot Configuration

Adjust default slot settings in `src/components/admin/SlotGenerator.jsx`:

```javascript
const [startHour, setStartHour] = useState(9);  // Start at 9 AM
const [endHour, setEndHour] = useState(17);     // End at 5 PM
const [interval, setInterval] = useState(60);    // 1-hour slots
```

## API Reference

### Resources API (`src/services/api.js`)

```javascript
resourcesApi.getAll()           // Get all active resources
resourcesApi.getAllAdmin()      // Get all resources (admin)
resourcesApi.getById(id)        // Get resource by ID
resourcesApi.create(data, userId) // Create resource
resourcesApi.update(id, data)   // Update resource
resourcesApi.delete(id)         // Delete resource
resourcesApi.toggleActive(id, isActive) // Toggle status
```

### Slots API

```javascript
slotsApi.getByResourceAndDate(resourceId, date) // Get slots
slotsApi.create(data)           // Create slot
slotsApi.createBulk(slots)      // Bulk create slots
slotsApi.markUnavailable(id)    // Mark as booked
slotsApi.markAvailable(id)      // Mark as available
```

### Bookings API

```javascript
bookingsApi.getByUser(userId)   // Get user's bookings
bookingsApi.getAll()            // Get all bookings (admin)
bookingsApi.create(data)        // Create booking
bookingsApi.cancel(id)          // Cancel booking
bookingsApi.updateStatus(id, status) // Update status
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## License

This project is open source and available under the [MIT License](LICENSE).
