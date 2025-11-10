import { registerEnumType } from '@nestjs/graphql';
import { IRideRule } from './RideRule';
import { IVehicle } from './Vehicle';

export interface IRide {
  id: string;
  driverId: string;
  carDetails: IVehicle;
  departure: ILocation;
  destination: ILocation;
  departureTime: Date;
  estimatedArrivalTime: Date;
  availableSeats: number;
  pricePerSeat: number;
  currency: string;
  description?: string;
  stops: IStop[];
  rules: IRideRule[];
  status: RideStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStop {
  location: ILocation;
  estimatedArrivalTime: Date;
  order: number;
}

export interface ILocation {
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
}

export enum RideStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

registerEnumType(RideStatus, {
  name: 'RideStatus',
  description: 'Ride status',
});
