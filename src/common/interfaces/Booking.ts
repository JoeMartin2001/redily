import { registerEnumType } from '@nestjs/graphql';
import { ILocation } from './Ride';

export interface IBooking {
  id: string;
  rideId: string;
  passengerId: string;
  seatsBooked: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  bookingTime: Date;
  pickupLocation?: ILocation;
  dropoffLocation?: ILocation;
  specialRequests?: string;
  cancellationReason?: string;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

registerEnumType(BookingStatus, {
  name: 'BookingStatus',
  description: 'Booking status',
});
