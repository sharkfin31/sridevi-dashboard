import { useState, useEffect } from 'react';
import { AppSidebar, SiteHeader } from './components/layout';
import { DashboardView } from './components/dashboard/DashboardView';
import { GoogleCalendar, BookingsView, MaintenanceView, AnalyticsView } from './components/views';
import { BookingForm, MaintenanceForm } from './components/forms';
import { CalendarEvent, Booking, Maintenance } from './types';
import { getBookings, getMaintenance } from './lib/notion';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import { Button } from './components/ui/button';
import { Plus, Wrench } from 'lucide-react';
import { useFeatures } from './hooks/useFeatures';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { features } = useFeatures();

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading data...');
      const [bookingsData, maintenanceData] = await Promise.all([
        getBookings(),
        getMaintenance(),
      ]);

      console.log('📊 Loaded bookings:', bookingsData.length, bookingsData);
      console.log('🔧 Loaded maintenance:', maintenanceData.length, maintenanceData);

      setBookings(bookingsData);
      setMaintenance(maintenanceData);

      // Create events for dashboard metrics (not for calendar display)
      const bookingEvents: CalendarEvent[] = bookingsData.map((booking: Booking) => ({
        id: booking.id,
        title: `${booking.customerName} - ${booking.destination}`,
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
        type: 'booking',
        data: booking,
      }));

      const maintenanceEvents: CalendarEvent[] = maintenanceData.map((maint: Maintenance) => ({
        id: maint.id,
        title: `Maintenance: ${maint.type}`,
        start: new Date(maint.startDate),
        end: new Date(maint.endDate),
        type: 'maintenance',
        data: maint,
      }));

      console.log('📅 Created events:', [...bookingEvents, ...maintenanceEvents]);
      setEvents([...bookingEvents, ...maintenanceEvents]);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDataUpdate = () => {
    loadData();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView events={events} bookings={bookings} />;
      case 'calendar':
        return (
          <div className="bg-card rounded-lg border shadow-lg">
            <GoogleCalendar height="700px" />
          </div>
        );
      case 'bookings':
        return <BookingsView />;
      case 'maintenance':
        return <MaintenanceView maintenance={maintenance} onMaintenanceUpdated={handleDataUpdate} />;
      case 'analytics':
        return <AnalyticsView events={events} bookings={bookings} maintenance={maintenance} />;
      case 'test':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Backend Test</h2>
            <div className="bg-muted p-4 rounded">
              <p>Backend URL: {import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}</p>
              <p>Check console for API calls</p>
            </div>
          </div>
        );
      default:
        return <div className="text-center py-8">Coming soon...</div>;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <SidebarInset>
        <SiteHeader activeTab={activeTab}>
          <div className="flex items-center gap-2 ml-auto">
            {features.ADMIN_MODE && (
              <>
                <Button onClick={() => setShowBookingForm(true)} size="sm">
                  <Plus className="h-4 w-4" />
                  New Booking
                </Button>
                <Button onClick={() => setShowMaintenanceForm(true)} variant="outline" size="sm">
                  <Wrench className="h-4 w-4" />
                  Schedule Maintenance
                </Button>
              </>
            )}
          </div>
        </SiteHeader>
        
        <div className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {renderContent()}
          </div>
        </div>
      </SidebarInset>

      {features.ADMIN_MODE && (
        <>
          <BookingForm
            open={showBookingForm}
            onOpenChange={setShowBookingForm}
            onBookingCreated={handleDataUpdate}
          />
          <MaintenanceForm
            open={showMaintenanceForm}
            onOpenChange={setShowMaintenanceForm}
            onMaintenanceCreated={handleDataUpdate}
          />
        </>
      )}


    </SidebarProvider>
  );
}

export default App;