import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MultiSelect } from '@/components/ui/multi-select';
import { CalendarIcon, MapPin, Pen } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Booking } from '@/types';
import { updateBooking, getVehicles } from '@/lib/notion';
import { ItineraryModal } from './ItineraryModal';

interface BookingModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingUpdated: () => void;
}

export function BookingModal({ booking, open, onOpenChange, onBookingUpdated }: BookingModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [itinerarySaved, setItinerarySaved] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
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
    status: 'confirmed' as 'confirmed' | 'in-tour' | 'pending-payment' | 'complete',
  });

  const balance = formData.amount && formData.advance ? 
    parseFloat(formData.amount) - parseFloat(formData.advance) : 0;

  useEffect(() => {
    const loadVehicles = async () => {
      const vehicleData = await getVehicles();
      setVehicles(vehicleData);
    };
    if (open && isEditing) loadVehicles();
  }, [open, isEditing]);

  useEffect(() => {
    if (booking) {
      setFormData({
        busId: booking.busId,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerAddress: booking.customerAddress || '',
        destination: booking.destination,
        startDate: booking.startDate.toISOString().split('T')[0],
        endDate: booking.endDate.toISOString().split('T')[0],
        amount: booking.amount.toString(),
        advance: booking.advance.toString(),
        notes: booking.notes || '',
        totalKilometers: booking.totalKilometers?.toString() || '',
        status: booking.status,
      });
      setItinerarySaved(true);
    }
    if (booking && open) {
      setIsEditing(false);
      setShowItinerary(false);
    }
  }, [booking, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    
    setLoading(true);
    try {
      await updateBooking(booking.id, {
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
        status: formData.status,
      });
      onBookingUpdated();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`transition-all duration-300 ${showItinerary && isEditing ? 'max-w-[850px]' : 'max-w-[425px]'} p-0`}>
        <div className="flex">
          <div className="w-[425px] flex-shrink-0 p-6">
            <DialogHeader className="px-0 mb-6">
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Customer Name; Customer Phone Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name</Label>
                  {isEditing ? (
                    <Input
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="focus-visible:ring-1 focus-visible:ring-primary/20"
                      required
                    />
                  ) : (
                    <Input value={booking.customerName} readOnly className="bg-muted" />
                  )}
                </div>
                <div>
                  <Label>Customer Phone Number</Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="focus-visible:ring-1 focus-visible:ring-primary/20"
                      required
                    />
                  ) : (
                    <Input value={booking.customerPhone} readOnly className="bg-muted" />
                  )}
                </div>
              </div>

              {/* Row 2: Customer Address; Itinerary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer Address</Label>
                  {isEditing ? (
                    <Input
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                      className="focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                  ) : (
                    <Input value={booking.customerAddress || ''} readOnly className="bg-muted" />
                  )}
                </div>
                <div>
                  <Label>Itinerary</Label>
                  {isEditing ? (
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal pl-3", !formData.destination && "text-muted-foreground")}
                      onClick={() => setShowItinerary(true)}
                    >
                      <MapPin className="h-4 w-4" />
                      {itinerarySaved ? "Itinerary saved" : formData.destination || "Plan Trip"}
                    </Button>
                  ) : (
                    <Input value={booking.destination} readOnly className="bg-muted" />
                  )}
                  {!isEditing && Boolean(booking.totalKilometers && booking.totalKilometers > 0) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Total: {booking.totalKilometers} km
                    </p>
                  )}
                  {isEditing && Boolean(formData.totalKilometers && parseFloat(formData.totalKilometers) > 0) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Total: {formData.totalKilometers} km
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Start Date; End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  {isEditing ? (
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
                  ) : (
                    <Input value={format(new Date(booking.startDate), "MMMM d, yyyy")} readOnly className="bg-muted" />
                  )}
                </div>
                <div>
                  <Label>End Date</Label>
                  {isEditing ? (
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
                  ) : (
                    <Input value={format(new Date(booking.endDate), "MMMM d, yyyy")} readOnly className="bg-muted" />
                  )}
                </div>
              </div>

              {/* Row 4: Vehicle Multiselect */}
              <div>
                <Label>Vehicle</Label>
                {isEditing ? (
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
                ) : (
                  <Input value={Array.isArray(booking.busNumber) ? booking.busNumber.join(', ') : (booking.busNumber || booking.busId)} readOnly className="bg-muted" />
                )}
              </div>

              {/* Row 5: Total Amount; Advance; Balance */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Total Amount (₹)</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="focus-visible:ring-1 focus-visible:ring-primary/20"
                      required
                    />
                  ) : (
                    <Input value={booking.amount.toLocaleString()} readOnly className="bg-muted" />
                  )}
                </div>
                <div>
                  <Label>Advance (₹)</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.advance}
                      onChange={(e) => setFormData({ ...formData, advance: e.target.value })}
                      className="focus-visible:ring-1 focus-visible:ring-primary/20"
                      required
                    />
                  ) : (
                    <Input value={booking.advance.toLocaleString()} readOnly className="bg-muted" />
                  )}
                </div>
                <div>
                  <Label>Balance (₹)</Label>
                  <Input
                    value={isEditing ? balance.toLocaleString() : booking.balance.toLocaleString()}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* Row 6: Additional Notes */}
              <div>
                <Label>Additional Notes</Label>
                {isEditing ? (
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder="Any special requirements or notes"
                  />
                ) : (
                  <div className="flex min-h-[70px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    <span className="whitespace-pre-wrap break-words">{booking.notes || ''}</span>
                  </div>
                )}
              </div>

              {/* Row 7: Status */}
              <div>
                <Label>Status</Label>
                {isEditing ? (
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in-tour">In Tour</SelectItem>
                      <SelectItem value="pending-payment">Pending Payment</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={booking.status === 'in-tour' ? 'In Tour' : booking.status === 'pending-payment' ? 'Pending Payment' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} readOnly className="bg-muted" />
                )}
              </div>

              {isEditing ? (
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Booking'}
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
          </div>
          
          {showItinerary && isEditing && (
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