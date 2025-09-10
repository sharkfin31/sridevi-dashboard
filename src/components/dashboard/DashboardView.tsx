import { useMemo, useEffect, useState } from 'react';
import { DashboardStats } from './DashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarEvent, Booking, Maintenance } from '@/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon, AlertTriangle } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { getVehicles, getBookings, getMaintenance } from '@/lib/notion';

interface DashboardViewProps {
  events: CalendarEvent[];
  bookings?: Booking[];
}

function FleetAvailabilityCard() {
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { from: today, to: tomorrow };
  });
  const [loading, setLoading] = useState(true);
  const [fleetData, setFleetData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [vehicles, bookings, maintenance] = await Promise.all([
        getVehicles(),
        getBookings(),
        getMaintenance()
      ]);

      // Helper to check if a bus is booked in the selected range
      function isBooked(busId: string) {
        return bookings.some(b => {
          const busIds = Array.isArray(b.busId) ? b.busId : [b.busId];
          if (!busIds.includes(busId)) return false;
          if (!range?.from || !range?.to) return b.status === 'Confirmed' || b.status === 'In Tour';
          // Check date overlap
          return (
            b.startDate <= (range.to as Date) && b.endDate >= (range.from as Date)
          );
        });
      }

      // Helper to check if a bus is under maintenance in the selected range
      function isMaintenance(busId: string) {
        return maintenance.some(m => {
          if (m.busId !== busId) return false;
          if (!range?.from || !range?.to) return m.status !== 'Done';
          // Check date overlap
          return (
            m.startDate <= (range.to as Date) && m.endDate >= (range.from as Date)
          );
        });
      }

      // Compute status for each vehicle
      const available: string[] = [];
      const inUse: string[] = [];
      const maintenanceList: string[] = [];
      const outOfService: string[] = [];

      vehicles.forEach(v => {
        if (v.status === 'available' && !isBooked(v.id) && !isMaintenance(v.id)) {
          available.push(v.busNumber);
        } else if (isBooked(v.id)) {
          inUse.push(v.busNumber);
        } else if (isMaintenance(v.id)) {
          maintenanceList.push(v.busNumber);
        } else {
          outOfService.push(v.busNumber);
        }
      });

      setFleetData([
        {
          status: 'Available',
          count: available.length,
          color: 'bg-green-500',
          vehicles: available
        },
        {
          status: 'In Use',
          count: inUse.length,
          color: 'bg-blue-500',
          vehicles: inUse
        },
        {
          status: 'Maintenance',
          count: maintenanceList.length,
          color: 'bg-yellow-500',
          vehicles: maintenanceList
        },
        {
          status: 'Out of Service',
          count: outOfService.length,
          color: 'bg-red-500',
          vehicles: outOfService
        }
      ]);
      setLoading(false);
    }
    fetchData();
  }, [range]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Fleet Availability</CardTitle>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="justify-between font-normal"
              >
                {range?.from && range?.to
                  ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
                  : "Select range"}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">Loading...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {fleetData.map((item) => (
              <Card key={item.status} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium">{item.status}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{item.count}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.vehicles.map((vehicle: string) => (
                      <span key={vehicle} className="text-xs bg-muted px-2 py-1 rounded">
                        {vehicle}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardView({ bookings = [] }: DashboardViewProps) {
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const maintenanceData = await getMaintenance();
        setMaintenance(maintenanceData);
      } catch (error) {
        console.error('Dashboard data fetch failed:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Current month data
    const currentMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.startDate);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });
    
    const monthlyRevenue = currentMonthBookings.reduce((sum, booking) => sum + booking.amount, 0);
    const currentActiveBookings = bookings.filter(b => b.status === 'In Tour').length;
    const currentMaintenanceScheduled = maintenance.filter(m => m.status === 'Pending').length;

    // Last month data for comparison
    const lastMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.startDate);
      return bookingDate.getMonth() === lastMonth && bookingDate.getFullYear() === lastMonthYear;
    });
    
    const lastMonthRevenue = lastMonthBookings.reduce((sum, booking) => sum + booking.amount, 0);
    const lastMonthActiveBookings = lastMonthBookings.filter(b => b.status === 'In Tour').length;
    const lastMonthMaintenance = maintenance.filter(m => {
      const date = new Date(m.startDate);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear && m.status === 'Pending';
    }).length;

    // Calculate percentage changes
    const bookingsChange = lastMonthBookings.length > 0 
      ? ((currentMonthBookings.length - lastMonthBookings.length) / lastMonthBookings.length * 100).toFixed(1)
      : currentMonthBookings.length > 0 ? '100' : '0';
    
    const activeChange = lastMonthActiveBookings > 0 
      ? ((currentActiveBookings - lastMonthActiveBookings) / lastMonthActiveBookings * 100).toFixed(1)
      : currentActiveBookings > 0 ? '100' : '0';
    
    const maintenanceChange = lastMonthMaintenance > 0 
      ? ((currentMaintenanceScheduled - lastMonthMaintenance) / lastMonthMaintenance * 100).toFixed(1)
      : currentMaintenanceScheduled > 0 ? '100' : '0';
    
    const revenueChange = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : monthlyRevenue > 0 ? '100' : '0';

    return {
      totalBookings: currentMonthBookings.length,
      activeBookings: currentActiveBookings,
      maintenanceScheduled: currentMaintenanceScheduled,
      totalRevenue: monthlyRevenue,
      bookingsChange: `${bookingsChange}% from last month`,
      activeChange: `${activeChange}% from last month`,
      maintenanceChange: `${maintenanceChange}% from last month`,
      revenueChange: `${revenueChange}% from last month`,
      bookingsTrend: parseFloat(bookingsChange) >= 0 ? ('up' as const) : ('down' as const),
      activeTrend: parseFloat(activeChange) >= 0 ? ('up' as const) : ('down' as const),
      maintenanceTrend: parseFloat(maintenanceChange) >= 0 ? ('up' as const) : ('down' as const),
      revenueTrend: parseFloat(revenueChange) >= 0 ? ('up' as const) : ('down' as const)
    };
  }, [bookings, maintenance]);



  const upcomingMaintenance = maintenance
    .filter(m => m.status === 'Pending')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <DashboardStats {...stats} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings
                  .filter(b => {
                    const today = new Date();
                    const bookingDate = new Date(b.startDate);
                    return bookingDate.toDateString() === today.toDateString();
                  })
                  .slice(0, 5)
                  .map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.customerName}</TableCell>
                      <TableCell>{booking.destination}</TableCell>
                      <TableCell>{booking.busId}</TableCell>
                      <TableCell>
                        <Badge variant={
                          booking.status === 'Confirmed' ? 'default' :
                          booking.status === 'In Tour' ? 'secondary' : 'outline'
                        }>
                          {booking.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                {bookings.filter(b => {
                  const today = new Date();
                  const bookingDate = new Date(b.startDate);
                  return bookingDate.toDateString() === today.toDateString();
                }).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No bookings scheduled for today
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Urgent Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingMaintenance
                  .filter(m => {
                    const dueDate = new Date(m.startDate);
                    const today = new Date();
                    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                    return daysDiff <= 7; // Show maintenance due within 7 days
                  })
                  .slice(0, 5)
                  .map((maint) => {
                    const dueDate = new Date(maint.startDate);
                    const today = new Date();
                    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                    return (
                      <TableRow key={maint.id}>
                        <TableCell className="font-medium">{maint.busId}</TableCell>
                        <TableCell>{maint.type}</TableCell>
                        <TableCell>{dueDate.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            daysDiff <= 1 ? 'destructive' :
                            daysDiff <= 3 ? 'secondary' : 'outline'
                          }>
                            {daysDiff <= 0 ? 'Overdue' : daysDiff <= 1 ? 'Urgent' : daysDiff <= 3 ? 'Soon' : 'Scheduled'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {upcomingMaintenance.filter(m => {
                  const dueDate = new Date(m.startDate);
                  const today = new Date();
                  const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                  return daysDiff <= 7;
                }).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No urgent maintenance scheduled
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <div className="w-full">
        <FleetAvailabilityCard />
      </div>
    </div>
  );
}