export interface Vehicle {
  id: string;
  busNumber: string;
  capacity: number;
  status: 'available' | 'confirmed' | 'maintenance';
}

export interface Bus {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'confirmed' | 'maintenance';
}

export interface Booking {
  id: string;
  busId: string | string[];
  busNumber?: string | string[];
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  advance: number;
  balance: number;
  notes?: string;
  totalKilometers?: number;
  startOdoReading?: number;
  endOdoReading?: number;
  status: 'Confirmed' | 'In Tour' | 'Pending Payment' | 'Complete';
}

export interface Maintenance {
  id: string;
  busId: string;
  busNumber?: string;
  type: string;
  description: string;
  startDate: Date;
  endDate: Date;
  cost: number;
  status: 'Pending' | 'In Progress' | 'Done';
  mileage?: number | null;
  galleries?: string[];
  invoice?: string;
  contacts?: string[];
  name?: string;
  scheduledDate?: Date;
  estimatedDuration?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'maintenance';
  data: Booking | Maintenance;
}