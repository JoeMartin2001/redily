import { IDriver } from './User';
import { IRide } from './Ride';
import { IVehicle } from './Vehicle';

export interface IRideSearchResult {
  ride: IRide;
  driver: IDriver;
  carDetails: IVehicle;
  availableSeats: number;
  estimatedDuration: number; // in minutes
  pricePerSeat: number;
  isInstantBookable: boolean;
}
