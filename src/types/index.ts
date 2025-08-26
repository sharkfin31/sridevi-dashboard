export interface Bus {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'booked' | 'maintenance';
}

export interface Booking {
  id: string;
  busId: string;
  customerName: string;
  customerPhone: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface Maintenance {
  id: string;
  busId: string; // Vehicle relation
  type: string; // Service Type (multi_select)
  description: string; // Notes (rich_text)
  scheduledDate: Date; // Service Date (date)
  estimatedDuration: number; // Cost (number)
  status: 'scheduled' | 'in-progress' | 'completed'; // Service Status (status)
  mileage?: number | null; // Mileage (number)
  galleries?: string[]; // Galleries (relation)
  invoice?: string; // Service Invoice (rich_text)
  contacts?: string[]; // Contacts (relation)
  name?: string; // Name (title)
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'maintenance';
  data: Booking | Maintenance;
}