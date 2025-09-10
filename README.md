# Sri Devi Bus Transports Dashboard

A modern, secure dashboard for managing bus transport operations with role-based access control, booking management, and maintenance scheduling. Built with Vite.js, React, TypeScript, and shadcn/ui, with Notion as the backend database.

## Features

- 🔐 **Secure Authentication**: Role-based access with Admin and Manager roles
- 📊 **Dashboard Analytics**: Real-time operational metrics and fleet status
- 🚌 **Booking Management**: Create, track, and manage customer bookings
- 🔧 **Maintenance Scheduling**: Schedule and monitor bus maintenance
- 📅 **Calendar Integration**: Visual representation with Notion Calendar
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- ⚡ **Feature Flags**: Dynamic feature management with Flagsmith

## Tech Stack

- **Frontend**: Vite.js, React 18, TypeScript
- **Backend**: Node.js, Express, JWT Authentication
- **UI Components**: shadcn/ui, Tailwind CSS
- **Database**: Notion API
- **Authentication**: JWT with bcrypt password hashing
- **Feature Management**: Flagsmith
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Backend Setup

#### Generate User Accounts
```bash
cd backend
npm install
npm run create-users
```

This creates secure user accounts and outputs a base64-encoded string for your `.env` file.

#### Create Backend Environment
```bash
cp backend/.env.example backend/.env
```

Add the generated credentials and other required variables to `backend/.env`.

#### Start Backend Server
```bash
cd backend
npm run dev
```

### 3. Notion Setup

#### Create Notion Integration
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name it "Sridevi Bus Transport"
4. Copy the "Internal Integration Token"

#### Create Notion Databases

Create three databases in your Notion workspace:

**Bookings Database** with properties:
- Customer (Title)
- Phone (Phone)
- Itinerary (Rich Text)
- Dates (Date range)
- Total (Number)
- Advance (Number)
- Status (Select: Confirmed, In Tour, Pending Payment, Complete)
- Vehicle (Relation to Buses)

**Maintenance Database** with properties:
- Vehicle (Relation to Buses)
- Service Type (Multi-select: Regular Service, Oil Change, Tire Replacement, etc.)
- Service Dates (Date range)
- Cost (Number)
- Status (Select: Pending, In Progress, Done)

**Buses Database** with properties:
- Bus Number (Title)
- Capacity (Number)
- Status (Select: available, confirmed, maintenance)

#### Share Databases with Integration
1. Open each database in Notion
2. Click "Share" → "Invite"
3. Search for your integration name and invite it

### 4. Frontend Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your configuration:
```env
VITE_BACKEND_URL=http://localhost:3001
VITE_FLAGSMITH_ENVIRONMENT_ID=your_flagsmith_environment_id
```

**To get Database IDs for backend:**
- Open the database in Notion
- Copy the URL
- The database ID is the 32-character string after the last `/` and before `?`
- Example: `https://notion.so/workspace/DATABASE_ID?v=...`
- Add these to `backend/.env`

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Authentication

### Default Accounts

After running `npm run create-users` in the backend:

- **Admin**: Full system access including analytics and settings
- **Manager**: Standard operations access (no admin features)

**Note**: Credentials are stored in `CREDENTIALS.md` (not in version control)

### Security Features

- JWT-based authentication with 24-hour expiration
- bcrypt password hashing (12 rounds)
- Role-based access control
- Secure environment variable management

## Usage

### Dashboard
- **Today's Operations**: View bookings scheduled for today
- **Urgent Maintenance**: See maintenance due within 7 days
- **Fleet Availability**: Real-time vehicle status with date range filtering
- **Analytics**: Revenue and operational metrics (Admin only)

### Creating Bookings
1. Click "New Booking" button (available to all authenticated users)
2. Fill in customer details, select vehicles, plan itinerary, and set amounts
3. Supports multi-vehicle bookings and trip planning
4. Real-time sync with Notion database

### Scheduling Maintenance
1. Click "Schedule Maintenance" button (available to all authenticated users)
2. Select vehicle, maintenance type, dates, and add notes
3. Automatic status tracking and priority management
4. Integration with fleet availability system

### Role-Based Features
- **All Users**: Bookings, Maintenance, Calendar, Dashboard
- **Admin Only**: Analytics, Settings, System Management
- **Manager**: Restricted from admin features regardless of feature flags

## Project Structure

```
├── src/                 # Frontend React application
│   ├── components/
│   │   ├── ui/          # shadcn/ui components
│   │   ├── forms/       # Booking and maintenance forms
│   │   ├── dashboard/   # Dashboard components
│   │   ├── views/       # Page views
│   │   ├── layout/      # Layout components
│   │   └── settings/    # Settings components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and API clients
│   │   ├── auth.ts      # Authentication manager
│   │   ├── notion.ts    # Notion API integration
│   │   └── utils/       # Utility functions
│   └── types/           # TypeScript interfaces
├── backend/             # Node.js backend server
│   ├── src/
│   │   ├── middleware/  # Authentication middleware
│   │   ├── services/    # Business logic services
│   │   └── server.js    # Express server
│   ├── scripts/         # Setup and utility scripts
│   └── disabled/        # Disabled features (Google Calendar)
└── CREDENTIALS.md       # Login credentials (not in git)
```

## Customization

### Adding Vehicles
Vehicles are managed through the Notion Buses database. Add new entries there and they'll automatically appear in the application.

### Maintenance Types
Update the `MAINTENANCE_TYPES` array in `src/lib/constants.ts` with your specific maintenance categories.

### Feature Flags
Manage features through Flagsmith dashboard:
- `ADMIN_MODE`: Enable/disable admin features
- `GOOGLE_CALENDAR`: Toggle Google Calendar integration
- `NOTION_CALENDAR`: Toggle Notion Calendar integration

### Styling
The application uses Tailwind CSS and shadcn/ui. Customize the theme in `tailwind.config.js`.

## Build for Production

### Frontend
```bash
npm run build
```

### Backend
```bash
cd backend
npm start
```

### Security Considerations
- Change default passwords after first login
- Use strong JWT secrets in production
- Set secure CORS origins
- Use HTTPS in production
- Consider external secret management for production deployments

## Development

### Code Quality
- TypeScript for type safety
- Modular component architecture
- Custom hooks for state management
- Utility functions for code reuse
- Clean separation of concerns

### Security
- No hardcoded credentials in source code
- Environment-based configuration
- Secure password hashing
- JWT token management
- Role-based access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details