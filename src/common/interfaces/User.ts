import { registerEnumType } from '@nestjs/graphql';
import { IVehicle } from './Vehicle';
import { PaymentMethod } from './Payment';

// User account
export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: Date | null;

  password?: string;
  username: string;
  authProvider: IUserAuthProvider;
  googleId?: string;
  bio?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  type: IUserType;

  createdAt: Date;
  updatedAt: Date;
}

export enum IUserType {
  DRIVER = 'driver',
  PASSENGER = 'passenger',
}

registerEnumType(IUserType, {
  name: 'IUserType', // 👈 GraphQL schema type name
  description: 'User types',
});

export enum IUserAuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  PHONE = 'phone',
}

registerEnumType(IUserAuthProvider, {
  name: 'IUserAuthProvider', // 👈 GraphQL schema type name
  description: 'User auth providers',
});

export interface IDriver extends IUser {
  driverLicense?: string;
  licensePlate?: string;
  carDetails?: IVehicle;
  totalTrips: number;
  rating: number;
  isOnline: boolean;
  verificationStatus: VerificationStatus;
}

export interface IPassenger extends IUser {
  preferredPaymentMethod: PaymentMethod;
  totalTrips: number;
  rating: number;
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

registerEnumType(VerificationStatus, {
  name: 'VerificationStatus',
  description: 'Verification status',
});
