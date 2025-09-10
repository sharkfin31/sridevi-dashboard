import { useState, useEffect } from 'react';
import { AppSidebar, SiteHeader } from './components/layout';
import { DashboardView } from './components/dashboard/DashboardView';
import { GoogleCalendar, BookingsView, MaintenanceView, AnalyticsView } from './components/views';
import { SettingsView } from './components/views/SettingsView';
import { AccountView } from './components/views/AccountView';
import { LoginForm } from './components/auth/LoginForm';
import { authManager } from './lib/auth';
import { BookingForm, MaintenanceForm } from './components/forms';
import { CalendarEvent, Booking, Maintenance } from './types';
import { getBookings, getMaintenance } from './lib/notion';
import { SidebarProvider, SidebarInset, useSidebar } from './components/ui/sidebar';
import { Button } from './components/ui/button';
import { Plus, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFeatures } from './hooks/useFeatures';

function SidebarToggle() {
  const { open, setOpen } = useSidebar();
  
  return (
    <Button
      onClick={() => setOpen(!open)}
      className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full border bg-background shadow-md hover:bg-accent p-0"
      variant="ghost"
    >
      {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </Button>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAccount, setShowAccount] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { features } = useFeatures();
  
  // Override admin mode if user is manager
  const isAdminMode = features.ADMIN_MODE && authManager.getUser()?.role !== 'manager';

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authManager.logout();
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    setShowAccount(false);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, maintenanceData] = await Promise.all([
        getBookings(),
        getMaintenance(),
      ]);

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


      setEvents([...bookingEvents, ...maintenanceEvents]);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleDataUpdate = () => {
    loadData();
  };

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

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
        return isAdminMode ? <AnalyticsView events={events} bookings={bookings} maintenance={maintenance} /> : <div className="text-center py-8">Access denied</div>;
      case 'settings':
        return isAdminMode ? <SettingsView /> : <div className="text-center py-8">Access denied</div>;
      case 'account':
        return <AccountView />;
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
      <AppSidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          if (tab === 'account') {
            setShowAccount(true);
          } else {
            setActiveTab(tab);
            setShowAccount(false);
          }
        }} 
        isAdminMode={isAdminMode}
        onAccountClick={() => {
          setActiveTab('account');
          setShowAccount(true);
        }}
        onLogout={handleLogout}
      />
      <SidebarInset className="relative">
        <SidebarToggle />
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
            {showAccount ? <AccountView /> : renderContent()}
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


    </SidebarProvider>
  );
}

export default App;