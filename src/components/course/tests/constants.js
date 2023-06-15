import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { DISABLED_ENROLL_REASON_TYPES, LICENSE_SUBSIDY_TYPE, REASON_USER_MESSAGES } from '../data/constants';

export const TEST_RECOMMENDATION_DATA = {
  all_recommendations: [
    {
      id: 2,
      key: 'edX+DemoX2',
      title: 'Test çօմɾʂҽ iYMywOPjhdNP',
      owners: [
        {
          uuid: 'dd724d68-f0a2-45bf-a7ae-2abed1b300c1',
          key: 'edX',
          name: 'edX',
          auto_generate_course_run_keys: true,
          certificate_logo_image_url: null,
          logo_image_url: 'http://localhost:18381/media/organization/logos/dd724d68-f0a2-45bf-a7ae-2abed1b300c1-ab308382635d.png',
        },
      ],
      card_image_url: {
        src: 'http://localhost:18381/media/media/course/image/8ceb0900-c39a-42a1-88ec-b009ca91e11a-bb477af0e777.small.jpg',
        description: null,
        height: null,
        width: null,
      },
      skills_intersection_ratio: 0.8,
      skills_intersection_length: 5,
      subjects_intersection_ratio: 0.5,
      subjects_intersection_length: 2,
    },
    {
      id: 1,
      key: 'edX+DemoX',
      title: 'Demonstration Course',
      owners: [
        {
          uuid: 'dd724d68-f0a2-45bf-a7ae-2abed1b300c1',
          key: 'edX',
          name: 'edX',
          auto_generate_course_run_keys: true,
          certificate_logo_image_url: null,
          logo_image_url: 'http://localhost:18381/media/organization/logos/dd724d68-f0a2-45bf-a7ae-2abed1b300c1-ab308382635d.png',
        },
      ],
      card_image_url: {
        src: 'http://localhost:18381/media/media/course/image/fe1a9ad4-a452-45cd-80e5-9babd3d43f96-8b25b9d84e4f.small.png',
        description: null,
        height: null,
        width: null,
      },
      skills_intersection_ratio: 0.5,
      skills_intersection_length: 4,
      subjects_intersection_ratio: 0.4,
      subjects_intersection_length: 2,
    },
  ],
  same_partner_recommendations: [
    {
      id: 2,
      key: 'course-id+VlBDvHEHaHot',
      title: 'Test çօմɾʂҽ iYMywOPjhdNP',
      owners: [
        {
          uuid: 'dd724d68-f0a2-45bf-a7ae-2abed1b300c1',
          key: 'edX',
          name: 'edX',
          auto_generate_course_run_keys: true,
          certificate_logo_image_url: null,
          logo_image_url: 'http://localhost:18381/media/organization/logos/dd724d68-f0a2-45bf-a7ae-2abed1b300c1-ab308382635d.png',
        },
      ],
      card_image_url: {
        src: 'http://localhost:18381/media/media/course/image/8ceb0900-c39a-42a1-88ec-b009ca91e11a-bb477af0e777.small.jpg',
        description: null,
        height: null,
        width: null,
      },
      skills_intersection_ratio: 0.8,
      skills_intersection_length: 5,
      subjects_intersection_ratio: 0.5,
      subjects_intersection_length: 2,
    },
    {
      id: 1,
      key: 'edX+DemoX',
      title: 'Demonstration Course',
      owners: [
        {
          uuid: 'dd724d68-f0a2-45bf-a7ae-2abed1b300c1',
          key: 'edX',
          name: 'edX',
          auto_generate_course_run_keys: true,
          certificate_logo_image_url: null,
          logo_image_url: 'http://localhost:18381/media/organization/logos/dd724d68-f0a2-45bf-a7ae-2abed1b300c1-ab308382635d.png',
        },
      ],
      card_image_url: {
        src: 'http://localhost:18381/media/media/course/image/fe1a9ad4-a452-45cd-80e5-9babd3d43f96-8b25b9d84e4f.small.png',
        description: null,
        height: null,
        width: null,
      },
      skills_intersection_ratio: 0.5,
      skills_intersection_length: 4,
      subjects_intersection_ratio: 0.4,
      subjects_intersection_length: 2,
    },
  ],
};

export const FILTERED_RECOMMENDATIONS = {
  filtered_content_keys: [
    'edX+DemoX',
    'edX+DemoX2',
  ],
};

