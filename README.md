# Sridevi Bus Transport Dashboard

A modern dashboard for managing bus transport operations with calendar views, booking management, and maintenance scheduling. Built with Vite.js, React, TypeScript, and shadcn/ui, with Notion as the backend database.

## Features

- 📅 **Calendar View**: Visual representation of bus bookings and maintenance schedules
- 🚌 **Booking Management**: Create and track customer bookings
- 🔧 **Maintenance Scheduling**: Schedule and monitor bus maintenance
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Real-time Sync**: Integrates with Notion databases for live updates
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **Frontend**: Vite.js, React 18, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Calendar**: react-big-calendar
- **Backend**: Notion API
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Notion Setup

#### Create Notion Integration
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name it "Sridevi Bus Transport"
4. Copy the "Internal Integration Token"

#### Create Notion Databases

Create three databases in your Notion workspace:

**Bookings Database** with properties:
- CustomerName (Title)
- BusId (Rich Text)
- CustomerPhone (Phone)
- Destination (Rich Text)
- StartDate (Date)
- EndDate (Date)
- Amount (Number)
- Status (Select: pending, confirmed, cancelled)

**Maintenance Database** with properties:
- BusId (Rich Text)
- Type (Select: Regular Service, Oil Change, Tire Replacement, Brake Service, Engine Repair, AC Service, Body Work)
- Description (Rich Text)
- ScheduledDate (Date)
- EstimatedDuration (Number)
- Status (Select: scheduled, in-progress, completed)

**Buses Database** with properties:
- BusNumber (Title)
- Capacity (Number)
- Status (Select: available, booked, maintenance)

#### Share Databases with Integration
1. Open each database in Notion
2. Click "Share" → "Invite"
3. Search for your integration name and invite it

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your Notion credentials:
```env
NOTION_TOKEN=your_notion_integration_token_here
NOTION_BOOKINGS_DB_ID=your_bookings_database_id_here
NOTION_MAINTENANCE_DB_ID=your_maintenance_database_id_here
NOTION_BUSES_DB_ID=your_buses_database_id_here
```

**To get Database IDs:**
- Open the database in Notion
- Copy the URL
- The database ID is the 32-character string after the last `/` and before `?`
- Example: `https://notion.so/workspace/DATABASE_ID?v=...`

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Creating Bookings
1. Click "New Booking" button
2. Fill in customer details, select bus, destination, dates, and amount
3. Click "Create Booking" - this will update your Notion database
4. The booking will appear on the calendar in blue

### Scheduling Maintenance
1. Click "Schedule Maintenance" button
2. Select bus, maintenance type, add description, date, and duration
3. Click "Schedule Maintenance" - this will update your Notion database
4. The maintenance will appear on the calendar in orange

### Viewing Details
- Click on any calendar event to view detailed information
- Bookings show customer info, destination, dates, and amount
- Maintenance shows type, description, date, and duration

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── Calendar.tsx     # Main calendar component
│   ├── BookingForm.tsx  # Booking creation form
│   ├── MaintenanceForm.tsx # Maintenance scheduling form
│   └── EventDetails.tsx # Event details modal
├── lib/
│   ├── notion.ts        # Notion API integration
│   └── utils.ts         # Utility functions
├── types/
│   └── index.ts         # TypeScript interfaces
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Customization

### Adding More Buses
Update the `buses` array in `BookingForm.tsx` and `MaintenanceForm.tsx` with your actual bus information.

### Modifying Maintenance Types
Update the `maintenanceTypes` array in `MaintenanceForm.tsx` with your specific maintenance categories.

### Styling
The application uses Tailwind CSS and shadcn/ui. Modify the theme in `tailwind.config.js` or component styles as needed.

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details