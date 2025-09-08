import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { Pen } from 'lucide-react';
import { format } from 'date-fns';
import { Maintenance } from '@/types';
import { updateMaintenance, getVehicles } from '@/lib/notion';
import { MAINTENANCE_TYPES } from '@/lib/constants';

interface MaintenanceModalProps {
  maintenance: Maintenance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMaintenanceUpdated: () => void;
}



export function MaintenanceModal({ maintenance, open, onOpenChange, onMaintenanceUpdated }: MaintenanceModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    busId: '',
    type: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const loadVehicles = async () => {
      const vehicleData = await getVehicles();
      setVehicles(vehicleData);
    };
    if (open && isEditing) loadVehicles();
  }, [open, isEditing]);

  useEffect(() => {
    if (maintenance) {
      setFormData({
        busId: maintenance.busId,
        type: maintenance.type,
        description: maintenance.description,
        startDate: maintenance.startDate.toISOString().split('T')[0],
        endDate: maintenance.endDate.toISOString().split('T')[0],
      });
    }
    if (maintenance && open) {
      setIsEditing(false);
    }
  }, [maintenance, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenance) return;
    
    setLoading(true);
    try {
      await updateMaintenance(maintenance.id, {
        busId: formData.busId,
        type: formData.type,
        description: formData.description,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      });
      onMaintenanceUpdated();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!maintenance) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Maintenance Details</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Vehicle</Label>
            {isEditing ? (
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
            ) : (
              <Input value={maintenance.busNumber || maintenance.busId} readOnly className="bg-muted" />
            )}
          </div>

          <div>
            <Label>Maintenance Type</Label>
            {isEditing ? (
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
            ) : (
              <Input value={maintenance.type} readOnly className="bg-muted" />
            )}
          </div>

          <div>
            <Label>Description</Label>
            {isEditing ? (
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add Notes"
                className="focus-visible:ring-1 focus-visible:ring-primary/20"
                required
              />
            ) : (
              <Input value={maintenance.description} readOnly className="bg-muted" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              {isEditing ? (
                <DatePicker
                  value={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                />
              ) : (
                <Input value={format(new Date(maintenance.startDate), "MMMM d, yyyy")} readOnly className="bg-muted" />
              )}
            </div>
            <div>
              <Label>End Date</Label>
              {isEditing ? (
                <DatePicker
                  value={formData.endDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                />
              ) : (
                <Input value={format(new Date(maintenance.endDate), "MMMM d, yyyy")} readOnly className="bg-muted" />
              )}
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Input value={maintenance.status} readOnly className="bg-muted capitalize" />
          </div>

          {isEditing ? (
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Updating...' : 'Update Maintenance'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="w-full bg-primary shadow hover:bg-primary/90 text-white"
              onClick={() => setIsEditing(true)}
            >
              <Pen className="h-4 w-4" />
              Edit
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}