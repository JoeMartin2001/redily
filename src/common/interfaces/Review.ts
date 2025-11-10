export interface IReview {
  id: string;
  bookingId: string;
  reviewerId: string; // User who wrote the review
  reviewedId: string; // User being reviewed (driver or passenger)
  type: ReviewType;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export enum ReviewType {
  DRIVER_REVIEW = 'driver_review',
  PASSENGER_REVIEW = 'passenger_review',
}

export interface IRatingSummary {
  userId: string;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
