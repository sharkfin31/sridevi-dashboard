import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Maintenance } from '@/types';
import { createMaintenance } from '@/lib/notion';

interface MaintenanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMaintenanceCreated: () => void;
}

const buses = [
  { id: 'BUS001', number: 'KA-01-AB-1234' },
  { id: 'BUS002', number: 'KA-01-CD-5678' },
  { id: 'BUS003', number: 'KA-01-EF-9012' },
];

const maintenanceTypes = [
  'Regular Service',
  'Oil Change',
  'Tire Replacement',
  'Brake Service',
  'Engine Repair',
  'AC Service',
  'Body Work',
];

export function MaintenanceForm({ open, onOpenChange, onMaintenanceCreated }: MaintenanceFormProps) {
  const [formData, setFormData] = useState({
    busId: '',
    type: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const maintenance: Omit<Maintenance, 'id'> = {
        busId: formData.busId,
        type: formData.type,
        description: formData.description,
        scheduledDate: new Date(formData.startDate),
        estimatedDuration: Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60)),
        status: 'scheduled',
      };

      await createMaintenance(maintenance);
      onMaintenanceCreated();
      onOpenChange(false);
      setFormData({
        busId: '',
        type: '',
        description: '',
        startDate: '',
        endDate: '',
      });
    } catch (error) {
      console.error('Error creating maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Maintenance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="busId">Bus</Label>
            <Select value={formData.busId} onValueChange={(value) => setFormData({ ...formData, busId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {buses.map((bus) => (
                  <SelectItem key={bus.id} value={bus.id}>
                    {bus.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Maintenance Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {maintenanceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add Notes"
              className="focus-visible:ring-1 focus-visible:ring-primary/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(new Date(formData.startDate), "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate ? new Date(formData.startDate + 'T00:00:00') : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                        setFormData({ ...formData, startDate: localDate.toISOString().split('T')[0] });
                      } else {
                        setFormData({ ...formData, startDate: "" });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(new Date(formData.endDate), "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate ? new Date(formData.endDate + 'T00:00:00') : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                        setFormData({ ...formData, endDate: localDate.toISOString().split('T')[0] });
                      } else {
                        setFormData({ ...formData, endDate: "" });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Maintenance'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}