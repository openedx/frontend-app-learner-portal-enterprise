import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { useParams } from 'react-router-dom';
import CourseHeader from '../CourseHeader';

import { COURSE_PACING_MAP } from '../../data/constants';
import { TEST_OWNER } from '../../tests/data/constants';
import {
  COURSE_MODES_MAP,
  useCourseMetadata,
  useCourseRedemptionEligibility,
  useCourseReviews,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseCustomerContainsContentSuspense,
  useIsAssignmentsOnlyLearner,
  useRedeemablePolicies,
} from '../../../app/data';
import { generateTestPermutations, renderWithRouterProvider } from '../../../../utils/tests';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';
import { useIsCourseAssigned, useCourseFromAlgolia } from '../../data';

jest.mock('../CourseRunCards', () => function CourseRunCards() {
  return <p>Cards</p>;
});
jest.mock('../../SubsidyRequestButton', () => function SubsidyRequestButton() {
  return <p>SubsidyRequestButton</p>;
});
jest.mock('../../LicenseRequestedAlert', () => function LicenseRequestedAlert() {
  return <div data-testid="license-requested-alert" />;
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
  useCourseMetadata: jest.fn(),
  useCourseRedemptionEligibility: jest.fn(),
  useEnterpriseCustomerContainsContentSuspense: jest.fn(),
  useIsAssignmentsOnlyLearner: jest.fn(),
  useCourseReviews: jest.fn(),
  usePassLearnerCsodParams: jest.fn(),
  useRedeemablePolicies: jest.fn(),
}));

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  useIsCourseAssigned: jest.fn(),
  useCourseFromAlgolia: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCustomerWithDisabledSearch = enterpriseCustomerFactory({
  disable_search: true,
});

const defaultCourseEnrollmentsState = {
  enterpriseCourseEnrollments: [],
  allEnrollmentsByStatus: {
    inProgress: [],
    upcoming: [],
    completed: [],
    savedForLater: [],
    requested: [],
    assigned: [],
  },
};

const mockCourseRun = {
  isEnrollable: true,
  key: 'test-course-run-key',
  pacingType: COURSE_PACING_MAP.SELF_PACED,
  start: '2020-09-09T04:00:00Z',
  availability: 'Current',
  courseUuid: 'Foo',
};
const mockArchivedCourseRun = {
  ...mockCourseRun,
  availability: 'Archived',
};
const mockCourseMetadata = {
  key: 'test-course-key',
  subjects: [{
    name: 'Test Subject 1',
    slug: 'test-subject-slug',
  }],
  shortDescription: 'Course short description.',
  title: 'Test Course Title',
  owners: [TEST_OWNER],
  programs: [],
  image: {
    src: 'http://test-image.url',
  },
  skills: [],
  activeCourseRun: mockCourseRun,
  courseRuns: [mockCourseRun],
};
const mockArchivedCourseMetadata = {
  ...mockCourseMetadata,
  courseRuns: [mockArchivedCourseRun],
  activeCourseRun: mockArchivedCourseRun,
};
const mockCourseReviews = {
  course_key: 'test-course-run-key',
  reviewsCount: 345,
  avgCourseRating: 3,
  confidentLearnersPercentage: 33,
  mostCommonGoal: 'Job advancement',
  mostCommonGoalLearnersPercentage: 34,
  totalEnrollments: 4444,
};
const mockEnterpriseCourseEnrollment = {
  id: 1,
  isEnrollmentActive: true,
  isRevoked: false,
  courseRunId: 'test-course-run-key',
  linkToCourse: 'http://course.url',
  mode: COURSE_MODES_MAP.VERIFIED,
};

const mockBaseRedeemablePolicies = {
  redeemablePolicies: [],
  expiredPolicies: [],
  unexpiredPolicies: [],
  learnerContentAssignments: {
    assignments: [],
    hasAssignments: false,
    allocatedAssignments: [],
    hasAllocatedAssignments: false,
    acceptedAssignments: [],
    hasAcceptedAssignments: false,
    canceledAssignments: [],
    hasCanceledAssignments: false,
    expiredAssignments: [],
    hasExpiredAssignments: false,
    erroredAssignments: [],
    hasErroredAssignments: false,
    assignmentsForDisplay: [],
    hasAssignmentsForDisplay: false,
  },
};

const mockAuthenticatedUser = authenticatedUserFactory();
const CourseHeaderWrapper = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
      <CourseHeader />
    </AppContext.Provider>
  </IntlProvider>
);

