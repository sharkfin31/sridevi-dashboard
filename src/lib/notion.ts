import { Booking, Maintenance, Vehicle } from '@/types';
import {
  createBookingProperties,
  createMaintenanceProperties,
  parseBookingFromNotion,
  parseMaintenanceFromNotion,
  parseVehicleFromNotion
} from './notion-schemas';
import { authManager } from './auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const BOOKINGS_DB_ID = import.meta.env.VITE_NOTION_BOOKINGS_DB_ID || '';
const MAINTENANCE_DB_ID = import.meta.env.VITE_NOTION_MAINTENANCE_DB_ID || '';
const VEHICLES_DB_ID = import.meta.env.VITE_NOTION_BUSES_DB_ID || '';

async function queryDatabase(databaseId: string) {
  const response = await fetch(`${BACKEND_URL}/api/databases/${databaseId}/query`, {
    method: 'POST',
    headers: authManager.getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error(`Database query failed: ${response.status}`);
  }
  
  return await response.json();
}

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const response = await queryDatabase(VEHICLES_DB_ID);
    return response.results.map(parseVehicleFromNotion);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
}

export async function getBookings(): Promise<Booking[]> {
  try {
    const [bookingsResponse, vehiclesResponse] = await Promise.all([
      queryDatabase(BOOKINGS_DB_ID),
      queryDatabase(VEHICLES_DB_ID)
    ]);

    if (!bookingsResponse?.results) return [];
    
    const vehiclesMap = new Map();
    vehiclesResponse?.results?.forEach((v: any) => {
      const busNumber = v.properties.BusNumber?.title?.[0]?.text?.content || v.properties.Name?.title?.[0]?.text?.content || 'Unknown';
      vehiclesMap.set(v.id, busNumber);
    });

    const bookings = bookingsResponse.results.map((page: any) => {
      const booking = parseBookingFromNotion(page);
      const vehicleIds = page.properties.Vehicle?.relation?.map((rel: any) => rel.id) || [];
      const vehicleNumbers = vehicleIds.map((id: string) => vehiclesMap.get(id)).filter(Boolean);
      
      return {
        ...booking,
        busId: vehicleIds.length > 1 ? vehicleIds : (vehicleIds[0] || 'Unknown'),
        busNumber: vehicleNumbers.length > 1 ? vehicleNumbers : (vehicleNumbers[0] || 'Unknown'),
      };
    });
    
    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

export async function getMaintenance(): Promise<Maintenance[]> {
  try {
    const [maintenanceResponse, vehiclesResponse] = await Promise.all([
      queryDatabase(MAINTENANCE_DB_ID),
      queryDatabase(VEHICLES_DB_ID)
    ]);

    const vehiclesMap = new Map(vehiclesResponse.results.map((v: any) => [
      v.id, 
      v.properties.BusNumber?.title?.[0]?.text?.content || v.properties.Name?.title?.[0]?.text?.content || 'Unknown'
    ]));

    const maintenance = maintenanceResponse.results.map((page: any) => {
      const maintenanceData = parseMaintenanceFromNotion(page);
      return {
        ...maintenanceData,
        busNumber: vehiclesMap.get(maintenanceData.busId) || 'Unknown',
      };
    });
    return maintenance;
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    return [];
  }
}

export async function createBooking(booking: Omit<Booking, 'id'>): Promise<void> {
  try {
    const properties = createBookingProperties({
      customerName: booking.customerName,
      busId: booking.busId,
      customerPhone: booking.customerPhone,
      customerAddress: booking.customerAddress,
      destination: booking.destination,
      startDate: booking.startDate,
      endDate: booking.endDate,
      amount: booking.amount,
      advance: booking.advance,
      notes: booking.notes,
      totalKilometers: booking.totalKilometers,
      startOdoReading: booking.startOdoReading,
      endOdoReading: booking.endOdoReading,
      status: booking.status,
    });

    await fetch(`${BACKEND_URL}/api/pages`, {
      method: 'POST',
      headers: authManager.getAuthHeaders(),
      body: JSON.stringify({
        parent: { database_id: BOOKINGS_DB_ID },
        properties,
      })
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

export async function createMaintenance(maintenance: Omit<Maintenance, 'id'>): Promise<void> {
  try {
    const properties = createMaintenanceProperties({
      busId: maintenance.busId,
      type: maintenance.type,
      description: maintenance.description,
      startDate: maintenance.startDate,
      endDate: maintenance.endDate,
      cost: maintenance.cost,
      status: maintenance.status,
      mileage: maintenance.mileage,
      invoice: maintenance.invoice,
      galleries: maintenance.galleries,
      contacts: maintenance.contacts,
      name: maintenance.name,
    });

    await fetch(`${BACKEND_URL}/api/pages`, {
      method: 'POST',
      headers: authManager.getAuthHeaders(),
      body: JSON.stringify({
        parent: { database_id: MAINTENANCE_DB_ID },
        properties,
      })
    });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    throw error;
  }
}

export async function updateBooking(id: string, booking: Partial<Booking>): Promise<void> {
  try {
    const updateData: any = {};
    
    if (booking.customerName) updateData.customerName = booking.customerName;
    if (booking.busId) updateData.busId = booking.busId;
    if (booking.customerPhone) updateData.customerPhone = booking.customerPhone;
    if (booking.customerAddress) updateData.customerAddress = booking.customerAddress;
    if (booking.destination) updateData.destination = booking.destination;
    if (booking.startDate) updateData.startDate = booking.startDate;
    if (booking.endDate) updateData.endDate = booking.endDate;
    if (booking.amount !== undefined) updateData.amount = booking.amount;
    if (booking.advance !== undefined) updateData.advance = booking.advance;
    if (booking.notes) updateData.notes = booking.notes;
    if (booking.totalKilometers !== undefined) updateData.totalKilometers = booking.totalKilometers;
    if (booking.startOdoReading !== undefined) updateData.startOdoReading = booking.startOdoReading;
    if (booking.endOdoReading !== undefined) updateData.endOdoReading = booking.endOdoReading;
    if (booking.status) updateData.status = booking.status;

    const properties = createBookingProperties(updateData);

    await fetch(`${BACKEND_URL}/api/pages/${id}`, {
      method: 'PATCH',
      headers: authManager.getAuthHeaders(),
      body: JSON.stringify({ properties })
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
}

export async function updateMaintenance(id: string, maintenance: Partial<Maintenance>): Promise<void> {
  try {
    const updateData: any = {};
    
    if (maintenance.busId) updateData.busId = maintenance.busId;
    if (maintenance.type) updateData.type = maintenance.type;
    if (maintenance.description) updateData.description = maintenance.description;
    if (maintenance.startDate) updateData.startDate = maintenance.startDate;
    if (maintenance.endDate) updateData.endDate = maintenance.endDate;
    if (maintenance.cost !== undefined) updateData.cost = maintenance.cost;
    if (maintenance.status) updateData.status = maintenance.status;
    if (maintenance.mileage !== undefined) updateData.mileage = maintenance.mileage;
    if (maintenance.invoice) updateData.invoice = maintenance.invoice;
    if (maintenance.galleries) updateData.galleries = maintenance.galleries;
    if (maintenance.contacts) updateData.contacts = maintenance.contacts;
    if (maintenance.name) updateData.name = maintenance.name;

    const properties = createMaintenanceProperties(updateData);

    await fetch(`${BACKEND_URL}/api/pages/${id}`, {
      method: 'PATCH',
      headers: authManager.getAuthHeaders(),
      body: JSON.stringify({ properties })
    });
  } catch (error) {
    console.error('Error updating maintenance:', error);
    throw error;
  }
}