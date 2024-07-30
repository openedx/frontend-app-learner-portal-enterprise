export const emptyRedeemableLearnerCreditPolicies = {
  redeemablePolicies: [],
  learnerContentAssignments: {
    assignments: [],
    hasAssignments: false,
    allocatedAssignments: [],
    hasAllocatedAssignments: false,
    canceledAssignments: [],
    hasCanceledAssignments: false,
    expiredAssignments: [],
    hasExpiredAssignments: false,
    acceptedAssignments: [],
    hasAcceptedAssignments: false,
    erroredAssignments: [],
    hasErroredAssignments: false,
    assignmentsForDisplay: [],
    hasAssignmentsForDisplay: false,
  },
};

export const COURSE_AVAILABILITY_MAP = {
  CURRENT: 'Current',
  UPCOMING: 'Upcoming',
  STARTING_SOON: 'Starting Soon',
  ARCHIVED: 'Archived',
};

export const COURSE_MODES_MAP = {
  VERIFIED: 'verified',
  PROFESSIONAL: 'professional',
  NO_ID_PROFESSIONAL: 'no-id-professional',
  AUDIT: 'audit',
  HONOR: 'honor',
  EXECUTIVE_EDUCATION: 'executive-education',
  PAID_EXECUTIVE_EDUCATION: 'paid-executive-education',
  UNPAID_EXECUTIVE_EDUCATION: 'unpaid-executive-education',
  EXECUTIVE_EDUCATION_2U: 'executive-education-2u',
  CREDIT_VERIFIED_AUDIT: 'credit-verified-audit',
  VERIFIED_AUDIT: 'verified-audit',
};

export const EXECUTIVE_EDUCATION_COURSE_MODES = [
  COURSE_MODES_MAP.EXECUTIVE_EDUCATION,
  COURSE_MODES_MAP.PAID_EXECUTIVE_EDUCATION,
  COURSE_MODES_MAP.UNPAID_EXECUTIVE_EDUCATION,
  COURSE_MODES_MAP.EXECUTIVE_EDUCATION_2U,
];

export const LICENSE_SUBSIDY_TYPE = 'license';
export const COUPON_CODE_SUBSIDY_TYPE = 'couponCode';
export const ENTERPRISE_OFFER_SUBSIDY_TYPE = 'enterpriseOffer';
export const LEARNER_CREDIT_SUBSIDY_TYPE = 'learnerCredit';

export const ENROLL_BY_DATE_WARNING_THRESHOLD_DAYS = 10;
export const MAX_HIGHLIGHT_SETS = 12;
