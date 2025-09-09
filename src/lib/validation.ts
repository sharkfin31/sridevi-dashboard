// Validation utilities for Notion data
import { Booking, Maintenance } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateBooking(booking: Omit<Booking, 'id'>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!booking.customerName?.trim()) {
    errors.push({ field: 'customerName', message: 'Customer name is required' });
  }

  if (!booking.destination?.trim()) {
    errors.push({ field: 'destination', message: 'Destination is required' });
  }

  if (!booking.busId || (Array.isArray(booking.busId) && booking.busId.length === 0)) {
    errors.push({ field: 'busId', message: 'At least one vehicle must be selected' });
  }

  if (!booking.startDate || isNaN(booking.startDate.getTime())) {
    errors.push({ field: 'startDate', message: 'Valid start date is required' });
  }

  if (!booking.endDate || isNaN(booking.endDate.getTime())) {
    errors.push({ field: 'endDate', message: 'Valid end date is required' });
  }

  if (booking.startDate && booking.endDate && booking.startDate > booking.endDate) {
    errors.push({ field: 'endDate', message: 'End date must be after start date' });
  }

  if (booking.amount < 0) {
    errors.push({ field: 'amount', message: 'Amount cannot be negative' });
  }

  if (booking.advance < 0) {
    errors.push({ field: 'advance', message: 'Advance cannot be negative' });
  }

  if (booking.advance > booking.amount) {
    errors.push({ field: 'advance', message: 'Advance cannot exceed total amount' });
  }

  return errors;
}

export function validateMaintenance(maintenance: Omit<Maintenance, 'id'>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!maintenance.busId?.trim()) {
    errors.push({ field: 'busId', message: 'Vehicle selection is required' });
  }

  if (!maintenance.type?.trim()) {
    errors.push({ field: 'type', message: 'Maintenance type is required' });
  }

  if (!maintenance.description?.trim()) {
    errors.push({ field: 'description', message: 'Description is required' });
  }

  if (!maintenance.startDate || isNaN(maintenance.startDate.getTime())) {
    errors.push({ field: 'startDate', message: 'Valid start date is required' });
  }

  if (!maintenance.endDate || isNaN(maintenance.endDate.getTime())) {
    errors.push({ field: 'endDate', message: 'Valid end date is required' });
  }

  if (maintenance.startDate && maintenance.endDate && maintenance.startDate > maintenance.endDate) {
    errors.push({ field: 'endDate', message: 'End date must be after start date' });
  }

  if (maintenance.cost < 0) {
    errors.push({ field: 'cost', message: 'Cost cannot be negative' });
  }

  return errors;
}

export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => `${error.field}: ${error.message}`).join('\n');
}