import { registerEnumType } from '@nestjs/graphql';
import { ILocation } from './Ride';
import { Amenity, ComfortLevel } from './Vehicle';

export interface IRideSearchFilters {
  departure: ILocation;
  destination: ILocation;
  departureDate: Date;
  seatsRequired: number;
  maxPrice?: number;
  comfortLevel?: ComfortLevel;
  amenities?: Amenity[];
  instantBooking?: boolean;
  ladiesOnly?: boolean;
}

registerEnumType(ComfortLevel, {
  name: 'ComfortLevel',
  description: 'Comfort level of the vehicle',
});

registerEnumType(Amenity, {
  name: 'Amenity',
  description: 'Amenities of the vehicle',
});
