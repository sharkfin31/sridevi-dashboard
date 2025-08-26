import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Calendar, Wrench, DollarSign } from 'lucide-react';

interface StatsProps {
  totalBookings: number;
  activeBookings: number;
  maintenanceScheduled: number;
  totalRevenue: number;
}

export function DashboardStats({ totalBookings, activeBookings, maintenanceScheduled, totalRevenue }: StatsProps) {
  const stats = [
    {
      title: 'Total Bookings',
      value: totalBookings,
      icon: Calendar,
      description: 'All time bookings',
      trend: '+20.1% from last month'
    },
    {
      title: 'Active Bookings',
      value: activeBookings,
      icon: Bus,
      description: 'Currently active',
      trend: '+180.1% from last month'
    },
    {
      title: 'Maintenance Due',
      value: maintenanceScheduled,
      icon: Wrench,
      description: 'Scheduled maintenance',
      trend: '+19% from last month'
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: 'This month',
      trend: '+201 since last hour'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-lg border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}