import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarEvent, Booking, Maintenance } from '@/types';
import { format } from 'date-fns';

interface EventDetailsProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetails({ event, open, onOpenChange }: EventDetailsProps) {
  if (!event) return null;

  const isBooking = event.type === 'booking';
  const data = event.data as Booking | Maintenance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isBooking ? 'Booking Details' : 'Maintenance Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Bus ID</h4>
              <p>{data.busId}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
              <p className="capitalize">{data.status}</p>
            </div>
          </div>

          {isBooking && (
            <>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Customer Name</h4>
                <p>{(data as Booking).customerName}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Customer Phone</h4>
                <p>{(data as Booking).customerPhone}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Destination</h4>
                <p>{(data as Booking).destination}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Start Date</h4>
                  <p>{format(new Date((data as Booking).startDate), 'PPP')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">End Date</h4>
                  <p>{format(new Date((data as Booking).endDate), 'PPP')}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Amount</h4>
                <p>₹{(data as Booking).amount.toLocaleString()}</p>
              </div>
            </>
          )}

          {!isBooking && (
            <>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Maintenance Type</h4>
                <p>{(data as Maintenance).type}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Description</h4>
                <p>{(data as Maintenance).description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Scheduled Date</h4>
                  <p>{format(new Date((data as Maintenance).scheduledDate), 'PPP')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Duration</h4>
                  <p>{(data as Maintenance).estimatedDuration} hours</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}