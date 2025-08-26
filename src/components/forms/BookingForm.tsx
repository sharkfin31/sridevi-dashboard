import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Booking } from '@/types';
import { createBooking } from '@/lib/notion';
import { ItineraryModal } from '../modals/ItineraryModal';

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated: () => void;
}

const buses = [
  { id: 'BUS001', number: 'KA-01-AB-1234', capacity: 45 },
  { id: 'BUS002', number: 'KA-01-CD-5678', capacity: 52 },
  { id: 'BUS003', number: 'KA-01-EF-9012', capacity: 40 },
];

export function BookingForm({ open, onOpenChange, onBookingCreated }: BookingFormProps) {
  const [formData, setFormData] = useState({
    busId: '',
    customerName: '',
    customerPhone: '',
    destination: '',
    startDate: '',
    endDate: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [itinerarySaved, setItinerarySaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const booking: Omit<Booking, 'id'> = {
        busId: formData.busId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        destination: formData.destination,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        amount: parseFloat(formData.amount),
        status: 'confirmed',
      };

      await createBooking(booking);
      onBookingCreated();
      onOpenChange(false);
      setFormData({
        busId: '',
        customerName: '',
        customerPhone: '',
        destination: '',
        startDate: '',
        endDate: '',
        amount: '',
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
              <DialogTitle>New Booking</DialogTitle>
            </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <Label htmlFor="busId">Bus</Label>
            <Select value={formData.busId} onValueChange={(value) => setFormData({ ...formData, busId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {buses.map((bus) => (
                  <SelectItem key={bus.id} value={bus.id}>
                    {bus.number} (Capacity: {bus.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="destination">Itinerary</Label>
            <Button
              type="button"
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !formData.destination && "text-muted-foreground")}
              onClick={() => setShowItinerary(true)}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {itinerarySaved ? "Itinerary saved" : formData.destination || "Plan Trip"}
            </Button>
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
            <Label htmlFor="advance">Advance Amount (₹)</Label>
            <Input
              id="advance"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="focus-visible:ring-1 focus-visible:ring-primary/20"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Booking'}
          </Button>
            </form>
          </div>
          
          {showItinerary && (
            <div className="w-[425px] flex-shrink-0 border-l border-border bg-muted/30 p-6">
              <ItineraryModal
                open={showItinerary}
                onOpenChange={setShowItinerary}
                onConfirm={(itinerary) => {
                  setFormData({ ...formData, destination: itinerary });
                  setItinerarySaved(true);
                }}
                initialItinerary={formData.destination}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}