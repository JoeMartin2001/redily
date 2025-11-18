import { registerEnumType } from '@nestjs/graphql';

export interface IRideRequest {
  id: string;
  rideId: string;
  userId: string;

  status: RideRequestStatus;

  createdAt: Date;
  updatedAt: Date;
}

export enum RideRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

registerEnumType(RideRequestStatus, {
  name: 'RideRequestStatus',
  description: 'Ride request status',
});
