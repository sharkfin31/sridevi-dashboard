// Notion Database Schemas
// These schemas define the exact property names and types for each Notion database

export interface NotionBookingProperties {
  Customer: { title: Array<{ text: { content: string } }> };
  Vehicle: { relation: Array<{ id: string }> };
  Phone: { phone_number: string };
  Address: { rich_text: Array<{ text: { content: string } }> };
  Itinerary: { rich_text: Array<{ text: { content: string } }> };
  Dates: { date: { start: string; end: string } };
  Total: { number: number };
  Advance: { number: number };
  Balance: { number: number };
  Notes: { rich_text: Array<{ text: { content: string } }> };
  Distance: { number: number };
  'Start Odo Reading': { number: number };
  'End Odo Reading': { number: number };
  Status: { select: { name: string } };
}

export interface NotionMaintenanceProperties {
  Vehicle: { relation: Array<{ id: string }> };
  'Service Type': { multi_select: Array<{ name: string }> };
  Details: { rich_text: Array<{ text: { content: string } }> };
  'Service Dates': { date: { start: string; end: string } };
  Cost: { number: number };
  'Service Status': { status: { name: string } };
  Notes: { rich_text: Array<{ text: { content: string } }> };
  Mileage: { number: number | null };
  'Service Invoice': { rich_text: Array<{ text: { content: string } }> };
  Galleries: { relation: Array<{ id: string }> };
  Contacts: { relation: Array<{ id: string }> };
  Name: { title: Array<{ text: { content: string } }> };
}

export interface NotionVehicleProperties {
  BusNumber: { title: Array<{ text: { content: string } }> };
  Capacity: { number: number };
  Status: { select: { name: string } };
}

// Helper functions to create properly formatted Notion properties
export const createBookingProperties = (booking: {
  customerName: string;
  busId: string | string[];
  customerPhone?: string;
  customerAddress?: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  advance: number;
  notes?: string;
  totalKilometers?: number;
  startOdoReading?: number;
  endOdoReading?: number;
  status?: string;
}): Partial<NotionBookingProperties> => ({
  Customer: { title: [{ text: { content: booking.customerName } }] },
  Vehicle: { 
    relation: Array.isArray(booking.busId) 
      ? booking.busId.map(id => ({ id })) 
      : booking.busId ? [{ id: booking.busId }] : []
  },
  ...(booking.customerPhone && { Phone: { phone_number: booking.customerPhone } }),
  ...(booking.customerAddress && { 
    Address: { rich_text: [{ text: { content: booking.customerAddress } }] }
  }),
  Itinerary: { rich_text: [{ text: { content: booking.destination } }] },
  Dates: {
    date: {
      start: booking.startDate.toISOString().split('T')[0],
      end: booking.endDate.toISOString().split('T')[0]
    }
  },
  Total: { number: booking.amount },
  Advance: { number: booking.advance },
  Balance: { number: booking.amount - booking.advance },
  ...(booking.notes && { Notes: { rich_text: [{ text: { content: booking.notes } }] } }),
  ...(booking.totalKilometers !== undefined && { Distance: { number: booking.totalKilometers } }),
  ...(booking.status && { Status: { select: { name: booking.status } } }),
});

export const createMaintenanceProperties = (maintenance: {
  busId: string;
  type: string;
  description: string;
  startDate: Date;
  endDate: Date;
  cost?: number;
  status?: string;
  mileage?: number | null;
  invoice?: string;
  galleries?: string[];
  contacts?: string[];
  name?: string;
}): Partial<NotionMaintenanceProperties> => ({
  Vehicle: { relation: [{ id: maintenance.busId }] },
  'Service Type': { 
    multi_select: maintenance.type.split(',').map(t => ({ name: t.trim() }))
  },
  Details: { rich_text: [{ text: { content: maintenance.description } }] },
  'Service Dates': {
    date: {
      start: maintenance.startDate.toISOString().split('T')[0],
      end: maintenance.endDate.toISOString().split('T')[0]
    }
  },
  ...(maintenance.cost !== undefined && { Cost: { number: maintenance.cost } }),
  ...(maintenance.status && { 'Service Status': { status: { name: maintenance.status } } }),
  ...(maintenance.mileage !== undefined && { Mileage: { number: maintenance.mileage } }),
  ...(maintenance.invoice && { 'Service Invoice': { rich_text: [{ text: { content: maintenance.invoice } }] } }),
  ...(maintenance.galleries && { Galleries: { relation: maintenance.galleries.map(id => ({ id })) } }),
  ...(maintenance.contacts && { Contacts: { relation: maintenance.contacts.map(id => ({ id })) } }),
  ...(maintenance.name && { Name: { title: [{ text: { content: maintenance.name } }] } }),
});

// Property parsers for reading from Notion
export const parseBookingFromNotion = (page: any) => ({
  id: page.id,
  customerName: page.properties.Customer?.title?.[0]?.text?.content || 'Unknown',
  customerPhone: page.properties.Phone?.phone_number || '',
  customerAddress: page.properties.Address?.rich_text?.[0]?.text?.content || '',
  destination: page.properties.Itinerary?.rich_text?.[0]?.text?.content || 'Unknown',
  startDate: new Date(page.properties.Dates?.date?.start || ''),
  endDate: new Date(page.properties.Dates?.date?.end || page.properties.Dates?.date?.start || ''),
  amount: page.properties.Total?.number || 0,
  advance: page.properties.Advance?.number || 0,
  balance: page.properties.Balance?.number || ((page.properties.Total?.number || 0) - (page.properties.Advance?.number || 0)),
  notes: page.properties.Notes?.rich_text?.[0]?.text?.content || '',
  totalKilometers: page.properties.Distance?.number || 0,
  startOdoReading: 0,
  endOdoReading: 0,
  status: (page.properties.Status?.select?.name || 'Confirmed') as 'Confirmed' | 'In Tour' | 'Pending Payment' | 'Complete',
  busId: page.properties.Vehicle?.relation?.[0]?.id || 'Unknown',
});

export const parseMaintenanceFromNotion = (page: any) => ({
  id: page.id,
  busId: page.properties.Vehicle?.relation?.[0]?.id || 'Unknown',
  type: page.properties['Service Type']?.multi_select?.map((item: any) => item.name).join(', ') || 'General Service',
  description: page.properties.Details?.rich_text?.[0]?.text?.content || '',
  startDate: new Date(page.properties['Service Dates']?.date?.start || ''),
  endDate: new Date(page.properties['Service Dates']?.date?.end || page.properties['Service Dates']?.date?.start || ''),
  cost: page.properties.Cost?.number || 0,
  status: (page.properties['Service Status']?.status?.name || 'Pending') as 'Pending' | 'In Progress' | 'Done',
  mileage: page.properties.Mileage?.number || null,
  invoice: page.properties['Service Invoice']?.rich_text?.[0]?.text?.content || '',
  name: page.properties.Name?.title?.[0]?.text?.content || '',
});

export const parseVehicleFromNotion = (page: any) => {
  // Try multiple possible property names for bus number
  const busNumber = page.properties.BusNumber?.title?.[0]?.text?.content ||
                   page.properties.Name?.title?.[0]?.text?.content ||
                   page.properties['Bus Number']?.title?.[0]?.text?.content ||
                   page.properties.Title?.title?.[0]?.text?.content ||
                   'Unknown';
  
  return {
    id: page.id,
    busNumber,
    capacity: page.properties.Capacity?.number || 0,
    status: page.properties.Status?.select?.name || 'available',
  };
};