describe('<CourseHeader />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ courseKey: 'edX+DemoX' });
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useEnterpriseCourseEnrollments.mockReturnValue({
      data: defaultCourseEnrollmentsState,
    });
    useCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
    useCourseRedemptionEligibility.mockReturnValue({ data: { isPolicyRedemptionEnabled: false } });
    useEnterpriseCustomerContainsContentSuspense.mockReturnValue({
      data: {
        containsContentItems: true,
        catalogList: ['test-enterprise-catalog-uuid'],
      },
    });
    useIsAssignmentsOnlyLearner.mockReturnValue(false);
    useIsCourseAssigned.mockReturnValue(false);
    useCourseFromAlgolia.mockReturnValue({ algoliaCourse: null, isLoading: false });
    useCourseReviews.mockReturnValue({ data: mockCourseReviews });
    useRedeemablePolicies.mockReturnValue({ data: mockBaseRedeemablePolicies });
  });

  test('renders breadcrumb', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseMetadata.key}`],
    });
    expect(screen.getByText('Find a Course')).toBeInTheDocument();
    expect(screen.getByText(mockCourseMetadata.title, { selector: 'li' })).toBeInTheDocument();
  });

  test('does not render breadcrumb when search is disabled for customer', () => {
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithDisabledSearch });
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomerWithDisabledSearch.slug}/course/${mockCourseMetadata.key}`],
    });
    expect(screen.queryByText('Find a Course')).not.toBeInTheDocument();
    expect(screen.queryByText(mockCourseMetadata.title, { selector: 'li' })).not.toBeInTheDocument();
  });

  test('renders course title and short description', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseMetadata.key}`],
    });
    const { title, shortDescription } = mockCourseMetadata;
    expect(screen.getByText(title, { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByText(shortDescription)).toBeInTheDocument();
  });

  test('renders course reviews section', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseMetadata.key}`],
    });
    expect(screen.getByText('average rating')).toBeInTheDocument();
    expect(screen.getByText('learners took this course in the last 12 months')).toBeInTheDocument();
    expect(screen.getByText('for this course on a 5-star scale')).toBeInTheDocument();
  });

  test('renders course reviews section and change the review information content', async () => {
    const user = userEvent.setup();
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseMetadata.key}`],
    });

    await user.click(screen.queryByTestId('average-rating'));
    expect(screen.getByText('learners have rated this course in a post completion survey.', { exact: false })).toBeInTheDocument();
    await user.click(screen.queryByTestId('confident-learners'));
    expect(screen.getByText('that the learning they did in the course will help them reach their goals.', { exact: false })).toBeInTheDocument();
    await user.click(screen.queryByTestId('most-common-goal-learners'));
    expect(screen.getByText('We asked learners who enrolled in this course to choose the reason for taking it.', { exact: false })).toBeInTheDocument();
    await user.click(screen.queryByTestId('demand-and-growth'));
    expect(screen.getByText('learners took this course in the past year.')).toBeInTheDocument();
  });

  test('does not renders course reviews section', () => {
    useCourseReviews.mockReturnValue({ data: null });
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseMetadata.key}`],
    });
    expect(screen.queryByText('average rating')).not.toBeInTheDocument();
    expect(screen.queryByText('learners took this course in the last 12 months')).not.toBeInTheDocument();
  });

  test('does not renders course reviews section if course not part of catalog', () => {
    useEnterpriseCustomerContainsContentSuspense.mockReturnValue({
      data: {
        containsContentItems: false,
        catalogList: [],
      },
    });
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseMetadata.key}`],
    });

    expect(screen.queryByText('average rating')).not.toBeInTheDocument();
    expect(screen.queryByText('learners took this course in the last 12 months')).not.toBeInTheDocument();
  });

  test('renders course image', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseMetadata.key}`],
    });
    expect(screen.queryByAltText('course preview')).toBeInTheDocument();
  });

  test('renders partners', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseMetadata.key}`],
    });
    const partner = mockCourseMetadata.owners[0];
    expect(screen.queryByAltText(`${partner.name} logo`)).toBeInTheDocument();
  });

  test('renders not in catalog messaging', () => {
    useEnterpriseCustomerContainsContentSuspense.mockReturnValue({
      data: {
        containsContentItems: false,
        catalogList: [],
      },
    });

    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseMetadata.key}`],
    });

    const messaging = 'This course is not part of your organization\'s curated course catalog.';
    expect(screen.getByText(messaging)).toBeInTheDocument();
    expect(screen.queryByText('Cards')).not.toBeInTheDocument();
  });

  test.each`
    enrollmentFailed  | failureReason
    ${''}             | ${''}
    ${''}             | ${'dsc_denied'}
  `(
    'does not render alert when `enrollment_failed=$enrollmentFailed` or `failure_reason=$failureReason`',
    ({ enrollmentFailed, failureReason }) => {
      renderWithRouterProvider({
        path: '/:enterpriseSlug/course/:courseKey',
        element: <CourseHeaderWrapper />,
      }, {
        initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseMetadata.key}?enrollment_failed=${enrollmentFailed}&failure_reason=${failureReason}`],
      });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    },
  );

  test.each`
    enrollmentFailed  | failureReason                   | expectedMessage
    ${'true'}         | ${'dsc_denied'}                 | ${'accept the data sharing consent'}
    ${'true'}         | ${'verified_mode_unavailable'}  | ${'verified course mode is unavailable'}
    ${'true'}         | ${''}                           | ${'not enrolled'}
  `(
    'renders $failureReason alert with `enrollment_failed=$enrollmentFailed` and `failure_reason=$failureReason`',
    ({ enrollmentFailed, failureReason, expectedMessage }) => {
      let mockedSearchString = `?enrollment_failed=${enrollmentFailed}`;
      if (failureReason) {
        mockedSearchString += `&failure_reason=${failureReason}`;
      }
      renderWithRouterProvider({
        path: '/:enterpriseSlug/course/:courseKey',
        element: <CourseHeaderWrapper />,
      }, {
        initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseMetadata.key}${mockedSearchString}`],
      });
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(expectedMessage, { exact: false })).toBeInTheDocument();
    },
  );

  test('renders archived warning', () => {
    useCourseMetadata.mockReturnValue({ data: mockArchivedCourseMetadata });
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockArchivedCourseMetadata.key}`],
    });
    const messaging = 'This course is not part of your organization\'s curated course catalog.';
    expect(screen.queryByText(messaging)).not.toBeInTheDocument();
    expect(screen.getByText('This course is archived.')).toBeInTheDocument();
  });

  test('renders SubsidyRequestButton for non-archived courses', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseMetadata.key}`],
    });

    expect(screen.getByText('SubsidyRequestButton')).toBeInTheDocument();
  });

  test('does not render SubsidyRequestButton for archived courses', () => {
    useCourseMetadata.mockReturnValue({ data: mockArchivedCourseMetadata });

    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockArchivedCourseMetadata.key}`],
    });

    expect(screen.queryByText('SubsidyRequestButton')).not.toBeInTheDocument();
  });

  test('renders view course materials button if previously enrolled', () => {
    useCourseMetadata.mockReturnValue({ data: mockArchivedCourseMetadata });
    useEnterpriseCourseEnrollments.mockReturnValue({
      data: {
        enterpriseCourseEnrollments: [mockEnterpriseCourseEnrollment],
        allEnrollmentsByStatus: {
          inProgress: [mockEnterpriseCourseEnrollment],
        },
      },
    });
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockArchivedCourseMetadata.key}`],
    });
    expect(screen.getByText('This course is archived.')).toBeInTheDocument();
    const button = screen.getByText('View course materials');
    expect(button).toBeInTheDocument();
    const href = button.getAttribute('href');
    expect(href).toEqual('http://course.url');
  });

  describe('renders program messaging', () => {
    const mockCourseMetadataWithProgramType = (type) => {
      useCourseMetadata.mockReturnValue({
        data: {
          ...mockCourseMetadata,
          programs: [{ type }],
        },
      });
    };

    test.each(generateTestPermutations({
      programType: ['MicroMasters', 'Professional Certificate', 'XSeries'],
      enablePrograms: [false, true],
    }))('appropriately handles program messaging for program type and enablePrograms (%s)', async ({
      programType,
      enablePrograms,
    }) => {
      const mockCustomerDisabledPrograms = { ...mockEnterpriseCustomer, enablePrograms };
      useEnterpriseCustomer.mockReturnValue({ data: mockCustomerDisabledPrograms });
      mockCourseMetadataWithProgramType(programType);
      renderWithRouterProvider({
        path: '/:enterpriseSlug/course/:courseKey',
        element: <CourseHeaderWrapper />,
      }, {
        initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseMetadata.key}`],
      });
      const messaging = screen.queryByText(`This course is part of a ${programType}`, { exact: false });
      if (enablePrograms) {
        expect(messaging).toBeInTheDocument();
      } else {
        expect(messaging).not.toBeInTheDocument();
      }
    });
  });
});
