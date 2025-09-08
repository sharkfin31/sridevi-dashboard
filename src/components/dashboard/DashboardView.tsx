import { useMemo, useEffect, useState } from 'react';
import { DashboardStats } from './DashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarEvent, Booking, Maintenance } from '@/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { getVehicles, getBookings, getMaintenance } from '@/lib/notion';

interface DashboardViewProps {
  events: CalendarEvent[];
  bookings?: Booking[];
}

function FleetAvailabilityCard() {
  const [range, setRange] = useState<DateRange | undefined>();
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
          if (!range?.from || !range?.to) return b.status === 'confirmed' || b.status === 'in-tour';
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
          if (!range?.from || !range?.to) return m.status !== 'done';
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

export function DashboardView({ events, bookings = [] }: DashboardViewProps) {
  const stats = useMemo(() => {
    const bookingEvents = events.filter(e => e.type === 'booking');
    const maintenanceEvents = events.filter(e => e.type === 'maintenance');
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyRevenue = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.startDate);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      })
      .reduce((sum, booking) => sum + booking.amount, 0);

    return {
      totalBookings: bookings.length,
      activeBookings: bookings.filter(b => b.status === 'in-tour').length,
      maintenanceScheduled: maintenanceEvents.filter(e => {
        const maint = e.data as Maintenance;
        return maint.status === 'scheduled';
      }).length,
      totalRevenue: monthlyRevenue
    };
  }, [events, bookings]);

  return (
    <div className="space-y-6">
      <DashboardStats {...stats} />
      
      <div className="w-full">
        <FleetAvailabilityCard />
      </div>
    </div>
  );
}