# Sri Devi Bus Transports Dashboard

A modern, secure dashboard for managing bus transport operations with role-based access control, booking management, and maintenance scheduling.

---

## 👥 Users

### What This System Does

This dashboard helps you manage your bus transport business by:
- **Managing Bookings**: Track customer reservations, payments, and trip details
- **Scheduling Maintenance**: Keep your fleet in top condition with maintenance tracking
- **Monitoring Operations**: View today's bookings, fleet status, and urgent maintenance
- **Analyzing Performance**: Revenue tracking and operational metrics (Admin only)

### User Roles

**Admin**
- Full access to all features
- Analytics and revenue reports
- System settings and user management

**Manager**
- Create and manage bookings
- Schedule maintenance
- View dashboard and calendar
- No access to analytics or settings

### Key Features

- 🚌 **Booking Management**: Create bookings with customer details, vehicle selection, and payment tracking
- 🔧 **Maintenance Scheduling**: Schedule services, track costs, and monitor completion status
- 📊 **Dashboard Overview**: Today's operations, urgent maintenance alerts, and fleet availability
- 📅 **Calendar View**: Visual representation of bookings and maintenance schedules
- 📱 **Mobile Friendly**: Works on phones, tablets, and computers

---

## 🛠️ Developers

### Tech Stack

- **Frontend**: Vite.js, React 18, TypeScript
- **Backend**: Node.js, Express, JWT Authentication
- **UI**: shadcn/ui, Tailwind CSS
- **Database**: Notion API
- **Authentication**: JWT with bcrypt
- **Feature Flags**: Flagsmith
- **Icons**: Lucide React

### Development Setup

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Backend Setup
```bash
cd backend
npm install
npm run create-users  # Creates user accounts
cp .env.example .env  # Configure environment
npm run dev          # Start backend server
```

#### 3. Notion Database Setup

**Create Notion Integration:**
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create "Sridevi Bus Transport" integration
3. Copy the integration token

**Create Three Databases:**

**Bookings Database:**
- Customer (Title), Phone (Phone), Itinerary (Rich Text)
- Dates (Date range), Total (Number), Advance (Number)
- Status (Select: Confirmed, In Tour, Pending Payment, Complete)
- Vehicle (Relation to Buses)

**Maintenance Database:**
- Vehicle (Relation to Buses), Service Type (Multi-select)
- Service Dates (Date range), Cost (Number)
- Status (Select: Pending, In Progress, Done)

**Buses Database:**
- Bus Number (Title), Capacity (Number)
- Status (Select: available, confirmed, maintenance)

**Share databases with your integration**

#### 4. Environment Configuration
```bash
cp .env.example .env
```

Add your Notion integration token and database IDs to both frontend and backend `.env` files.

#### 5. Run Application
```bash
npm run dev  # Frontend at http://localhost:5173
```

### Authentication & Security

**Default Accounts** (created by `npm run create-users`):
- **Admin**: Full access including analytics
- **Manager**: Operations access only

Credentials stored in `CREDENTIALS.md` (not in git)

**Security Features:**
- JWT authentication (24-hour expiration)
- bcrypt password hashing
- Role-based access control
- Environment-based configuration

### Project Structure

```
├── src/                 # Frontend React app
│   ├── components/      # UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # API clients & utilities
│   └── types/           # TypeScript interfaces
├── backend/             # Node.js server
│   ├── src/             # Server code
│   └── scripts/         # Setup scripts
└── CREDENTIALS.md       # Login info (not in git)
```

### Customization

**Adding Vehicles**: Add entries to Notion Buses database
**Maintenance Types**: Update `MAINTENANCE_TYPES` in `src/lib/constants.ts`
**Feature Flags**: Manage via Flagsmith dashboard
**Styling**: Customize `tailwind.config.js`

### Production Build

```bash
npm run build        # Frontend
cd backend && npm start  # Backend
```

**Security Checklist:**
- Change default passwords
- Use strong JWT secrets
- Set secure CORS origins
- Use HTTPS in production

### Development Guidelines

- TypeScript for type safety
- Modular component architecture
- Custom hooks for state management
- No hardcoded credentials
- Environment-based configuration

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License