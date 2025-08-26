import { useState, useEffect } from 'react';
import { AppSidebar, SiteHeader } from './components/layout';
import { DashboardView } from './components/dashboard/DashboardView';
import { GoogleCalendar, BookingsView, MaintenanceView } from './components/views';
import { BookingForm, MaintenanceForm } from './components/forms';
import { EventDetails } from './components/modals';
import { CalendarEvent, Booking, Maintenance } from './types';
import { getBookings, getMaintenance } from './lib/notion';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import { Button } from './components/ui/button';
import { Plus, Wrench } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [, setBookings] = useState<Booking[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [selectedEvent] = useState<CalendarEvent | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, maintenanceData] = await Promise.all([
        getBookings(),
        getMaintenance(),
      ]);

      setBookings(bookingsData);
      setMaintenance(maintenanceData);

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
        start: new Date(maint.scheduledDate),
        end: new Date(new Date(maint.scheduledDate).getTime() + maint.estimatedDuration * 60 * 60 * 1000),
        type: 'maintenance',
        data: maint,
      }));

      setEvents([...bookingEvents, ...maintenanceEvents]);
    } catch (error) {
      console.error('Error loading data:', error);
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
        return <DashboardView events={events} />;
      case 'calendar':
        return (
          <div className="bg-card rounded-lg border shadow-lg">
            <GoogleCalendar height="700px" />
          </div>
        );
      case 'bookings':
        return <BookingsView />;
      case 'maintenance':
        return <MaintenanceView maintenance={maintenance} />;
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
            <Button onClick={() => setShowBookingForm(true)} size="sm">
              <Plus className="h-4 w-4" />
              New Booking
            </Button>
            <Button onClick={() => setShowMaintenanceForm(true)} variant="outline" size="sm">
              <Wrench className="h-4 w-4" />
              Schedule Maintenance
            </Button>
          </div>
        </SiteHeader>
        
        <div className="flex flex-1 flex-col">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {renderContent()}
          </div>
        </div>
      </SidebarInset>

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

      <EventDetails
        event={selectedEvent}
        open={showEventDetails}
        onOpenChange={setShowEventDetails}
      />
    </SidebarProvider>
  );
}

export default App;