export const REVIEW_DATA = [
  {
    course_key: 'edX+DemoX',
    reviews_count: 345,
    avg_course_rating: '2.23',
    confident_learners_percentage: '22.00',
    most_common_goal: 'Job advancement',
    most_common_goal_learners_percentage: '33.00',
    total_enrollments: 4444,
  },
];

export const mockCourseData = {
  catalog: {
    containsContentItems: true,
    catalogList: ['catalog-1'],
  },
};
export const mockCourseRecommendations = {
  all_recommendations: ['edX+DemoX'],
  same_partner_recommendations: ['edX+DemoX'],
};
export const mockCourseReviews = [];
export const mockCourseRunKey = 'course-v1:edX+DemoX+1T2023';
export const mockRedeemableSubsidyAccessPolicy = {
  uuid: 'test-subsidy-access-policy-uuid',
};
export const mockCanRedeemReasonActionTestId = 'fake-can-redeem-reason-actions';
export const mockCanRedeemReason = {
  reason: DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED,
  userMessage: REASON_USER_MESSAGES.LEARNER_LIMITS_REACHED,
};
export const mockCanRedeemForContentKey = {
  content_key: mockCourseRunKey,
  can_redeem: true,
  redeemable_subsidy_access_policy: mockRedeemableSubsidyAccessPolicy,
  has_redeemed: false,
  redemptions: [],
  reasons: [],
};
export const mockCanRedeemData = [mockCanRedeemForContentKey];
export const mockSubscriptionLicense = {
  uuid: 'test-subscription-uuid',
};
export const mockRevokedSubscriptionLicense = {
  uuid: 'test-subscription-uuid',
  status: LICENSE_STATUS.REVOKED,
};
export const mockUserLicenseSubsidy = {
  discountType: 'percentage',
  discountValue: 100,
  subsidyType: LICENSE_SUBSIDY_TYPE,
};

export const mockEnterpriseUUID = 'enterprise-uuid';
export const mockCourseKey = 'course-key';
export const mockCourseService = {
  fetchAllCourseData: jest.fn(() => mockCourseData),
  fetchAllCourseRecommendations: jest.fn(() => mockCourseRecommendations),
  fetchFilteredRecommendations: jest.fn(() => mockCourseRecommendations),
  fetchCourseReviews: jest.fn(() => mockCourseReviews),
  fetchUserLicenseSubsidy: jest.fn().mockResolvedValue({ data: mockUserLicenseSubsidy }),
  fetchCanRedeem: jest.fn().mockResolvedValue({ data: mockCanRedeemData }),
  courseKey: mockCourseKey,
  enterpriseUuid: mockEnterpriseUUID,
  activeCourseRun: {
    firstEnrollablePaidSeatPrice: 100,
  },
};
export const mockCourseServiceUninitialized = {
  ...mockCourseService,
  courseKey: undefined,
  enterpriseUuid: undefined,
  activeCourseRun: undefined,
};
export const mockCourseServiceNoActiveCourseRun = {
  ...mockCourseService,
  activeCourseRun: undefined,
};

export const mockLmsUserId = 3;

export const mockTransactionResponse = {
  uuid: '095be615-a8ad-4c33-8e9c-c7612fbf6c9f',
  state: 'created',
  idempotencyKey: 'string',
  lmsUserId: 2147483648,
  contentKey: 'course-v1:edX+CTL.SC2x+1T2023',
  quantity: 922,
  unit: 'usd_cents',
  fulfillmentIdentifier: 'string',
  subsidyAccessPolicyUuid: '6efa2ddf-c05a-408d-81ff-3068e850cea0',
  transactionUuid: '12345678-9000-0000-0000-98765432101',
};

export const mockRedemptionResponse = {
  uuid: 'the-transaction-uuid',
  state: 'committed',
  idempotencyKey: 'the-idempotency-key',
  lmsUserId: 54321,
  contentKey: 'demox_1234+2T2023',
  quantity: 19900,
  unit: 'USD_CENTS',
  referenceId: 1234,
  referenceType: 'enterprise_fufillment_source_uuid',
  subsidyAccessPolicyUuid: 'a-policy-uuid',
  created: 'created-datetime',
  modified: 'modified-datetime',
  reversals: [],
};
