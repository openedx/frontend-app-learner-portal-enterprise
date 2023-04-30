import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { CourseEnrollmentsContext } from '../../dashboard/main-content/course-enrollments/CourseEnrollmentsContextProvider';
import { CourseContextProvider } from '../CourseContextProvider';
import { UserSubsidyContext } from '../../enterprise-user-subsidy/UserSubsidy';
import { SubsidyRequestsContext, SUBSIDY_TYPE } from '../../enterprise-subsidy-requests';
import { initialCourseState } from '../../../utils/tests';
import CoursePage from '../CoursePage';
import { useAllCourseData } from '../data/hooks';
import { LEARNER_CREDIT_SUBSIDY_TYPE as mockLearnerCreditSubsidyType } from '../data/constants';
import { mockCourseService } from './constants';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));
jest.mock('../data/service', () => ({
  __esModule: true,
  default: jest.fn(() => mockCourseService),
}));
jest.mock('../data/hooks', () => ({
  useUserSubsidyApplicableToCourse: jest.fn(() => ({
    discountType: 'percentage',
    discountValue: 100,
    subsidyType: mockLearnerCreditSubsidyType,
    policyRedemptionUrl: 'http://example.com/policy-redemption-url',
  })),
  useChecksubsidyAccessPolicyRedeemability: jest.fn(() => ({
    isInitialLoading: false,
    data: [],
  })),
  useAllCourseData: jest.fn(() => ({
    isLoading: false,
    courseData: {
      courseDetails: {
        key: 'test-course-key',
        title: 'Test Course',
        shortDescription: 'A short description of the test course',
        fullDescription: 'A full description of the test course',
        image: {
          src: 'https://example.com/test-course-image.jpg',
        },
        start: '2022-01-01T00:00:00Z',
        end: '2022-12-31T23:59:59Z',
        courseRuns: [
          {
            uuid: 'course-run-1',
            key: 'test-course-run-key',
            title: 'Test Course Run',
            start: '2022-01-01T00:00:00Z',
            end: '2022-12-31T23:59:59Z',
            enrollmentStart: '2022-01-01T00:00:00Z',
            enrollmentEnd: '2022-12-31T23:59:59Z',
            seatTypes: [
              {
                type: 'verified',
                price: 199.99,
                currency: 'USD',
              },
            ],
            instructors: [
              {
                key: 'instructor-1',
                name: 'Instructor 1',
                bio: 'Instructor 1 bio',
                image: {
                  src: 'https://example.com/instructor-1.jpg',
                },
              },
            ],
            pacingType: 'self_paced',
          },
        ],
        advertisedCourseRunUuid: 'test-course-run-key',
      },
      userEnrollments: {
        'test-course-run-key': {
          mode: 'verified',
          status: 'active',
        },
      },
      userEntitlements: {
        'test-course-key': {
          status: 'active',
          mode: 'verified',
          certificate: 'https://example.com/certificate.pdf',
        },
      },
      catalog: {
        name: 'Test Catalog',
      },
    },
    courseRecommendations: {
      allRecommendations: [
        {
          key: 'test-course-key1',
          title: 'Test Course 1',
        },
        {
          key: 'test-course-key2',
          title: 'Test Course 2',
        },
      ],
    },
    courseReviews: {
      course_key: 'test-course-key1',
      reviews_count: 345,
      avg_course_rating: '2.23',
      confident_learners_percentage: '22.00',
      most_common_goal: 'Job advancement',
      most_common_goal_learners_percentage: '33.00',
      total_enrollments: 4444,
    },
  })),
  useExtractAndRemoveSearchParamsFromURL: jest.fn(() => ({
    courseRunKey: 'test-course-run-key',
  })),
}));

const initialUserSubsidyState = {
  subscriptionLicense: {
    uuid: 'test-license-uuid',
  },
  couponCodes: {
    couponCodes: [],
    couponCodesCount: 0,
  },
};
const initialSubsidyRequestsState = {
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
  catalogsForSubsidyRequests: ['test-catalog-subsidy-requests', 'course-run-1'],
};
const initialCourseStateDefined = initialCourseState({});
const updatedInitialCourseStateDefined = {
  ...initialCourseStateDefined,
  catalog: {
    catalogList: ['test-catalog-subsidy-requests'],
  },
  userEnrollments: [{
    isEnrollmentActive: true,
    isRevoked: false,
    courseRunId: 'test-course-run-key',
    mode: 'verified',
    courseDetails: {
      title: 'test-course-details',
    },
  }],
};

describe('CoursePage', () => {
  it('renders the component with 404 <NotFoundPage />, sends track event', async () => {
    const mockEnterpriseConfig = { uuid: 'test-enterprise-uuid' };
    const mockLocation = { search: '?course_run_key=test-course-run-key' };
    const mockParams = { courseKey: 'test-course-key' };
    const initialCourseEnrollmentsState = {
      courseEnrollmentsByStatus: {
        inProgress: [],
        upcoming: [],
        completed: [],
        savedForLater: [],
        requested: [],
      },
    };

    render(
      <AppContext.Provider value={{ enterpriseConfig: mockEnterpriseConfig }}>
        <UserSubsidyContext.Provider value={initialUserSubsidyState}>
          <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
            <CourseEnrollmentsContext.Provider value={initialCourseEnrollmentsState}>
              <CourseContextProvider initialState={updatedInitialCourseStateDefined}>
                <MemoryRouter>
                  <CoursePage location={mockLocation} match={{ params: mockParams }} />
                </MemoryRouter>
              </CourseContextProvider>
            </CourseEnrollmentsContext.Provider>
          </SubsidyRequestsContext.Provider>
        </UserSubsidyContext.Provider>
      </AppContext.Provider>,
    );
    expect(useAllCourseData).toHaveBeenCalledTimes(1);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
});
