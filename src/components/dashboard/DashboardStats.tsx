import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Calendar, Wrench, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsProps {
  totalBookings: number;
  activeBookings: number;
  maintenanceScheduled: number;
  totalRevenue: number;
  bookingsChange?: string;
  activeChange?: string;
  maintenanceChange?: string;
  revenueChange?: string;
  bookingsTrend?: 'up' | 'down';
  activeTrend?: 'up' | 'down';
  maintenanceTrend?: 'up' | 'down';
  revenueTrend?: 'up' | 'down';
}

export function DashboardStats({ 
  totalBookings, 
  activeBookings, 
  maintenanceScheduled, 
  totalRevenue, 
  bookingsChange,
  maintenanceChange,
  revenueChange,
  bookingsTrend,
  maintenanceTrend,
  revenueTrend
}: StatsProps) {
  const stats = [
    {
      title: 'This Month Bookings',
      value: totalBookings,
      icon: Calendar,
      description: 'Current month bookings',
      trend: bookingsChange || '+0% from last month',
      trendIcon: bookingsTrend === 'up' ? TrendingUp : TrendingDown,
      trendColor: bookingsTrend === 'up' ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Active Bookings',
      value: activeBookings,
      icon: Bus,
      description: 'Currently active',
      showTrend: false
    },
    {
      title: 'Maintenance Due',
      value: maintenanceScheduled,
      icon: Wrench,
      description: 'Scheduled maintenance',
      trend: maintenanceChange || '+0% from last month',
      trendIcon: maintenanceTrend === 'up' ? TrendingUp : TrendingDown,
      trendColor: maintenanceTrend === 'up' ? 'text-red-600' : 'text-green-600' // Reversed for maintenance
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: 'This month',
      trend: revenueChange || '+0% from last month',
      trendIcon: revenueTrend === 'up' ? TrendingUp : TrendingDown,
      trendColor: revenueTrend === 'up' ? 'text-green-600' : 'text-red-600'
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
          <CardContent className="relative">
            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
            {stat.showTrend !== false && stat.trendIcon && (
              <div className="absolute bottom-4 right-4 flex items-center gap-1">
                {React.createElement(stat.trendIcon, { className: `h-3 w-3 ${stat.trendColor}` })}
                <p className={`text-xs ${stat.trendColor}`}>{stat.trend}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}