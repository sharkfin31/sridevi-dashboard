import { useMemo, useState } from 'react';
import { DashboardStats } from './DashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarEvent, Booking, Maintenance } from '@/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { YearPicker } from '@/components/ui/year-picker';
import { DateRange } from 'react-day-picker';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface DashboardViewProps {
  events: CalendarEvent[];
}

function BookingChart({ events }: { events: CalendarEvent[] }) {
  const [selectedYear, setSelectedYear] = useState<Date | undefined>(new Date());

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = selectedYear?.getFullYear() || new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthBookings = events.filter(e => {
        if (e.type !== 'booking') return false;
        const booking = e.data as Booking;
        const bookingDate = new Date(booking.startDate);
        return bookingDate.getMonth() === index && bookingDate.getFullYear() === year;
      });
      
      return {
        date: `${year}-${String(index + 1).padStart(2, '0')}-01`,
        bookings: monthBookings.length,
        month
      };
    });
  }, [events, selectedYear]);



  const chartConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Bookings</CardTitle>
          <YearPicker
            selectedYear={selectedYear}
            onYearSelect={setSelectedYear}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-2 pt-2">
        <div className="flex justify-center">
          <ChartContainer config={chartConfig} className="h-[200px] w-full max-w-3xl">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueChart() {
  const [selectedYear, setSelectedYear] = useState<Date | undefined>(new Date());

  const revenueData = [
    { month: "Jan", Income: 12500, Expenses: 8200, Revenue: 4300 },
    { month: "Feb", Income: 15800, Expenses: 9100, Revenue: 6700 },
    { month: "Mar", Income: 18200, Expenses: 10500, Revenue: 7700 },
    { month: "Apr", Income: 16900, Expenses: 9800, Revenue: 7100 },
    { month: "May", Income: 21300, Expenses: 11200, Revenue: 10100 },
    { month: "Jun", Income: 24500, Expenses: 12800, Revenue: 11700 },
  ];

  const chartConfig = {
    income: {
      label: "Income",
      color: "#10b981",
    },
    expenses: {
      label: "Expenses", 
      color: "#ef4444",
    },
    revenue: {
      label: "Revenue",
      color: "#3b82f6",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Financial Overview</CardTitle>
          <YearPicker
            selectedYear={selectedYear}
            onYearSelect={setSelectedYear}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-2 pt-2">
        <div className="flex justify-center">
          <ChartContainer config={chartConfig} className="h-[200px] w-full max-w-3xl">
            <AreaChart
              accessibilityLayer
              data={revenueData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
            />
            <YAxis hide />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <div className="grid gap-1">
                        <div className="font-medium">{label}</div>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div 
                              className="h-2 w-2 rounded-full" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <p className="text-sm">
                              {entry.name}: ₹{entry.value?.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              dataKey="Income" 
              type="monotone" 
              stroke="var(--color-income)" 
              fill="var(--color-income)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area 
              dataKey="Expenses" 
              type="monotone" 
              stroke="var(--color-expenses)" 
              fill="var(--color-expenses)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area 
              dataKey="Revenue" 
              type="monotone" 
              stroke="var(--color-revenue)" 
              fill="var(--color-revenue)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function FleetAvailabilityCard() {
  const [range, setRange] = useState<DateRange | undefined>();
  
  const fleetData = [
    { 
      status: 'Available', 
      count: 8, 
      color: 'bg-green-500',
      vehicles: ['BUS001', 'BUS004', 'BUS007', 'BUS008', 'BUS010', 'BUS012', 'BUS015', 'BUS016']
    },
    { 
      status: 'In Use', 
      count: 5, 
      color: 'bg-blue-500',
      vehicles: ['BUS002', 'BUS005', 'BUS009', 'BUS011', 'BUS014']
    },
    { 
      status: 'Maintenance', 
      count: 2, 
      color: 'bg-yellow-500',
      vehicles: ['BUS003', 'BUS006']
    },
    { 
      status: 'Out of Service', 
      count: 1, 
      color: 'bg-red-500',
      vehicles: ['BUS013']
    },
  ];

  const total = fleetData.reduce((sum, item) => sum + item.count, 0);

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
                    <div className="text-xs text-muted-foreground">
                      {Math.round((item.count / total) * 100)}%
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.vehicles.map((vehicle) => (
                    <span key={vehicle} className="text-xs bg-muted px-2 py-1 rounded">
                      {vehicle}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardView({ events }: DashboardViewProps) {
  const stats = useMemo(() => {
    const bookings = events.filter(e => e.type === 'booking');
    const maintenance = events.filter(e => e.type === 'maintenance');
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyRevenue = bookings
      .filter(e => {
        const booking = e.data as Booking;
        const bookingDate = new Date(booking.startDate);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      })
      .reduce((sum, event) => {
        const booking = event.data as Booking;
        return sum + booking.amount;
      }, 0);

    return {
      totalBookings: bookings.length,
      activeBookings: bookings.filter(e => {
        const booking = e.data as Booking;
        return booking.status === 'confirmed';
      }).length,
      maintenanceScheduled: maintenance.filter(e => {
        const maint = e.data as Maintenance;
        return maint.status === 'scheduled';
      }).length,
      totalRevenue: monthlyRevenue
    };
  }, [events]);

  return (
    <div className="space-y-6">
      <DashboardStats {...stats} />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="w-full">
          <BookingChart events={events} />
        </div>
        <div className="w-full">
          <RevenueChart />
        </div>
      </div>
      
      <div className="w-full">
        <FleetAvailabilityCard />
      </div>
    </div>
  );
}