import { Booking, Maintenance, Vehicle } from '@/types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const BOOKINGS_DB_ID = import.meta.env.VITE_NOTION_BOOKINGS_DB_ID || '';
const MAINTENANCE_DB_ID = import.meta.env.VITE_NOTION_MAINTENANCE_DB_ID || '';
const VEHICLES_DB_ID = import.meta.env.VITE_NOTION_BUSES_DB_ID || '';

console.log('🔧 Database IDs:', {
  BOOKINGS_DB_ID,
  MAINTENANCE_DB_ID,
  VEHICLES_DB_ID
});

async function queryDatabase(databaseId: string) {
  console.log(`🔍 Querying database: ${databaseId}`);
  const response = await fetch(`${BACKEND_URL}/api/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    console.error(`❌ Database query failed: ${response.status} ${response.statusText}`);
    throw new Error(`Database query failed: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`✅ Database query success for ${databaseId}:`, data);
  return data;
}

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const response = await queryDatabase(VEHICLES_DB_ID);
    
    console.log('🚌 Raw vehicles response:', response);
    
    return response.results.map((page: any) => {
      console.log('🚌 Processing vehicle:', {
        id: page.id,
        properties: page.properties,
        busNumber: page.properties.BusNumber?.title?.[0]?.text?.content
      });
      return {
        id: page.id,
        busNumber: page.properties.BusNumber?.title?.[0]?.text?.content || page.properties.Name?.title?.[0]?.text?.content || 'Unknown',
        capacity: page.properties.Capacity?.number || 0,
        status: page.properties.Status?.select?.name || 'available',
      };
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
}

export async function getBookings(): Promise<Booking[]> {
  try {
    console.log('🔍 Fetching bookings and vehicles...');
    const [bookingsResponse, vehiclesResponse] = await Promise.all([
      queryDatabase(BOOKINGS_DB_ID),
      queryDatabase(VEHICLES_DB_ID)
    ]);

    console.log('📊 Bookings response:', bookingsResponse);
    
    if (!bookingsResponse?.results) {
      console.error('❌ No bookings results found');
      return [];
    }
    
    if (!vehiclesResponse?.results) {
      console.warn('⚠️ No vehicles results found, using fallback');
    }
    
    const vehiclesMap = new Map();
    vehiclesResponse?.results?.forEach((v: any) => {
      const busNumber = v.properties.BusNumber?.title?.[0]?.text?.content || v.properties.Name?.title?.[0]?.text?.content || 'Unknown';
      vehiclesMap.set(v.id, busNumber);
    });

    const bookings = bookingsResponse.results.map((page: any) => {
      const vehicleId = page.properties.Vehicle?.relation?.[0]?.id;
      const busNumber = vehicleId ? vehiclesMap.get(vehicleId) : 'Unknown';
      const vehicleIds = page.properties.Vehicle?.relation?.map((rel: any) => rel.id) || [vehicleId];
      const vehicleNumbers = vehicleIds.map((id: string) => vehiclesMap.get(id)).filter(Boolean);
      
      return {
        id: page.id,
        busId: vehicleIds.length > 1 ? vehicleIds : (vehicleId || 'Unknown'),
        busNumber: vehicleNumbers.length > 1 ? vehicleNumbers : (busNumber || 'Unknown'),
        customerName: page.properties.Customer?.title?.[0]?.text?.content || page.properties.Contact?.title?.[0]?.text?.content || 'Unknown',
        customerPhone: page.properties.Phone?.phone_number || page.properties.Phone?.rich_text?.[0]?.text?.content || '',
        customerAddress: page.properties.Address?.rich_text?.[0]?.text?.content || '',
        destination: page.properties.Itinerary?.rich_text?.[0]?.text?.content || 'Unknown',
        startDate: new Date(page.properties.Dates?.date?.start || ''),
        endDate: new Date(page.properties.Dates?.date?.end || page.properties.Dates?.date?.start || ''),
        amount: page.properties.Total?.number || page.properties.Amount?.number || 0,
        advance: page.properties.Advance?.number || 0,
        balance: page.properties.Balance?.number || ((page.properties.Total?.number || page.properties.Amount?.number || 0) - (page.properties.Advance?.number || 0)),
        notes: page.properties.Notes?.rich_text?.[0]?.text?.content || '',
        totalKilometers: page.properties.TotalKm?.number || 0,
        startOdoReading: page.properties['Start Odo Reading']?.number || 0,
        endOdoReading: page.properties['End Odo Reading']?.number || 0,
        status: (page.properties.Status?.select?.name?.toLowerCase().replace(' ', '-') || 'confirmed') as 'confirmed' | 'in-tour' | 'pending-payment' | 'complete',
      };
    });
    
    console.log('✅ Processed bookings:', bookings);
    return bookings;
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    return [];
  }
}

export async function getMaintenance(): Promise<Maintenance[]> {
  try {
    const [maintenanceResponse, vehiclesResponse] = await Promise.all([
      queryDatabase(MAINTENANCE_DB_ID),
      queryDatabase(VEHICLES_DB_ID)
    ]);

    console.log('📊 Maintenance response:', maintenanceResponse);
    
    const vehiclesMap = new Map(vehiclesResponse.results.map((v: any) => [
      v.id, 
      v.properties.BusNumber?.title?.[0]?.text?.content || v.properties.Name?.title?.[0]?.text?.content || 'Unknown'
    ]));

    const maintenance = maintenanceResponse.results.map((page: any) => {
      const startDateStr = page.properties.Dates?.date?.start || page.properties['Service Dates']?.date?.start;
      const endDateStr = page.properties.Dates?.date?.end || page.properties['Service Dates']?.date?.end || startDateStr;
      
      return {
        id: page.id,
        busId: page.properties.Vehicle?.relation?.[0]?.id || 'Unknown',
        busNumber: vehiclesMap.get(page.properties.Vehicle?.relation?.[0]?.id) || 'Unknown',
        type: page.properties['Service Type']?.multi_select?.map((item: any) => item.name).join(', ') || 'General Service',
        description: page.properties.Details?.title?.[0]?.text?.content || '',
        cost: page.properties.Cost?.number || 0,
        startDate: startDateStr ? new Date(startDateStr) : new Date(),
        endDate: endDateStr ? new Date(endDateStr) : new Date(),
        status: (page.properties.Status?.select?.name?.toLowerCase().replace(' ', '-') || page.properties['Service Status']?.status?.name?.toLowerCase().replace(' ', '-') || 'scheduled') as 'scheduled' | 'in-progress' | 'done',
      };
    });
    console.log('✅ Processed maintenance:', maintenance);
    return maintenance;
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
          Customer: { title: [{ text: { content: booking.customerName } }] },
          Vehicle: { relation: Array.isArray(booking.busId) ? booking.busId.map(id => ({ id })) : (booking.busId ? [{ id: booking.busId }] : []) },
          Advance: { number: booking.advance || 0 },
          Address: { rich_text: [{ text: { content: booking.customerAddress || '' } }] },
          Itinerary: { rich_text: [{ text: { content: booking.destination } }] },
          Dates: { 
            date: { 
              start: booking.startDate.toISOString().split('T')[0],
              end: booking.endDate.toISOString().split('T')[0]
            } 
          },
          Total: { number: booking.amount },
          Notes: { rich_text: [{ text: { content: booking.notes || '' } }] },
          TotalKm: { number: booking.totalKilometers || 0 },
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
          Dates: { 
            date: { 
              start: maintenance.startDate.toISOString().split('T')[0],
              end: maintenance.endDate.toISOString().split('T')[0]
            } 
          },
          Cost: { number: maintenance.cost || 0 },
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

export async function updateBooking(id: string, booking: Partial<Booking>): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/pages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: {
          ...(booking.customerName && { Customer: { title: [{ text: { content: booking.customerName } }] } }),
          ...(booking.busId && { Vehicle: { relation: Array.isArray(booking.busId) ? booking.busId.map(id => ({ id })) : [{ id: booking.busId }] } }),
          ...(booking.advance !== undefined && { Advance: { number: booking.advance } }),
          ...(booking.customerAddress && { Address: { rich_text: [{ text: { content: booking.customerAddress } }] } }),
          ...(booking.destination && { Itinerary: { rich_text: [{ text: { content: booking.destination } }] } }),
          ...(booking.startDate && booking.endDate && {
            Dates: {
              date: {
                start: booking.startDate.toISOString().split('T')[0],
                end: booking.endDate.toISOString().split('T')[0]
              }
            }
          }),
          ...(booking.amount !== undefined && { Total: { number: booking.amount } }),
          ...(booking.notes && { Notes: { rich_text: [{ text: { content: booking.notes } }] } }),
          ...(booking.totalKilometers !== undefined && { TotalKm: { number: booking.totalKilometers } }),
          ...(booking.status && { Status: { select: { name: booking.status } } }),
        },
      })
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
}

export async function updateMaintenance(id: string, maintenance: Partial<Maintenance>): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/pages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: {
          ...(maintenance.description && { Notes: { rich_text: [{ text: { content: maintenance.description } }] } }),
          ...(maintenance.startDate && maintenance.endDate && {
            Dates: {
              date: {
                start: maintenance.startDate.toISOString().split('T')[0],
                end: maintenance.endDate.toISOString().split('T')[0]
              }
            }
          }),
          ...(maintenance.cost !== undefined && { Cost: { number: maintenance.cost } }),
          ...(maintenance.busId && { Vehicle: { relation: [{ id: maintenance.busId }] } }),
          ...(maintenance.type && { 'Service Type': { multi_select: maintenance.type.split(',').map((t: string) => ({ name: t.trim() })) } }),
          ...(maintenance.status && { 'Service Status': { status: { name: maintenance.status } } }),
          ...(maintenance.name && { Name: { title: [{ text: { content: maintenance.name } }] } }),
        },
      })
    });
  } catch (error) {
    console.error('Error updating maintenance:', error);
    throw error;
  }
}