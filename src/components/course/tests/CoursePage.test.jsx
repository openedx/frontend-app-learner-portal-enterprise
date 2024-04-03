import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation, useParams } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { UserSubsidyContext } from '../../enterprise-user-subsidy/UserSubsidy';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import CoursePage from '../CoursePage';
import { LEARNER_CREDIT_SUBSIDY_TYPE as mockLearnerCreditSubsidyType } from '../data/constants';
import { mockCourseService } from './constants';
import { SUBSIDY_TYPE } from '../../../constants';
import { useEnterpriseCustomer, useSearchCatalogs } from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

const mockGetActiveCourseRun = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../data/utils', () => ({
  ...jest.requireActual('../data/utils'),
  getActiveCourseRun: () => mockGetActiveCourseRun(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: () => mockNavigate,
  useParams: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: () => ({
    COURSE_TYPE_CONFIG: {
      'executive-education-2u': {
        pathSlug: 'executive-education-2u',
      },
    },
  }),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../data/service', () => ({
  __esModule: true,
  default: jest.fn(() => mockCourseService),
}));

jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useUserSubsidyApplicableToCourse: jest.fn(() => ({
    discountType: 'percentage',
    discountValue: 100,
    subsidyType: mockLearnerCreditSubsidyType,
    policyRedemptionUrl: 'http://example.com/policy-redemption-url',
  })),
  useCheckSubsidyAccessPolicyRedeemability: jest.fn(() => ({
    isInitialLoading: false,
    data: [],
  })),
  useAllCourseData: jest.fn(() => ({
    isLoading: false,
    courseData: {
      courseDetails: {
        key: 'test-course-key',
        title: 'Test Course',
        courseType: 'executive-education-2u',
        programs: [],
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
        cardImageUrl: { src: 'http://example.com/test-card-image.jpg' },
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
  useEnterpriseCuration: jest.fn(() => ({
    enterpriseCuration: {
      canOnlyViewHighlightSets: false,
    },
  })),
  useCoursePriceForUserSubsidy: jest.fn(() => [{ list: 100, discount: 0 }, 'USD']),
}));

jest.mock('../../dashboard/main-content/course-enrollments', () => ({
  CourseEnrollmentsContextProvider: jest.fn(({ children }) => (
    <div data-testid="course-enrollments-context-provider">
      {children}
    </div>
  )),
}));

jest.mock('../CourseContextProvider', () => ({
  CourseContextProvider: jest.fn(({ children }) => (
    <div data-testid="course-context-provider">
      {children}
    </div>
  )),
}));

jest.mock('../routes/CoursePageRoutes', () => jest.fn(() => <div data-testid="course-page-routes" />));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useSearchCatalogs: jest.fn(() => []),
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

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockLocation = { search: '?course_run_key=test-course-run-key' };
const mockParams = { courseKey: 'test-course-key' };

const CoursePageWrapper = () => (
  <IntlProvider locale="en">
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
        <MemoryRouter>
          <CoursePage location={mockLocation} match={{ params: mockParams }} />
        </MemoryRouter>
      </SubsidyRequestsContext.Provider>
    </UserSubsidyContext.Provider>
  </IntlProvider>
);

describe('CoursePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useSearchCatalogs.mockReturnValue([]);
    useLocation.mockReturnValue({ pathname: `/${mockEnterpriseCustomer.slug}/course/test-course-key` });
    useParams.mockReturnValue({ enterpriseSlug: mockEnterpriseCustomer.slug, courseKey: 'test-course-key' });
  });
  it('renders the component with 404 <NotFoundPage />', async () => {
    render(<CoursePageWrapper />);
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });

  it('Redirects to using course type slug if path does not include it', async () => {
    mockGetActiveCourseRun.mockImplementation(() => ({ staff: [] }));
    render(<CoursePageWrapper />);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/${mockEnterpriseCustomer.slug}/executive-education-2u/course/test-course-key`,
      { state: undefined, replace: true },
    );
    expect(screen.getByTestId('course-enrollments-context-provider')).toBeInTheDocument();
    expect(screen.getByTestId('course-context-provider')).toBeInTheDocument();
    expect(screen.getByTestId('course-page-routes')).toBeInTheDocument();
  });
});
