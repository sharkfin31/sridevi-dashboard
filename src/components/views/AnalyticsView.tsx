import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarEvent, Booking, Maintenance } from '@/types';
import { YearPicker } from '@/components/ui/year-picker';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart, Line, LineChart, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { TrendingUp, Bus, DollarSign, Clock, Wrench, Target, BarChart3, ArrowUp, ArrowDown, ChevronDown, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AnalyticsViewProps {
  events: CalendarEvent[];
  bookings: Booking[];
  maintenance: Maintenance[];
}

export function AnalyticsView({ bookings, maintenance }: AnalyticsViewProps) {
  const [selectedYear, setSelectedYear] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth());
  const [filterType, setFilterType] = useState<'year' | 'month'>('year');
  const [sortField, setSortField] = useState<string>('bookings');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [revenueSortField, setRevenueSortField] = useState<string>('revenue');
  const [revenueSortOrder, setRevenueSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedBuses, setSelectedBuses] = useState<string[]>([]);
  const [revenueSelectedBuses, setRevenueSelectedBuses] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('operations');
  const [revenueChartView, setRevenueChartView] = useState<'current' | 'comparison'>('current');

  // Filtered bookings based on selected time period
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.startDate);
      
      if (filterType === 'year' && selectedYear) {
        return bookingDate.getFullYear() === selectedYear.getFullYear();
      } else if (filterType === 'month' && selectedMonth !== null) {
        const currentYear = new Date().getFullYear();
        return bookingDate.getMonth() === selectedMonth && bookingDate.getFullYear() === currentYear;
      }
      return true;
    });
  }, [bookings, filterType, selectedYear, selectedMonth]);

  // Operations Analytics Data
  const operationsMetrics = useMemo(() => {
    const totalBookings = filteredBookings.length;
    const activeBookings = filteredBookings.filter(b => b.status === 'In Tour').length;
    const completedBookings = filteredBookings.filter(b => b.status === 'Complete').length;
    const avgTripDuration = filteredBookings.reduce((sum, b) => {
      const days = Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 3600 * 24));
      return sum + days;
    }, 0) / filteredBookings.length || 0;

    const fleetUtilization = filteredBookings.length > 0 ? (activeBookings / totalBookings) * 100 : 0;
    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    return {
      totalBookings,
      activeBookings,
      completedBookings,
      avgTripDuration: avgTripDuration.toFixed(1),
      fleetUtilization: fleetUtilization.toFixed(1),
      completionRate: completionRate.toFixed(1),
      maintenanceScheduled: maintenance.filter(m => m.status === 'Pending').length,
      maintenanceCompleted: maintenance.filter(m => m.status === 'Done').length
    };
  }, [filteredBookings, maintenance]);

  // Revenue Analytics Data
  const revenueMetrics = useMemo(() => {
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.amount, 0);
    const totalAdvance = filteredBookings.reduce((sum, b) => sum + (b.advance || 0), 0);
    const pendingPayments = filteredBookings.reduce((sum, b) => sum + (b.amount - (b.advance || 0)), 0);
    const avgBookingValue = totalRevenue / filteredBookings.length || 0;
    const maintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
    const netProfit = totalRevenue - maintenanceCost;
    
    // Calculate monthly revenue for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = bookings.filter(b => {
      const date = new Date(b.startDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((sum, b) => sum + b.amount, 0);

    return {
      totalRevenue,
      totalAdvance,
      pendingPayments,
      avgBookingValue,
      maintenanceCost,
      netProfit,
      monthlyRevenue,
      profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0'
    };
  }, [filteredBookings, maintenance, bookings]);

  // Get all unique bus IDs for multi-select
  const allBusIds = useMemo(() => {
    const busIds = new Set<string>();
    filteredBookings.forEach(booking => {
      const busNumbers = Array.isArray(booking.busNumber) ? booking.busNumber : [booking.busNumber || booking.busId || 'Unknown'];
      busNumbers.forEach(busNumberRaw => {
        busIds.add(String(busNumberRaw));
      });
    });
    return Array.from(busIds).sort();
  }, [filteredBookings]);

  // Operations Fleet Performance Data (no revenue)
  const operationsFleetPerformance = useMemo(() => {
    const fleetData = filteredBookings.reduce((acc, booking) => {
      const busNumbers = Array.isArray(booking.busNumber) ? booking.busNumber : [booking.busNumber || booking.busId || 'Unknown'];
      busNumbers.forEach(busNumberRaw => {
        const busNumber = String(busNumberRaw);
        if (!acc[busNumber]) {
          acc[busNumber] = {
            busId: busNumber,
            bookings: 0,
            totalKm: 0,
            avgTripDuration: 0,
            utilization: 0,
            status: 'Active'
          };
        }
        acc[busNumber].bookings += 1;
        acc[busNumber].totalKm += booking.totalKilometers || 0;
        const duration = Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 3600 * 24));
        acc[busNumber].avgTripDuration = (acc[busNumber].avgTripDuration + duration) / 2;
        acc[busNumber].utilization = (acc[busNumber].bookings / filteredBookings.length) * 100;
      });
      return acc;
    }, {} as Record<string, any>);

    return Object.values(fleetData)
      .filter(bus => selectedBuses.length === 0 || selectedBuses.includes(bus.busId))
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
  }, [filteredBookings, selectedBuses, sortField, sortOrder]);

  // Revenue Fleet Performance Data
  const revenueFleetPerformance = useMemo(() => {
    const fleetData = filteredBookings.reduce((acc, booking) => {
      const busNumbers = Array.isArray(booking.busNumber) ? booking.busNumber : [booking.busNumber || booking.busId || 'Unknown'];
      busNumbers.forEach(busNumberRaw => {
        const busNumber = String(busNumberRaw);
        if (!acc[busNumber]) {
          acc[busNumber] = {
            busId: busNumber,
            bookings: 0,
            revenue: 0,
            avgBookingValue: 0,
            totalAdvance: 0,
            pendingPayment: 0
          };
        }
        acc[busNumber].bookings += 1;
        acc[busNumber].revenue += booking.amount;
        acc[busNumber].totalAdvance += booking.advance || 0;
        acc[busNumber].pendingPayment += (booking.amount - (booking.advance || 0));
        acc[busNumber].avgBookingValue = acc[busNumber].revenue / acc[busNumber].bookings;
      });
      return acc;
    }, {} as Record<string, any>);

    return Object.values(fleetData)
      .filter(bus => revenueSelectedBuses.length === 0 || revenueSelectedBuses.includes(bus.busId))
      .sort((a, b) => {
        const aVal = a[revenueSortField];
        const bVal = b[revenueSortField];
        return revenueSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
  }, [filteredBookings, revenueSelectedBuses, revenueSortField, revenueSortOrder]);



  // Table totals for operations
  const operationsTotals = useMemo(() => {
    return operationsFleetPerformance.reduce((acc, bus) => {
      acc.totalBookings += bus.bookings;
      acc.totalKm += bus.totalKm;
      acc.avgDuration += bus.avgTripDuration;
      acc.avgUtilization += bus.utilization;
      return acc;
    }, { totalBookings: 0, totalKm: 0, avgDuration: 0, avgUtilization: 0 });
  }, [operationsFleetPerformance]);

  // Table totals for revenue
  const revenueTotals = useMemo(() => {
    return revenueFleetPerformance.reduce((acc, bus) => {
      acc.totalBookings += bus.bookings;
      acc.totalRevenue += bus.revenue;
      acc.totalAdvance += bus.totalAdvance;
      acc.totalPending += bus.pendingPayment;
      return acc;
    }, { totalBookings: 0, totalRevenue: 0, totalAdvance: 0, totalPending: 0 });
  }, [revenueFleetPerformance]);

  // Monthly Trends
  const monthlyTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = selectedYear?.getFullYear() || new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthBookings = bookings.filter(b => {
        const date = new Date(b.startDate);
        return date.getMonth() === index && date.getFullYear() === year;
      });
      
      const monthMaintenance = maintenance.filter(m => {
        const date = new Date(m.startDate);
        return date.getMonth() === index && date.getFullYear() === year;
      });

      return {
        month,
        bookings: monthBookings.length,
        revenue: monthBookings.reduce((sum, b) => sum + b.amount, 0),
        maintenanceCost: monthMaintenance.reduce((sum, m) => sum + m.cost, 0),
        profit: monthBookings.reduce((sum, b) => sum + b.amount, 0) - monthMaintenance.reduce((sum, m) => sum + m.cost, 0)
      };
    });
  }, [bookings, maintenance, selectedYear]);

  // Yearly comparison data - 3 years line chart
  const yearlyComparisonData = useMemo(() => {
    const currentYear = selectedYear?.getFullYear() || new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];
    
    return years.map(year => {
      const yearBookings = bookings.filter(b => {
        const date = new Date(b.startDate);
        return date.getFullYear() === year;
      });
      
      const yearMaintenance = maintenance.filter(m => {
        const date = new Date(m.startDate);
        return date.getFullYear() === year;
      });

      const revenue = yearBookings.reduce((sum, b) => sum + b.amount, 0);
      const costs = yearMaintenance.reduce((sum, m) => sum + m.cost, 0);
      const profit = revenue - costs;

      return {
        year: year.toString(),
        revenue,
        costs,
        profit
      };
    });
  }, [bookings, maintenance, selectedYear]);

  // Customer Analytics
  const customerAnalytics = useMemo(() => {
    const customerData = bookings.reduce((acc, booking) => {
      if (!acc[booking.customerName]) {
        acc[booking.customerName] = {
          name: booking.customerName,
          bookings: 0,
          totalSpent: 0,
          lastBooking: booking.startDate,
          avgBookingValue: 0
        };
      }
      acc[booking.customerName].bookings += 1;
      acc[booking.customerName].totalSpent += booking.amount;
      if (new Date(booking.startDate) > new Date(acc[booking.customerName].lastBooking)) {
        acc[booking.customerName].lastBooking = booking.startDate;
      }
      acc[booking.customerName].avgBookingValue = acc[booking.customerName].totalSpent / acc[booking.customerName].bookings;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(customerData)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }, [bookings]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-80">
          <TabsList className="grid w-full grid-cols-2 h-10">
            <TabsTrigger value="operations" className="flex items-center gap-2 text-sm">
              <Bus className="h-3 w-3" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2 text-sm">
              <DollarSign className="h-3 w-3" />
              Revenue
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md p-1 w-32">
            <Button
              variant={filterType === 'year' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('year')}
              className="h-8 w-14 px-2 text-xs"
            >
              Year
            </Button>
            <Button
              variant={filterType === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('month')}
              className="h-8 w-16 px-2 text-xs"
            >
              Month
            </Button>
          </div>
          {filterType === 'year' ? (
            <YearPicker selectedYear={selectedYear} onYearSelect={setSelectedYear} />
          ) : (
            <Select value={selectedMonth?.toString() || ''} onValueChange={(value) => setSelectedMonth(value ? parseInt(value) : null)}>
              <SelectTrigger className="w-32 h-10 text-sm">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsContent value="operations" className="space-y-6">
          {/* Operations Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{operationsMetrics.totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  {operationsMetrics.activeBookings} active, {operationsMetrics.completedBookings} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
                <Bus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{operationsMetrics.fleetUtilization}%</div>
                <p className="text-xs text-muted-foreground">
                  Completion rate: {operationsMetrics.completionRate}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Trip Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{operationsMetrics.avgTripDuration} days</div>
                <p className="text-xs text-muted-foreground">Average across all bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{operationsMetrics.maintenanceScheduled}</div>
                <p className="text-xs text-muted-foreground">
                  {operationsMetrics.maintenanceCompleted} completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Operations Fleet Performance Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fleet Operations Performance</CardTitle>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-9 px-3 justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-muted-foreground" />
                          {selectedBuses.length > 0 && (
                            <div className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                              {selectedBuses.length}
                            </div>
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-38 p-0">
                      <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                        {allBusIds.map((busId) => (
                          <div key={busId} className="flex items-center space-x-2">
                            <Checkbox
                              id={`ops-${busId}`}
                              checked={selectedBuses.includes(busId)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedBuses([...selectedBuses, busId]);
                                } else {
                                  setSelectedBuses(selectedBuses.filter(id => id !== busId));
                                }
                              }}
                            />
                            <label htmlFor={`ops-${busId}`} className="text-sm">{busId}</label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Select value={sortField} onValueChange={setSortField}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bookings">Bookings</SelectItem>
                      <SelectItem value="totalKm">Distance</SelectItem>
                      <SelectItem value="utilization">Utilization</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bus ID</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Total KM</TableHead>
                    <TableHead>Avg Duration</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operationsFleetPerformance.slice(0, 10).map((bus) => (
                    <TableRow key={bus.busId}>
                      <TableCell className="font-medium">{bus.busId}</TableCell>
                      <TableCell>{bus.bookings}</TableCell>
                      <TableCell>{bus.totalKm.toLocaleString()} km</TableCell>
                      <TableCell>{bus.avgTripDuration.toFixed(1)} days</TableCell>
                      <TableCell>{bus.utilization.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge variant="default">{bus.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-semibold bg-muted/50">
                    <TableCell className="font-bold">TOTAL</TableCell>
                    <TableCell className="font-bold">{operationsTotals.totalBookings}</TableCell>
                    <TableCell className="font-bold">{operationsTotals.totalKm.toLocaleString()} km</TableCell>
                    <TableCell className="font-bold">{(operationsTotals.avgDuration / operationsFleetPerformance.length || 0).toFixed(1)} days</TableCell>
                    <TableCell className="font-bold">{(operationsTotals.avgUtilization / operationsFleetPerformance.length || 0).toFixed(1)}%</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Operations Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Operations Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ bookings: { label: "Bookings", color: "hsl(var(--chart-1))" } }} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip 
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) => {
                              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                              const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(value);
                              return monthIndex !== -1 ? monthNames[monthIndex] : value;
                            }}
                            formatter={(value, name, props) => {
                              const config = {
                                bookings: { label: "Bookings", color: "hsl(var(--chart-1))" }
                              };
                              const item = config[name as keyof typeof config];
                              return (
                                <div className="flex min-w-[130px] items-center text-xs gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: props.color }}></div>
                                  <div className="text-muted-foreground">
                                    {item?.label || name}
                                  </div>
                                  <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                    {Number(value).toLocaleString()}
                                  </div>
                                </div>
                              );
                            }}
                          />
                        }
                      />
                      <Area dataKey="bookings" stroke="var(--color-bookings)" fill="var(--color-bookings)" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerAnalytics.slice(0, 5).map((customer) => (
                    <div key={customer.name} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.bookings} {customer.bookings === 1 ? 'booking' : 'bookings'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{customer.totalSpent.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Avg: ₹{customer.avgBookingValue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{revenueMetrics.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  This month: ₹{revenueMetrics.monthlyRevenue.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Number(revenueMetrics.netProfit) < 0 ? `-₹${Math.abs(Number(revenueMetrics.netProfit)).toLocaleString()}` : `₹${Number(revenueMetrics.netProfit).toLocaleString()}`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Margin: {revenueMetrics.profitMargin}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{revenueMetrics.pendingPayments.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Booking Value</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{revenueMetrics.avgBookingValue.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Fleet Performance Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fleet Revenue Performance</CardTitle>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-9 px-3 justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-muted-foreground" />
                          {revenueSelectedBuses.length > 0 && (
                            <div className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                              {revenueSelectedBuses.length}
                            </div>
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-38 p-0">
                      <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                        {allBusIds.map((busId) => (
                          <div key={busId} className="flex items-center space-x-2">
                            <Checkbox
                              id={`rev-${busId}`}
                              checked={revenueSelectedBuses.includes(busId)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setRevenueSelectedBuses([...revenueSelectedBuses, busId]);
                                } else {
                                  setRevenueSelectedBuses(revenueSelectedBuses.filter(id => id !== busId));
                                }
                              }}
                            />
                            <label htmlFor={`rev-${busId}`} className="text-sm">{busId}</label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Select value={revenueSortField} onValueChange={setRevenueSortField}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="avgBookingValue">Avg Value</SelectItem>
                      <SelectItem value="pendingPayment">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRevenueSortOrder(revenueSortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {revenueSortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bus ID</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Avg Booking Value</TableHead>
                    <TableHead>Advance Received</TableHead>
                    <TableHead>Pending Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueFleetPerformance.slice(0, 10).map((bus) => (
                    <TableRow key={bus.busId}>
                      <TableCell className="font-medium">{bus.busId}</TableCell>
                      <TableCell>{bus.bookings}</TableCell>
                      <TableCell>₹{bus.revenue.toLocaleString()}</TableCell>
                      <TableCell>₹{bus.avgBookingValue.toLocaleString()}</TableCell>
                      <TableCell>₹{bus.totalAdvance.toLocaleString()}</TableCell>
                      <TableCell>₹{bus.pendingPayment.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-semibold bg-muted/50">
                    <TableCell className="font-bold">TOTAL</TableCell>
                    <TableCell className="font-bold">{revenueTotals.totalBookings}</TableCell>
                    <TableCell className="font-bold">₹{revenueTotals.totalRevenue.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">₹{(revenueTotals.totalRevenue / revenueTotals.totalBookings || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-bold">₹{revenueTotals.totalAdvance.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">₹{revenueTotals.totalPending.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Revenue Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Revenue vs Costs</CardTitle>
                  <div className="flex items-center border rounded-md p-1">
                    <Button
                      variant={revenueChartView === 'current' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setRevenueChartView('current')}
                      className="h-8 px-3 text-xs"
                    >
                      Current Year
                    </Button>
                    <Button
                      variant={revenueChartView === 'comparison' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setRevenueChartView('comparison')}
                      className="h-8 px-3 text-xs"
                    >
                      Year Comparison
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {revenueChartView === 'current' ? (
                  <ChartContainer config={{
                    revenue: { label: "Revenue", color: "#10b981" },
                    maintenanceCost: { label: "Costs", color: "#ef4444" },
                    profit: { label: "Profit", color: "#3b82f6" }
                  }} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                        <ChartTooltip 
                          content={
                            <ChartTooltipContent
                              labelFormatter={(value) => {
                                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(value);
                                return monthIndex !== -1 ? monthNames[monthIndex] : value;
                              }}
                              formatter={(value, name, props) => {
                                const config = {
                                  revenue: { label: "Revenue", color: "#10b981" },
                                  maintenanceCost: { label: "Costs", color: "#ef4444" },
                                  profit: { label: "Profit", color: "#3b82f6" }
                                };
                                const item = config[name as keyof typeof config];
                                return (
                                  <div className="flex min-w-[130px] items-center text-xs gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item?.color || props.color }}></div>
                                    <div className="text-muted-foreground">
                                      {item?.label || name}
                                    </div>
                                    <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                      {Number(value) < 0 ? `-₹${Math.abs(Number(value)).toLocaleString()}` : `₹${Number(value).toLocaleString()}`}
                                    </div>
                                  </div>
                                );
                              }}
                            />
                          }
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                        <Line type="monotone" dataKey="maintenanceCost" stroke="var(--color-maintenanceCost)" strokeWidth={2} />
                        <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <ChartContainer config={{
                    revenue: { label: "Revenue", color: "#10b981" },
                    costs: { label: "Costs", color: "#ef4444" },
                    profit: { label: "Profit", color: "#3b82f6" }
                  }} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={yearlyComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                        <ChartTooltip 
                          content={
                            <ChartTooltipContent
                              formatter={(value, name, props) => {
                                const config = {
                                  revenue: { label: "Revenue", color: "#10b981" },
                                  costs: { label: "Costs", color: "#ef4444" },
                                  profit: { label: "Profit", color: "#3b82f6" }
                                };
                                const item = config[name as keyof typeof config];
                                return (
                                  <div className="flex min-w-[130px] items-center text-xs gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item?.color || props.color }}></div>
                                    <div className="text-muted-foreground">
                                      {item?.label || name}
                                    </div>
                                    <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                      {Number(value) < 0 ? `-₹${Math.abs(Number(value)).toLocaleString()}` : `₹${Number(value).toLocaleString()}`}
                                    </div>
                                  </div>
                                );
                              }}
                            />
                          }
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                        <Line type="monotone" dataKey="costs" stroke="var(--color-costs)" strokeWidth={2} />
                        <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--chart-1))" } }} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrends}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                      <ChartTooltip 
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) => {
                              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                              const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(value);
                              return monthIndex !== -1 ? monthNames[monthIndex] : value;
                            }}
                            formatter={(value, name, props) => {
                              const config = {
                                revenue: { label: "Revenue", color: "hsl(var(--chart-1))" }
                              };
                              const item = config[name as keyof typeof config];
                              return (
                                <div className="flex min-w-[130px] items-center text-xs gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: props.color }}></div>
                                  <div className="text-muted-foreground">
                                    {item?.label || name}
                                  </div>
                                  <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                    {Number(value) < 0 ? `-₹${Math.abs(Number(value)).toLocaleString()}` : `₹${Number(value).toLocaleString()}`}
                                  </div>
                                </div>
                              );
                            }}
                          />
                        }
                      />
                      <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}