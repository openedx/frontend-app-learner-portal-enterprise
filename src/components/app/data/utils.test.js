import MockDate from 'mockdate';

import dayjs from 'dayjs';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { POLICY_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';
import {
  determineAssignmentState,
  determineLearnerHasContentAssignmentsOnly,
  filterPoliciesByExpirationAndActive,
  getAvailableCourseRuns,
  getSubsidyToApplyForCourse,
  transformGroupMembership,
  transformLearnerContentAssignment,
} from './utils';
import {
  ASSIGNMENT_TYPES,
  COUPON_CODE_SUBSIDY_TYPE,
  COURSE_AVAILABILITY_MAP,
  emptyRedeemableLearnerCreditPolicies,
  ENROLL_BY_DATE_WARNING_THRESHOLD_DAYS,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  LICENSE_SUBSIDY_TYPE,
} from './constants';
import { resolveBFFQuery } from './queries';
import { enterpriseCustomerFactory } from './services/data/__factories__';
import { DATE_FORMAT } from '../../course/data';

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('determineLearnerHasContentAssignmentsOnly', () => {
  test.each([
    /**
     * - `isAssignmentLearnerOnly`: true
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has no subscription license requests
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: true,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isCurrent: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: true
     * - Has assignable redeemable policy with accepted assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has no subscription license requests
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: true,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ACCEPTED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ACCEPTED }],
          hasAssignments: true,
          allocatedAssignments: [],
          hasAllocatedAssignments: false,
          acceptedAssignments: [{ state: ASSIGNMENT_TYPES.ACCEPTED }],
          hasAcceptedAssignments: true,
          assignmentsForDisplay: [],
          hasAssignmentsForDisplay: false,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isCurrent: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has assignable redeemable policy with allocated assignment
     * - Has another auto-applied redeemable policy
     * - Has no enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has no subscription license requests
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
          {
            policyType: POLICY_TYPES.PER_LEARNER_CREDIT,
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isCurrent: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has current enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has no subscription license requests
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: true,
      subscriptionPlan: {
        isCurrent: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: true
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has active subscription plan (without activated license)
     * - Has no subscription license requests
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: true,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isCurrent: true,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: true
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has inactive subscription plan (with activated license)
     * - Has no subscription license requests
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: true,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isCurrent: false,
      },
      subscriptionLicense: { status: LICENSE_STATUS.ACTIVATED },
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has active subscription plan (with activated license)
     * - Has no subscription license requests
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isCurrent: true,
      },
      subscriptionLicense: { status: LICENSE_STATUS.ACTIVATED },
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has subscription license request(s)
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isCurrent: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [{ id: 1 }],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has no subscription license request(s)
     * - Has available coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isCurrent: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 1,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has no subscription license request(s)
     * - Has no coupon codes
     * - Has coupon code request(s)
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isCurrent: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [{ id: 1 }],
    },
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has no assignable redeemable policy
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has no subscription license request(s)
     * - Has no coupon codes
     * - Has no coupon code request(s)
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: emptyRedeemableLearnerCreditPolicies,
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isCurrent: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
  ])('determines whether learner only has assignments available, i.e. no other subsidies (%s)', ({
    isAssignmentLearnerOnly,
    redeemableLearnerCreditPolicies,
    hasCurrentEnterpriseOffers,
    subscriptionPlan,
    subscriptionLicense,
    licenseRequests,
    couponCodesCount,
    couponCodeRequests,
  }) => {
    const actualResult = determineLearnerHasContentAssignmentsOnly({
      subscriptionPlan,
      subscriptionLicense,
      licenseRequests,
      couponCodesCount,
      couponCodeRequests,
      redeemableLearnerCreditPolicies,
      hasCurrentEnterpriseOffers,
    });
    expect(actualResult).toEqual(isAssignmentLearnerOnly);
  });
});

describe('getAvailableCourseRuns', () => {
  afterEach(() => {
    MockDate.reset();
  });
  const sampleCourseRunData = {
    courseData: {
      courseRuns: [
        {
          key: 'course-v1:edX+DemoX+Demo_Course',
          title: 'Demo Course',
          isMarketable: true,
          isMarketableExternal: true,
          isEnrollable: true,
        },
        {
          key: 'course-v1:edX+DemoX+Demo_Course',
          title: 'Demo Course',
          isMarketable: false,
          isMarketableExternal: true,
          isEnrollable: true,
        },
        {
          key: 'course-v1:edX+DemoX+Demo_Course',
          title: 'Demo Course',
          isMarketable: true,
          isMarketableExternal: true,
          isEnrollable: false,
        },
        {
          key: 'course-v1:edX+DemoX+Demo_Course',
          title: 'Demo Course',
          isMarketable: false,
          isMarketableExternal: true,
          isEnrollable: false,
        },
        {
          key: 'course-v1:edX+DemoX+Demo_Course',
          title: 'Demo Course',
          isMarketable: true,
          isMarketableExternal: false,
          isEnrollable: true,
        },
        {
          key: 'course-v1:edX+DemoX+Demo_Course',
          title: 'Demo Course',
          isMarketable: false,
          isMarketableExternal: false,
          isEnrollable: true,
        },
        {
          key: 'course-v1:edX+DemoX+Demo_Course',
          title: 'Demo Course',
          isMarketable: true,
          isMarketableExternal: false,
          isEnrollable: false,
        },
        {
          key: 'course-v1:edX+DemoX+Demo_Course',
          title: 'Demo Course',
          isMarketable: false,
          isMarketableExternal: false,
          isEnrollable: false,
        },
      ],
    },
  };
  it('returns object with available course runs', () => {
    for (let i = 0; i < COURSE_AVAILABILITY_MAP.length; i++) {
      sampleCourseRunData.courseData.courseRuns.forEach((courseRun) => {
        // eslint-disable-next-line no-param-reassign
        courseRun.availability = COURSE_AVAILABILITY_MAP[i];
        if (COURSE_AVAILABILITY_MAP[i] === 'Archived') {
          expect(getAvailableCourseRuns({ course: sampleCourseRunData.courseData }).length)
            .toEqual(0);
          expect(getAvailableCourseRuns({ course: sampleCourseRunData.courseData }))
            .toEqual([]);
        } else {
          expect(getAvailableCourseRuns({ course: sampleCourseRunData.courseData }).length)
            .toEqual(1);
          expect(getAvailableCourseRuns({ course: sampleCourseRunData.courseData }))
            .toEqual(sampleCourseRunData.courseData.courseRuns.slice(0, 1));
        }
      });
    }
  });
  const sampleCourseRunDataWithRecentRuns = {
    courseData: {
      courseRuns: [
        // isMarketableExternal = true
        // Run with normally open enrollment.
        {
          key: 'course-v1:edX+DemoX+Demo_Course1',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: true,
          isMarketableExternal: true,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: true,
          enrollmentStart: '2023-07-01T00:00:00Z',
          enrollmentEnd: '2023-08-01T00:00:00Z',
          shouldDisplayCourseRun: true,
          shouldDisplayCourseRunLateEnrollment: true,
        },
        // Run with recently closed enrollment.
        {
          key: 'course-v1:edX+DemoX+Demo_Course2',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: true,
          isMarketableExternal: true,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: false,
          enrollmentStart: '2023-06-01T00:00:00Z',
          enrollmentEnd: '2023-07-01T00:00:00Z',
          shouldDisplayCourseRun: false,
          shouldDisplayCourseRunLateEnrollment: true,
        },
        // Run with recently closed enrollment, but is not marketable because the course became unpublished. This should
        // still be redeemable under late enrollment.
        {
          key: 'course-v1:edX+DemoX+Demo_Course3',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: false,
          isMarketableExternal: true,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: false,
          enrollmentStart: '2023-06-01T00:00:00Z',
          enrollmentEnd: '2023-07-01T00:00:00Z',
          shouldDisplayCourseRun: false,
          shouldDisplayCourseRunLateEnrollment: true,
        },
        // Run with recently closed enrollment, but is not really not marketable.
        {
          key: 'course-v1:edX+DemoX+Demo_Course4',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: false,
          isMarketableExternal: true,
          seats: [],
          marketingUrl: undefined,
          isEnrollable: false,
          enrollmentStart: '2023-06-01T00:00:00Z',
          enrollmentEnd: '2023-07-01T00:00:00Z',
          shouldDisplayCourseRun: false,
          shouldDisplayCourseRunLateEnrollment: false,
        },
        // Run with long-ago closed enrollment, but somehow still "Starting Soon".  This is very edge-casey.
        {
          key: 'course-v1:edX+DemoX+Demo_Course5',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: true,
          isMarketableExternal: true,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: false,
          enrollmentStart: '2023-01-01T00:00:00Z',
          enrollmentEnd: '2023-02-01T00:00:00Z',
          shouldDisplayCourseRun: false,
          shouldDisplayCourseRunLateEnrollment: false,
        },
        // Run with long-ago closed enrollment, and now running.
        {
          key: 'course-v1:edX+DemoX+Demo_Course6',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.CURRENT,
          isMarketable: true,
          isMarketableExternal: true,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: false,
          enrollmentStart: '2023-01-01T00:00:00Z',
          enrollmentEnd: '2023-02-01T00:00:00Z',
          shouldDisplayCourseRun: false,
          shouldDisplayCourseRunLateEnrollment: false,
        },
        // Run with the enrollment window still in the future.
        {
          key: 'course-v1:edX+DemoX+Demo_Course7',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: true,
          isMarketableExternal: true,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: false, // enrollment hasn't officially opened yet.
          enrollmentStart: '2023-07-10T00:00:00Z', // enrollment hasn't officially opened yet.
          enrollmentEnd: '2023-08-01T00:00:00Z',
          shouldDisplayCourseRun: false,
          shouldDisplayCourseRunLateEnrollment: false,
        },
        // isMarketableExternal = false
        // Run with normally open enrollment.
        {
          key: 'course-v1:edX+DemoX+Demo_Course1',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: true,
          isMarketableExternal: false,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: true,
          enrollmentStart: '2023-07-01T00:00:00Z',
          enrollmentEnd: '2023-08-01T00:00:00Z',
          shouldDisplayCourseRun: true,
          shouldDisplayCourseRunLateEnrollment: true,
        },
        // Run with recently closed enrollment.
        {
          key: 'course-v1:edX+DemoX+Demo_Course2',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: true,
          isMarketableExternal: false,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: false,
          enrollmentStart: '2023-06-01T00:00:00Z',
          enrollmentEnd: '2023-07-01T00:00:00Z',
          shouldDisplayCourseRun: false,
          shouldDisplayCourseRunLateEnrollment: true,
        },
        // Run with recently closed enrollment, but is not marketable because the course became unpublished. This should
        // still be redeemable under late enrollment.
        {
          key: 'course-v1:edX+DemoX+Demo_Course3',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: false,
          isMarketableExternal: false,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: false,
          enrollmentStart: '2023-06-01T00:00:00Z',
          enrollmentEnd: '2023-07-01T00:00:00Z',
          shouldDisplayCourseRun: false,
          shouldDisplayCourseRunLateEnrollment: true,
        },
        // Run with recently closed enrollment, but is not really not marketable.
        {
          key: 'course-v1:edX+DemoX+Demo_Course4',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: false,
          isMarketableExternal: false,
          seats: [],
          marketingUrl: undefined,
          isEnrollable: false,
          enrollmentStart: '2023-06-01T00:00:00Z',
          enrollmentEnd: '2023-07-01T00:00:00Z',
          shouldDisplayCourseRun: false,
          shouldDisplayCourseRunLateEnrollment: false,
        },
        // Run with long-ago closed enrollment, but somehow still "Starting Soon".  This is very edge-casey.
        {
          key: 'course-v1:edX+DemoX+Demo_Course5',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: true,
          isMarketableExternal: false,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: false,
          enrollmentStart: '2023-01-01T00:00:00Z',
          enrollmentEnd: '2023-02-01T00:00:00Z',
          shouldDisplayCourseRun: false,
          shouldDisplayCourseRunLateEnrollment: false,
        },
        // Run with long-ago closed enrollment, and now running.
        {
          key: 'course-v1:edX+DemoX+Demo_Course6',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.CURRENT,
          isMarketable: true,
          isMarketableExternal: false,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: false,
          enrollmentStart: '2023-01-01T00:00:00Z',
          enrollmentEnd: '2023-02-01T00:00:00Z',
          shouldDisplayCourseRun: false,
          shouldDisplayCourseRunLateEnrollment: false,
        },
        // Run with the enrollment window still in the future.
        {
          key: 'course-v1:edX+DemoX+Demo_Course7',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: true,
          isMarketableExternal: false,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: false, // enrollment hasn't officially opened yet.
          enrollmentStart: '2023-07-10T00:00:00Z', // enrollment hasn't officially opened yet.
          enrollmentEnd: '2023-08-01T00:00:00Z',
          shouldDisplayCourseRun: false,
          shouldDisplayCourseRunLateEnrollment: false,
        },
      ],
    },
  };
  it('returns object with available course runs', () => {
    MockDate.set('2023-07-05T00:00:00Z');
    const lateEnrollmentBufferDays = 60;
    const expectedOutputStandardFilter = sampleCourseRunDataWithRecentRuns.courseData.courseRuns.filter(
      courseRun => !!courseRun.shouldDisplayCourseRun,
    );
    const expectedOutputWithLateEnrollment = sampleCourseRunDataWithRecentRuns.courseData.courseRuns.filter(
      courseRun => !!courseRun.shouldDisplayCourseRunLateEnrollment,
    );
    expect(getAvailableCourseRuns({ course: sampleCourseRunDataWithRecentRuns.courseData }))
      .toEqual(expectedOutputStandardFilter);
    expect(getAvailableCourseRuns(
      { course: sampleCourseRunDataWithRecentRuns.courseData, lateEnrollmentBufferDays },
    )).toEqual(expectedOutputWithLateEnrollment);
  });
  it.each([
    // enrollable with not marketable and marketable external true 3/3 passing
    {
      courseData: {
        courseRuns: [
          {
            key: 'course-v1:edX+DemoX+Demo_Course7',
            title: 'Demo Course',
            availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
            isMarketable: false,
            isMarketableExternal: true,
            seats: [{ sku: '835BEA7' }],
            marketingUrl: 'https://foo.bar/',
            isEnrollable: true, // enrollment hasn't officially opened yet.
            enrollmentStart: dayjs().add(-5, 'days').format(DATE_FORMAT),
            enrollmentEnd: dayjs().add(50, 'days').format(DATE_FORMAT),
          },
          {
            key: 'course-v1:edX+DemoX+Demo_Course7',
            title: 'Demo Course',
            availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
            isMarketable: false,
            isMarketableExternal: true,
            seats: [{ sku: '835BEA7' }],
            marketingUrl: 'https://foo.bar/',
            isEnrollable: true,
            enrollmentStart: dayjs().add(-5, 'days').format(DATE_FORMAT),
            enrollmentEnd: dayjs().add(50, 'days').format(DATE_FORMAT),
          },
          {
            key: 'course-v1:edX+DemoX+Demo_Course7',
            title: 'Demo Course',
            availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
            isMarketable: false,
            isMarketableExternal: true,
            seats: [{ sku: '835BEA7' }],
            marketingUrl: 'https://foo.bar/',
            isEnrollable: true, // enrollment hasn't officially opened yet.
            enrollmentStart: dayjs().add(-5, 'days').format(DATE_FORMAT),
            enrollmentEnd: dayjs().add(50, 'days').format(DATE_FORMAT),
          },
        ],
      },
      expectedOutput: [
        {
          key: 'course-v1:edX+DemoX+Demo_Course7',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: false,
          isMarketableExternal: true,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: true, // enrollment hasn't officially opened yet.
          enrollmentStart: dayjs().add(-5, 'days').format(DATE_FORMAT),
          enrollmentEnd: dayjs().add(50, 'days').format(DATE_FORMAT),
        },
        {
          key: 'course-v1:edX+DemoX+Demo_Course7',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: false,
          isMarketableExternal: true,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: true, // enrollment hasn't officially opened yet.
          enrollmentStart: dayjs().add(-5, 'days').format(DATE_FORMAT),
          enrollmentEnd: dayjs().add(50, 'days').format(DATE_FORMAT),
        },
        {
          key: 'course-v1:edX+DemoX+Demo_Course7',
          title: 'Demo Course',
          availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
          isMarketable: false,
          isMarketableExternal: true,
          seats: [{ sku: '835BEA7' }],
          marketingUrl: 'https://foo.bar/',
          isEnrollable: true, // enrollment hasn't officially opened yet.
          enrollmentStart: dayjs().add(-5, 'days').format(DATE_FORMAT),
          enrollmentEnd: dayjs().add(50, 'days').format(DATE_FORMAT),
        },
      ],
    },
    // enrollable with not marketable and marketable external false 0/3 passing
    {
      courseData: {
        courseRuns: [
          {
            key: 'course-v1:edX+DemoX+Demo_Course7',
            title: 'Demo Course',
            availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
            isMarketable: false,
            isMarketableExternal: false,
            seats: [{ sku: '835BEA7' }],
            marketingUrl: 'https://foo.bar/',
            isEnrollable: true,
            enrollmentStart: dayjs().add(-5, 'days').toISOString(),
            enrollmentEnd: dayjs().add(50, 'days').toISOString(),
          },
          {
            key: 'course-v1:edX+DemoX+Demo_Course7',
            title: 'Demo Course',
            availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
            isMarketable: false,
            isMarketableExternal: false,
            seats: [{ sku: '835BEA7' }],
            marketingUrl: 'https://foo.bar/',
            isEnrollable: true,
            enrollmentStart: dayjs().add(5, 'days').toISOString(),
            enrollmentEnd: dayjs().add(50, 'days').toISOString(),
          },
          {
            key: 'course-v1:edX+DemoX+Demo_Course7',
            title: 'Demo Course',
            availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
            isMarketable: false,
            isMarketableExternal: false,
            seats: [{ sku: '835BEA7' }],
            marketingUrl: 'https://foo.bar/',
            isEnrollable: false,
            enrollmentStart: dayjs().add(5, 'days').toISOString(),
            enrollmentEnd: dayjs().add(50, 'days').toISOString(),
          },
        ],
      },
      expectedOutput: [],
    },
    // Not enrollable with not marketable and marketable external true 0/3 passing
    {
      courseData: {
        courseRuns: [
          {
            key: 'course-v1:edX+DemoX+Demo_Course7',
            title: 'Demo Course',
            availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
            isMarketable: false,
            isMarketableExternal: true,
            seats: [{ sku: '835BEA7' }],
            marketingUrl: 'https://foo.bar/',
            isEnrollable: false, // enrollment hasn't officially opened yet.
            enrollmentStart: dayjs().add(5, 'days').toISOString(), // enrollment hasn't officially opened yet.
            enrollmentEnd: dayjs().add(50, 'days').toISOString(),
          },
          {
            key: 'course-v1:edX+DemoX+Demo_Course7',
            title: 'Demo Course',
            availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
            isMarketable: false,
            isMarketableExternal: true,
            seats: [{ sku: '835BEA7' }],
            marketingUrl: 'https://foo.bar/',
            isEnrollable: false, // enrollment hasn't officially opened yet.
            enrollmentStart: dayjs().add(5, 'days').toISOString(), // enrollment hasn't officially opened yet.
            enrollmentEnd: dayjs().add(50, 'days').toISOString(),
          },
          {
            key: 'course-v1:edX+DemoX+Demo_Course7',
            title: 'Demo Course',
            availability: COURSE_AVAILABILITY_MAP.STARTING_SOON,
            isMarketable: false,
            isMarketableExternal: true,
            seats: [{ sku: '835BEA7' }],
            marketingUrl: 'https://foo.bar/',
            isEnrollable: false, // enrollment hasn't officially opened yet.
            enrollmentStart: dayjs().add(5, 'days').toISOString(), // enrollment hasn't officially opened yet.
            enrollmentEnd: dayjs().add(50, 'days').toISOString(),
          },
        ],
      },
      expectedOutput: [],
    },
  ])('returns future or upcoming course run based on isMarketableExternal, (%s)', ({ courseData, expectedOutput }) => {
    expect(getAvailableCourseRuns({
      course: courseData,
    })).toEqual(expectedOutput);
  });
  it('returns empty array if course runs are not available', () => {
    sampleCourseRunData.courseData.courseRuns = [];
    expect(getAvailableCourseRuns({ course: sampleCourseRunData.courseData }).length).toEqual(0);
    expect(getAvailableCourseRuns({ course: sampleCourseRunData.courseData })).toEqual([]);
  });
  it('returns an empty array is courseRuns is not defined', () => {
    sampleCourseRunData.courseData.courseRuns = undefined;
    expect(getAvailableCourseRuns({ course: sampleCourseRunData.courseData }).length).toEqual(0);
    expect(getAvailableCourseRuns({ course: sampleCourseRunData.courseData })).toEqual([]);
  });
});

describe('transformGroupMembership', () => {
  afterEach(() => {
    MockDate.reset();
  });
  const mockGroupUuid = 'test-group-uuid';
  const mockGroupMemberships = [
    {
      learner_id: 1,
      pending_learner_id: null,
      enterprise_group_membership_uuid: mockGroupUuid,
      member_details: {
        user_email: 'learner1@test.com',
      },
      recent_action: 'Accepted: April 15, 2024',
      status: 'accepted',
    },
    {
      learner_id: 2,
      pending_learner_id: null,
      enterprise_group_membership_uuid: mockGroupUuid,
      member_details: {
        user_email: 'learner2@test.com',
      },
      recent_action: 'Accepted: April 15, 2024',
      status: 'accepted',
    },
  ];
  const mockTransformedData = [
    {
      learner_id: 1,
      pending_learner_id: null,
      enterprise_group_membership_uuid: mockGroupUuid,
      member_details: {
        user_email: 'learner1@test.com',
      },
      recent_action: 'Accepted: April 15, 2024',
      status: 'accepted',
      groupUuid: mockGroupUuid,
    },
    {
      learner_id: 2,
      pending_learner_id: null,
      enterprise_group_membership_uuid: mockGroupUuid,
      member_details: {
        user_email: 'learner2@test.com',
      },
      recent_action: 'Accepted: April 15, 2024',
      status: 'accepted',
      groupUuid: mockGroupUuid,
    },
  ];
  it('returns array with transformed group membership data', () => {
    expect(transformGroupMembership(
      mockGroupMemberships,
      mockGroupUuid,
    )).toEqual(mockTransformedData);
  });
});

describe('filterPoliciesByExpirationAndActive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it.each([
    {
      active: true,
      subsidyExpirationDate: dayjs().add(10, 'days').toISOString(),
    },
    {
      active: false,
      subsidyExpirationDate: dayjs().add(10, 'days').toISOString(),
    },
    {
      active: true,
      subsidyExpirationDate: dayjs().subtract(10, 'days').toISOString(),
    },
    {
      active: false,
      subsidyExpirationDate: dayjs().subtract(10, 'days').toISOString(),
    },
  ])('correctly filters expired and unexpired policies (%s)', ({
    active,
    subsidyExpirationDate,
  }) => {
    const mockPolicies = [{
      active,
      subsidyExpirationDate,
    }];
    const filteredPolicies = filterPoliciesByExpirationAndActive(mockPolicies);
    if (dayjs(subsidyExpirationDate).isAfter(dayjs()) && active) {
      expect(filteredPolicies.expiredPolicies).toEqual([]);
      expect(filteredPolicies.unexpiredPolicies).toEqual(mockPolicies);
    } else {
      expect(filteredPolicies.expiredPolicies).toEqual(mockPolicies);
      expect(filteredPolicies.unexpiredPolicies).toEqual([]);
    }
  });
});

describe('getSubsidyToApplyForCourse', () => {
  const mockApplicableSubscriptionLicense = {
    uuid: 'license-uuid',
    status: 'activated',
    subscriptionPlan: {
      startDate: '2023-08-11',
      expirationDate: '2024-08-11',
    },
  };

  const mockApplicableCouponCode = {
    uuid: 'coupon-code-uuid',
    usageType: 'percentage',
    benefitValue: 100,
    couponStartDate: '2023-08-11',
    couponEndDate: '2024-08-11',
    code: 'xyz',
  };

  const mockApplicableEnterpriseOffer = {
    id: 1,
    usageType: 'Percentage',
    discountValue: 100,
    startDatetime: '2023-08-11',
    endDatetime: '2024-08-11',
  };

  const mockApplicableSubsidyAccessPolicy = {
    isPolicyRedemptionEnabled: true,
    redeemableSubsidyAccessPolicy: {
      perLearerEnrollmentLimit: 100,
      perLearnerSpendLimit: 1000,
      policyRedemptionUrl: 'https://enterprise.edx.org/redeem?edX+DemoX+2024',
    },
  };

  it('returns applicableSubscriptionLicense over learner credit', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: mockApplicableSubscriptionLicense,
      applicableCouponCode: mockApplicableCouponCode,
      applicableEnterpriseOffer: mockApplicableEnterpriseOffer,
      applicableSubsidyAccessPolicy: {
        isPolicyRedemptionEnabled: true,
        redeemableSubsidyAccessPolicy: {},
      },
    });

    expect(subsidyToApply).toEqual({
      subsidyType: LICENSE_SUBSIDY_TYPE,
      subsidyId: mockApplicableSubscriptionLicense.uuid,
      startDate: mockApplicableSubscriptionLicense.subscriptionPlan.startDate,
      expirationDate: mockApplicableSubscriptionLicense.subscriptionPlan.expirationDate,
      status: mockApplicableSubscriptionLicense.status,
      discountType: 'percentage',
      discountValue: 100,
    });
  });

  it('returns applicableCouponCode if there is no applicableSubscriptionLicense', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: undefined,
      applicableCouponCode: mockApplicableCouponCode,
      applicableEnterpriseOffer: mockApplicableEnterpriseOffer,
    });

    expect(subsidyToApply).toEqual({
      discountType: mockApplicableCouponCode.usageType,
      discountValue: mockApplicableCouponCode.benefitValue,
      startDate: mockApplicableCouponCode.couponStartDate,
      endDate: mockApplicableCouponCode.couponEndDate,
      code: mockApplicableCouponCode.code,
      subsidyType: COUPON_CODE_SUBSIDY_TYPE,
    });
  });

  it('returns applicableSubsidyAccessPolicy if there is no applicableSubscriptionLicense or applicableCouponCode', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: undefined,
      applicableCouponCode: undefined,
      applicableEnterpriseOffer: undefined,
      applicableSubsidyAccessPolicy: mockApplicableSubsidyAccessPolicy,
    });
    const {
      perLearnerEnrollmentLimit,
      perLearnerSpendLimit,
      policyRedemptionUrl,
    } = mockApplicableSubsidyAccessPolicy.redeemableSubsidyAccessPolicy;
    expect(subsidyToApply).toEqual({
      discountType: 'percentage',
      discountValue: 100,
      perLearnerEnrollmentLimit,
      perLearnerSpendLimit,
      policyRedemptionUrl,
      subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
    });
  });

  it('returns applicableEnterpriseOffer if there is no applicableSubscriptionLicense or applicableCouponCode or applicableSubsidyAccessPolicy', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: undefined,
      applicableCouponCode: undefined,
      applicableEnterpriseOffer: mockApplicableEnterpriseOffer,
      applicableSubsidyAccessPolicy: {},
    });

    expect(subsidyToApply).toEqual({
      discountType: mockApplicableEnterpriseOffer.usageType.toLowerCase(),
      discountValue: mockApplicableEnterpriseOffer.discountValue,
      startDate: mockApplicableEnterpriseOffer.startDatetime,
      endDate: mockApplicableEnterpriseOffer.endDatetime,
      subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
    });
  });

  it('returns null if there are no applicable subsidies', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: undefined,
      applicableCouponCode: undefined,
      applicableEnterpriseOffer: undefined,
      applicableSubsidyAccessPolicy: {
        isPolicyRedemptionEnabled: false,
        redeemableSubsidyAccessPolicy: undefined,
      },
    });

    expect(subsidyToApply).toBeUndefined();
  });
});

describe('determineAssignmentState', () => {
  it.each([{
    state: 'accepted',
  },
  {
    state: 'allocated',
  },
  {
    state: 'cancelled',
  },
  {
    state: 'expired',
  },
  {
    state: 'errored',
  },
  {
    state: 'expiring',
  },
  {
    state: 'pikachu',
  },
  ])('returns expected object when state is passed (%s)', ({ state }) => {
    const currentAssignmentStates = determineAssignmentState({ state });
    const baseAssignmentStates = {
      isAcceptedAssignment: false,
      isAllocatedAssignment: false,
      isCanceledAssignment: false,
      isExpiredAssignment: false,
      isErroredAssignment: false,
      isExpiringAssignment: false,
    };
    switch (state) {
      case ASSIGNMENT_TYPES.ACCEPTED:
        expect(currentAssignmentStates).toEqual({
          ...baseAssignmentStates,
          isAcceptedAssignment: true,
        });
        break;
      case ASSIGNMENT_TYPES.ALLOCATED:
        expect(currentAssignmentStates).toEqual({
          ...baseAssignmentStates,
          isAllocatedAssignment: true,
        });
        break;
      case ASSIGNMENT_TYPES.CANCELED:
        expect(currentAssignmentStates).toEqual({
          ...baseAssignmentStates,
          isCanceledAssignment: true,
        });
        break;
      case ASSIGNMENT_TYPES.EXPIRING:
        expect(currentAssignmentStates).toEqual({
          ...baseAssignmentStates,
          isExpiringAssignment: true,
        });
        break;
      case ASSIGNMENT_TYPES.EXPIRED:
        expect(currentAssignmentStates).toEqual({
          ...baseAssignmentStates,
          isExpiredAssignment: true,
        });
        break;
      case ASSIGNMENT_TYPES.ERRORED:
        expect(currentAssignmentStates).toEqual({
          ...baseAssignmentStates,
          isErroredAssignment: true,
        });
        break;
      default:
        expect(currentAssignmentStates).toEqual(baseAssignmentStates);
    }
  });
});
describe('transformLearnerContentAssignment', () => {
  it.each([
    {
      isAssignedCourseRun: true,
      parentContentKey: 'edX+demoX',
      contentKey: 'course-v1:edX+demoX+2018',
    },
    {
      isAssignedCourseRun: false,
      parentContentKey: null,
      contentKey: 'edX+demoX',
    },
  ])('handles courseRunId and linkToCourse correct when isAssignedCourseRun is (%s)', ({
    isAssignedCourseRun,
    parentContentKey,
    contentKey,
  }) => {
    const mockSlug = 'demoSlug';
    const mockSubsidyExpirationDateStr = dayjs().add(ENROLL_BY_DATE_WARNING_THRESHOLD_DAYS + 1, 'days').toISOString();
    const mockAssignmentConfigurationId = 'test-assignment-configuration-id';
    const mockAssignment = {
      contentKey,
      contentTitle: 'edX Demo Course',
      subsidyExpirationDate: mockSubsidyExpirationDateStr,
      assignmentConfiguration: mockAssignmentConfigurationId,
      contentMetadata: {
        enrollByDate: dayjs().add(1, 'w').toISOString(),
        partners: [{ name: 'Test Partner' }],
      },
      earliestPossibleExpiration: {
        date: mockSubsidyExpirationDateStr,
        reason: 'subsidy_expired',
      },
      actions: [],
    };
    const mockAllocatedAssignment = {
      ...mockAssignment,
      isAssignedCourseRun,
      parentContentKey,
      uuid: 'test-assignment-uuid',
      state: ASSIGNMENT_TYPES.ALLOCATED,
    };
    const transformedAllocatedAssignment = transformLearnerContentAssignment(mockAllocatedAssignment, mockSlug);
    expect(transformedAllocatedAssignment.linkToCourse).toEqual(
      `/${mockSlug}/course/edX+demoX`,
    );
    expect(transformedAllocatedAssignment.courseRunId).toEqual(contentKey);
  });
});

describe('resolveBFFQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      currentPathname: `/${mockEnterpriseCustomer.slug}`,
      expectedRouteKey: 'dashboard',
    },
    {
      currentPathname: `/${mockEnterpriseCustomer.slug}/search`,
      expectedRouteKey: 'search',
    },
    {
      currentPathname: `/${mockEnterpriseCustomer.slug}/search/pathway-uuid`,
      expectedRouteKey: 'search',
    },
    {
      currentPathname: `/${mockEnterpriseCustomer.slug}/academies/academy-uuid`,
      expectedRouteKey: 'academy',
    },
    {
      currentPathname: `/${mockEnterpriseCustomer.slug}/skills-quiz`,
      expectedRouteKey: 'skillsQuiz',
    },
  ])('returns the expected query key (%s)', ({ currentPathname, expectedRouteKey }) => {
    const expectedQueryKey = [
      'bff',
      'enterpriseSlug',
      mockEnterpriseCustomer.slug,
      'route',
      expectedRouteKey,
    ];
    const result = resolveBFFQuery(currentPathname);
    expect(result({ enterpriseSlug: mockEnterpriseCustomer.slug }).queryKey).toEqual(expectedQueryKey);
  });

  it('returns null from unmatched query key', () => {
    const pathname = `/${mockEnterpriseCustomer.slug}/unsupported-bff-route`;
    const result = resolveBFFQuery(pathname);
    expect(result).toEqual(null);
  });
});
