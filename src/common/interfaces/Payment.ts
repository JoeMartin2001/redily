import { registerEnumType } from '@nestjs/graphql';

export interface IPayment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate?: Date;
  refundAmount?: number;
  refundDate?: Date;
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
  description: 'Payment methods',
});

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Payment status',
});
