import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { Maintenance } from '@/types';
import { createMaintenance, updateMaintenance, getVehicles } from '@/lib/notion';
import { MAINTENANCE_TYPES } from '@/lib/constants';

interface MaintenanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMaintenanceCreated: () => void;
  editingMaintenance?: Maintenance | null;
}

export function MaintenanceForm({ open, onOpenChange, onMaintenanceCreated, editingMaintenance }: MaintenanceFormProps) {
  const [formData, setFormData] = useState({
    busId: '',
    type: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (editingMaintenance) {
      setFormData({
        busId: editingMaintenance.busId,
        type: editingMaintenance.type,
        description: editingMaintenance.description,
        startDate: editingMaintenance.startDate.toISOString().split('T')[0],
        endDate: editingMaintenance.endDate.toISOString().split('T')[0],
      });
    } else {
      setFormData({
        busId: '',
        type: '',
        description: '',
        startDate: '',
        endDate: '',
      });
    }
  }, [editingMaintenance, open]);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    const loadVehicles = async () => {
      const vehicleData = await getVehicles();
      setVehicles(vehicleData);
    };
    if (open) loadVehicles();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingMaintenance) {
        await updateMaintenance(editingMaintenance.id, {
          busId: formData.busId,
          type: formData.type,
          description: formData.description,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
        });
      } else {
        const maintenance: Omit<Maintenance, 'id'> = {
          busId: formData.busId,
          type: formData.type,
          description: formData.description,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          cost: 0,
          status: 'scheduled',
        };
        await createMaintenance(maintenance);
      }
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
          <DialogTitle>{editingMaintenance ? 'Edit Maintenance' : 'Schedule Maintenance'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="busId">Bus</Label>
            <Select value={formData.busId} onValueChange={(value) => setFormData({ ...formData, busId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.busNumber} (Capacity: {vehicle.capacity})
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
                {MAINTENANCE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Add Notes"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker
                value={formData.startDate}
                onChange={(date) => setFormData({ ...formData, startDate: date })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <DatePicker
                value={formData.endDate}
                onChange={(date) => setFormData({ ...formData, endDate: date })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (editingMaintenance ? 'Updating...' : 'Scheduling...') : (editingMaintenance ? 'Update Maintenance' : 'Schedule Maintenance')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}