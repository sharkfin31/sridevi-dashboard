import { Booking, Maintenance } from '@/types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const BOOKINGS_DB_ID = import.meta.env.VITE_NOTION_BOOKINGS_DB_ID || '';
const MAINTENANCE_DB_ID = import.meta.env.VITE_NOTION_MAINTENANCE_DB_ID || '';

async function queryDatabase(databaseId: string) {
  const response = await fetch(`${BACKEND_URL}/api/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export async function getBookings(): Promise<Booking[]> {
  try {
    const response = await queryDatabase(BOOKINGS_DB_ID);
    
    if (!response || !response.results) {
      console.error('Invalid response:', response);
      return [];
    }

    return response.results.map((page: any) => ({
      id: page.id,
      busId: page.properties.Vehicle?.relation?.[0]?.id || 'Unknown',
      customerName: page.properties.Contact?.title?.[0]?.text?.content || 'Unknown',
      customerPhone: page.properties.Advance?.number?.toString() || '',
      destination: page.properties['Company/Org/Person']?.rich_text?.[0]?.text?.content || 'Unknown',
      startDate: new Date(page.properties.Dates?.date?.start || ''),
      endDate: new Date(page.properties.Dates?.date?.end || page.properties.Dates?.date?.start || ''),
      amount: page.properties.Amount?.number || 0,
      status: 'confirmed',
    }));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

export async function getMaintenance(): Promise<Maintenance[]> {
  try {
    const response = await queryDatabase(MAINTENANCE_DB_ID);
    
    if (!response || !response.results) {
      console.error('Invalid response:', response);
      return [];
    }

    return response.results.map((page: any) => ({
      id: page.id,
      busId: page.properties.Vehicle?.relation?.[0]?.id || 'Unknown',
      type: page.properties['Service Type']?.multi_select?.map((item: any) => item.name).join(', ') || 'General Service',
      description: page.properties.Notes?.rich_text?.[0]?.text?.content || page.properties.Name?.title?.[0]?.text?.content || '',
      scheduledDate: new Date(page.properties['Service Date']?.date?.start || ''),
      estimatedDuration: 2,
      status: page.properties['Service Status']?.status?.name || 'scheduled',
    }));
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    return [];
  }
}

export async function createBooking(booking: Omit<Booking, 'id'>): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: BOOKINGS_DB_ID },
        properties: {
          CustomerName: { title: [{ text: { content: booking.customerName } }] },
          BusId: { rich_text: [{ text: { content: booking.busId } }] },
          CustomerPhone: { phone_number: booking.customerPhone },
          Destination: { rich_text: [{ text: { content: booking.destination } }] },
          StartDate: { date: { start: booking.startDate.toISOString().split('T')[0] } },
          EndDate: { date: { start: booking.endDate.toISOString().split('T')[0] } },
          Amount: { number: booking.amount },
          Status: { select: { name: booking.status } },
        },
      })
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

export async function createMaintenance(maintenance: Omit<Maintenance, 'id'>): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: MAINTENANCE_DB_ID },
        properties: {
          Notes: { rich_text: [{ text: { content: maintenance.description || '' } }] },
          Mileage: { number: maintenance.mileage ?? null },
          'Service Date': { date: { start: maintenance.scheduledDate?.toISOString().split('T')[0] || null } },
          Cost: { number: maintenance.estimatedDuration ?? null },
          Galleries: { relation: maintenance.galleries?.map((id: string) => ({ id })) || [] },
          'Service Invoice': { rich_text: [{ text: { content: maintenance.invoice || '' } }] },
          Contacts: { relation: maintenance.contacts?.map((id: string) => ({ id })) || [] },
          Vehicle: { relation: maintenance.busId ? [{ id: maintenance.busId }] : [] },
          'Service Type': { multi_select: maintenance.type?.split(',').map((t: string) => ({ name: t.trim() })) || [] },
          'Service Status': { status: { name: maintenance.status || 'scheduled' } },
          Name: { title: [{ text: { content: maintenance.name || '' } }] },
        },
      })
    });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    throw error;
  }
}