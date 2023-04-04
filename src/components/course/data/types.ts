export type CoursePartner = {
  name: string;
  logoImageUrl: string;
};

export type CourseOwner = {
  uuid: string;
  key: string;
  name: string;
  slug: string;
  auto_generate_course_run_keys: boolean;
  certificate_logo_image_url?: string;
  logo_image_url?: string;
  organization_hex_color?: string;
  description: string;
  description_es?: string;
  homepage_url?: string;
  tags: string[];
  marketing_url: string;
  banner_image_url?: string;
  enterprise_subscription_inclusion: boolean;
};

export type Course = {
  title: string;
  cardImageUrl: string;
  originalImageUrl?: string;
  key: string;
  partners: CoursePartner[];
  skillNames: string[];
  owners: CourseOwner[];
};

export type SubscriptionLicense = {
  uuid: string;
  subsidyType: string;
};

export type CourseRun = {
  key: string;
  uuid: string;
  title: string;
  firstEnrollablePaidSeatPrice: number
};

export interface CourseServiceOptions {
  activeCourseRun?: CourseRun;
  courseKey?: string;
  courseRunKey?: string;
  enterpriseUuid?: string;
}

export type CourseRecommendation = {
  key: string;
};

export type CouponCode = {
  uuid: string;
  code: string;
  catalog: string;
  usageType: string;
  benefitValue: number;
  couponStartDate: string;
  couponEndDate: string;
};

export type EnterpriseOffer = {
  id: number;
  enterpriseCatalogUuid: string;
  remainingBalance?: number;
  remainingBalanceForUser?: number;
  startDatetime: string;
  endDatetime: string;
  offerType: string;
  usageType: string;
  discountType: string;
  discountValue: number;
};

export type EnterpriseSubsidy = {
  discountType?: string;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  code?: string;
  offerType?: string;
  subsidyType: string;
};

export type CourseEnrollment = {
  isEnrollmentActive: boolean;
  isRevoked: boolean;
  courseRunId: string;
  mode: string;
};

export type UserEntitlement = {
  courseUuid: string;
};

export type CatalogData = {
  containsContentItems: boolean;
  catalogList: string[];
};

export type CourseEntitlement = {
  mode: string;
  price: string;
  currency: string;
  sku: string;
  expires?: string | null;
};

// TODO: Flesh out as needed
export type CourseData = {
  key: string;
  uuid: string;
  title: string;
  userSubsidyApplicableToCourse?: EnterpriseSubsidy | null;
  entitlements: CourseEntitlement[];
};
