import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MultiSelect } from '@/components/ui/multi-select';
import { CalendarIcon, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Booking } from '@/types';
import { createBooking, updateBooking } from '@/lib/notion';
import { ItineraryModal } from '../modals/ItineraryModal';

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated: () => void;
  editingBooking?: Booking | null;
}

import { getVehicles } from '@/lib/notion';

export function BookingForm({ open, onOpenChange, onBookingCreated, editingBooking }: BookingFormProps) {
  const [formData, setFormData] = useState({
    busId: '' as string | string[],
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    destination: '',
    startDate: '',
    endDate: '',
    amount: '',
    advance: '',
    notes: '',
    totalKilometers: '',
  });
  const [loading, setLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [itinerarySaved, setItinerarySaved] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  
  const balance = formData.amount && formData.advance ? 
    parseFloat(formData.amount) - parseFloat(formData.advance) : 0;

  useEffect(() => {
    const loadVehicles = async () => {
      const vehicleData = await getVehicles();
      setVehicles(vehicleData);
    };
    if (open) loadVehicles();
  }, [open]);

  useEffect(() => {
    if (editingBooking) {
      setFormData({
        busId: editingBooking.busId,
        customerName: editingBooking.customerName,
        customerPhone: editingBooking.customerPhone,
        customerAddress: editingBooking.customerAddress || '',
        destination: editingBooking.destination,
        startDate: editingBooking.startDate.toISOString().split('T')[0],
        endDate: editingBooking.endDate.toISOString().split('T')[0],
        amount: editingBooking.amount.toString(),
        advance: editingBooking.advance.toString(),
        notes: editingBooking.notes || '',
        totalKilometers: editingBooking.totalKilometers?.toString() || '',
      });
      setItinerarySaved(true);
    } else {
      setFormData({
        busId: '',
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        destination: '',
        startDate: '',
        endDate: '',
        amount: '',
        advance: '',
        notes: '',
        totalKilometers: '',
      });
      setItinerarySaved(false);
    }
  }, [editingBooking, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBooking) {
        await updateBooking(editingBooking.id, {
          busId: formData.busId,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerAddress: formData.customerAddress,
          destination: formData.destination,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          amount: parseFloat(formData.amount),
          advance: parseFloat(formData.advance),
          notes: formData.notes,
          totalKilometers: parseFloat(formData.totalKilometers) || 0,
        });
      } else {
        const booking: Omit<Booking, 'id'> = {
          busId: formData.busId,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerAddress: formData.customerAddress,
          destination: formData.destination,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          amount: parseFloat(formData.amount),
          advance: parseFloat(formData.advance),
          balance: balance,
          notes: formData.notes,
          totalKilometers: parseFloat(formData.totalKilometers) || 0,
          status: 'confirmed',
        };
        await createBooking(booking);
      }
      onBookingCreated();
      onOpenChange(false);
      setFormData({
        busId: '',
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        destination: '',
        startDate: '',
        endDate: '',
        amount: '',
        advance: '',
        notes: '',
        totalKilometers: '',
      });
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`transition-all duration-300 ${showItinerary ? 'max-w-[850px]' : 'max-w-[425px]'} p-0`}>
        <div className="flex">
          <div className="w-[425px] flex-shrink-0 p-6">
            <DialogHeader className="px-0 mb-6">
              <DialogTitle>{editingBooking ? 'Edit Booking' : 'New Booking'}</DialogTitle>
            </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Customer Name; Customer Phone Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="focus-visible:ring-1 focus-visible:ring-primary/20"
                required
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Customer Phone Number</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="focus-visible:ring-1 focus-visible:ring-primary/20"
                required
              />
            </div>
          </div>

          {/* Row 2: Customer Address; Itinerary */}
          <div>
            <Label htmlFor="customerAddress">Customer Address</Label>
            <Input
              id="customerAddress"
              value={formData.customerAddress}
              onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
              className="focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>

          {/* Row 3: Itinerary */}
          <div>
            <Label htmlFor="destination">Itinerary</Label>
            <Button
              type="button"
              variant="outline"
              className={cn("w-full justify-start text-left font-normal pl-3", !formData.destination && "text-muted-foreground")}
              onClick={() => setShowItinerary(true)}
            >
              <MapPin className="h-4 w-4" />
              {itinerarySaved ? "Itinerary saved" : formData.destination || "Plan Trip"}
            </Button>
            {formData.totalKilometers && parseFloat(formData.totalKilometers) > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Total: {formData.totalKilometers} km
              </p>
            )}
          </div>

          {/* Row 4: Start Date; End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal pl-3", !formData.startDate && "text-muted-foreground")}>
                    <CalendarIcon className="h-1 w-1" />
                    {formData.startDate ? format(new Date(formData.startDate), "MMMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal pl-3", !formData.endDate && "text-muted-foreground")}>
                    <CalendarIcon className="h-1 w-1" />
                    {formData.endDate ? format(new Date(formData.endDate), "MMMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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

          {/* Row 5: Vehicle Multiselect */}
          <div>
            <Label htmlFor="busId">Vehicles</Label>
            <MultiSelect
              options={vehicles.map(vehicle => ({
                label: `${vehicle.busNumber} (Capacity: ${vehicle.capacity})`,
                value: vehicle.id
              }))}
              onValueChange={(values) => {
                setFormData({ ...formData, busId: values.length === 1 ? values[0] : values });
              }}
              defaultValue={Array.isArray(formData.busId) ? formData.busId : [formData.busId].filter(Boolean)}
              placeholder="Select vehicles"
              maxCount={2}
            />
          </div>

          {/* Row 6: Total Amount; Advance; Balance */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="amount">Total Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="focus-visible:ring-1 focus-visible:ring-primary/20"
                required
              />
            </div>
            <div>
              <Label htmlFor="advance">Advance (₹)</Label>
              <Input
                id="advance"
                type="number"
                value={formData.advance}
                onChange={(e) => setFormData({ ...formData, advance: e.target.value })}
                className="focus-visible:ring-1 focus-visible:ring-primary/20"
                required
              />
            </div>
            <div>
              <Label htmlFor="balance">Balance (₹)</Label>
              <Input
                id="balance"
                type="number"
                value={balance}
                readOnly
                className="focus-visible:ring-1 focus-visible:ring-primary/20 bg-muted"
              />
            </div>
          </div>

          {/* Row 7: Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Any special requirements or notes"
            />
            </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (editingBooking ? 'Updating...' : 'Creating...') : (editingBooking ? 'Update Booking' : 'Create Booking')}
          </Button>
            </form>
          </div>
          
          {showItinerary && (
            <div className="w-[425px] flex-shrink-0 border-l border-border bg-muted/30 p-6">
              <ItineraryModal
                open={showItinerary}
                onOpenChange={setShowItinerary}
                onConfirm={(itinerary, totalKm) => {
                  setFormData({ 
                    ...formData, 
                    destination: itinerary,
                    totalKilometers: totalKm?.toString() || ''
                  });
                  setItinerarySaved(true);
                }}
                initialItinerary={formData.destination}
                initialKilometers={parseFloat(formData.totalKilometers) || 0}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}