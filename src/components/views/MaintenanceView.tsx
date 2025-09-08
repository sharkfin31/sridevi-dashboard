import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Search, Filter, Wrench, Clock, CalendarIcon, X } from 'lucide-react';
import { Maintenance } from '@/types';
import { MaintenanceModal } from '@/components/modals/MaintenanceModal';
import { updateMaintenance } from '@/lib/notion';

interface MaintenanceViewProps {
  maintenance: Maintenance[];
  onMaintenanceUpdated?: () => void;
}

export function MaintenanceView({ maintenance, onMaintenanceUpdated }: MaintenanceViewProps) {
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const itemsPerPage = 10;

  const filteredMaintenance = maintenance.filter((item) => {
    const matchesSearch =
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.busId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    let matchesDate = true;
    if (dateRange && (dateRange.from || dateRange.to) && item.startDate) {
      try {
        const itemDate = new Date(item.startDate);
        if (dateRange.from && dateRange.to) {
          matchesDate = itemDate >= dateRange.from && itemDate <= dateRange.to;
        } else if (dateRange.from) {
          matchesDate = itemDate >= dateRange.from;
        } else if (dateRange.to) {
          matchesDate = itemDate <= dateRange.to;
        }
      } catch {
        matchesDate = false;
      }
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleStatusUpdate = async (maintenanceId: string, newStatus: string) => {
    try {
      await updateMaintenance(maintenanceId, { status: newStatus as any });
      onMaintenanceUpdated?.();
      setEditingStatus(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const totalPages = Math.ceil(filteredMaintenance.length / itemsPerPage);
  const paginatedMaintenance = filteredMaintenance.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const maintenanceStats = {
    total: maintenance.length,
    scheduled: maintenance.filter((m) => m.status === 'scheduled').length,
    inProgress: maintenance.filter((m) => m.status === 'in-progress').length,
    completed: maintenance.filter((m) => m.status === 'done').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceStats.total}</div>
            <p className="text-xs text-muted-foreground">All maintenance records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceStats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Upcoming tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceStats.completed}</div>
            <p className="text-xs text-muted-foreground">Finished tasks</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by type, bus ID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[150px] justify-start text-left font-normal", !(dateRange?.from || dateRange?.to) && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {(dateRange?.from || dateRange?.to) ? "Filter active" : "Date range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="p-3">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    initialFocus
                  />
                  {(dateRange?.from || dateRange?.to) && (
                    <div className="flex justify-center mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDateRange(undefined)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear Filter
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Service Dates</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMaintenance.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedMaintenance(item)}
                  >
                    <TableCell className="font-medium">{item.busNumber || item.busId}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>₹{item.cost.toLocaleString()}</TableCell>
                    <TableCell>{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {editingStatus === item.id ? (
                        <Select value={item.status} onValueChange={(value) => handleStatusUpdate(item.id, value)}>
                          <SelectTrigger className="w-32 h-6">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge 
                          className={
                            item.status === 'done' ? 'bg-green-100 text-green-800 border-green-200 cursor-pointer' :
                            item.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200 cursor-pointer' :
                            'bg-gray-100 text-gray-800 border-gray-200 cursor-pointer'
                          }
                          onClick={() => setEditingStatus(item.id)}
                        >
                          {item.status === 'in-progress' ? 'In Progress' :
                           item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {paginatedMaintenance.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No maintenance records found</p>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMaintenance.length)} of {filteredMaintenance.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <MaintenanceModal
        maintenance={selectedMaintenance}
        open={!!selectedMaintenance}
        onOpenChange={(open) => !open && setSelectedMaintenance(null)}
        onMaintenanceUpdated={() => {
          onMaintenanceUpdated?.();
        }}
      />
    </div>
  );
}