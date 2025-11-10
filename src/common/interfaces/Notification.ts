import { registerEnumType } from '@nestjs/graphql';

export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedEntityId?: string; // rideId, bookingId, etc.
  createdAt: Date;
}

export enum NotificationType {
  BOOKING_CONFIRMED = 'booking_confirmed',
  RIDE_UPDATED = 'ride_updated',
  PAYMENT_RECEIVED = 'payment_received',
  NEW_REVIEW = 'new_review',
  SYSTEM = 'system',
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'Notification type',
});
