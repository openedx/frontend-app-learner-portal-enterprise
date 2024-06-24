export interface LearnerContentAssignment {
  uuid: string;
  state: string;
}

export interface SubsidyAccessPolicy {
  active: boolean;
  learnerContentAssignments?: LearnerContentAssignment[],
  subsidyExpirationDate: string;
}

export interface SubsidyToApplyForCourse {
  subsidyType: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  expirationDate: string;
}

export interface SubscriptionSubsidyToApplyForCourse extends SubsidyToApplyForCourse {
  status: string;
}

export interface CouponCodeSubsidyToApplyForCourse extends SubsidyToApplyForCourse {
  code: string;
}
