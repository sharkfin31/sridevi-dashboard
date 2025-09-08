import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarEvent, Booking, Maintenance } from '@/types';
import { YearPicker } from '@/components/ui/year-picker';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart, Pie, PieChart, Cell, Line, LineChart, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { TrendingUp, Bus, DollarSign, Calendar } from 'lucide-react';

interface AnalyticsViewProps {
  events: CalendarEvent[];
  bookings: Booking[];
  maintenance: Maintenance[];
}

export function AnalyticsView({ events, bookings, maintenance }: AnalyticsViewProps) {
  const [selectedYear, setSelectedYear] = useState<Date | undefined>(new Date());

  const monthlyBookings = useMemo(() => {
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
        month,
        bookings: monthBookings.length,
        revenue: monthBookings.reduce((sum, e) => sum + (e.data as Booking).amount, 0)
      };
    });
  }, [events, selectedYear]);

  const fleetUsage = useMemo(() => {
    const busUsage = bookings.reduce((acc, booking) => {
      const busNumbers = Array.isArray(booking.busNumber) ? booking.busNumber : [booking.busNumber || booking.busId || 'Unknown'];
      busNumbers.forEach(busNumber => {
        acc[busNumber] = (acc[busNumber] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(busUsage)
      .map(([busNumber, count]) => ({ busId: busNumber, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);
  }, [bookings]);

  const yearlyFinancials = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - 4 + i;
      const yearBookings = bookings.filter(b => new Date(b.startDate).getFullYear() === year);
      const revenue = yearBookings.reduce((sum, b) => sum + b.amount, 0);
      const expenses = revenue * 0.65; // Estimated expenses
      return {
        year: year.toString(),
        revenue,
        expenses,
        profit: revenue - expenses
      };
    });
  }, [bookings]);

  const fleetStatus = [
    { name: 'Available', value: 8, color: '#10b981' },
    { name: 'In Use', value: 5, color: '#3b82f6' },
    { name: 'Maintenance', value: 2, color: '#f59e0b' },
    { name: 'Out of Service', value: 1, color: '#ef4444' }
  ];

  const maintenanceTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => {
      const monthMaintenance = maintenance.filter(m => 
        new Date(m.scheduledDate).getMonth() === index
      );
      return {
        month,
        scheduled: monthMaintenance.filter(m => m.status === 'scheduled').length,
        completed: monthMaintenance.filter(m => m.status === 'completed').length,
        cost: monthMaintenance.reduce((sum, m) => sum + (m.estimatedDuration * 500), 0)
      };
    });
  }, [maintenance]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">13 of 16 buses active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Trip Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2 days</div>
            <p className="text-xs text-muted-foreground">-0.5 days from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,200</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Bookings */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Monthly Bookings</CardTitle>
              <YearPicker selectedYear={selectedYear} onYearSelect={setSelectedYear} />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={{ bookings: { label: "Bookings", color: "hsl(var(--chart-1))" } }} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyBookings} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Fleet Status */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {fleetStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm">{data.value} buses</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Best Performing Buses */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Buses</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={{ bookings: { label: "Bookings", color: "hsl(var(--chart-2))" } }} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fleetUsage} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="busId" type="category" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Yearly Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle>5-Year Financial Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={{
              revenue: { label: "Revenue", color: "#10b981" },
              expenses: { label: "Expenses", color: "#ef4444" },
              profit: { label: "Profit", color: "#3b82f6" }
            }} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyFinancials} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <ChartTooltip content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="font-medium">{label}</div>
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <p className="text-sm">{entry.name}: ₹{entry.value?.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Trends</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ChartContainer config={{
            scheduled: { label: "Scheduled", color: "#f59e0b" },
            completed: { label: "Completed", color: "#10b981" },
            cost: { label: "Cost", color: "#ef4444" }
          }} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={maintenanceTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area dataKey="scheduled" stackId="1" stroke="var(--color-scheduled)" fill="var(--color-scheduled)" fillOpacity={0.6} />
                <Area dataKey="completed" stackId="1" stroke="var(--color-completed)" fill="var(--color-completed)" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}