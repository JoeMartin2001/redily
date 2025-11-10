export interface OTPCode {
  id: string;
  phoneNumber: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}
