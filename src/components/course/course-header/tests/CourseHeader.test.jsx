import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { camelCaseObject } from '@edx/frontend-platform';
import { Factory } from 'rosie';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy/UserSubsidy';
import { CourseContextProvider } from '../../CourseContextProvider';
import { SubsidyRequestsContext } from '../../../enterprise-subsidy-requests';
import CourseHeader from '../CourseHeader';

import { COURSE_PACING_MAP } from '../../data/constants';
import { TEST_OWNER } from '../../tests/data/constants';
import { CourseEnrollmentsContext } from '../../../dashboard/main-content/course-enrollments/CourseEnrollmentsContextProvider';
import { emptyRedeemableLearnerCreditPolicies, useEnterpriseCourseEnrollments, useEnterpriseCustomer } from '../../../app/data';
import { SUBSIDY_TYPE } from '../../../../constants';
import { renderWithRouterProvider } from '../../../../utils/tests';

// Stub out the enroll button to avoid testing its implementation here
jest.mock('../CourseRunCards', () => function CourseRunCards() {
  return <p>Cards</p>;
});
jest.mock('../../SubsidyRequestButton', () => function SubsidyRequestButton() {
  return <p>SubsidyRequestButton</p>;
});

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
}));

const mockEnterpriseCustomer = camelCaseObject(Factory.build('enterpriseCustomer'));
const mockEnterpriseCustomerWithDisabledSearch = camelCaseObject(Factory.build('enterpriseCustomer', {
  disableSearch: true,
}));

const defaultSubsidyRequestsState = {
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
  catalogsForSubsidyRequests: [],
};

const defaultCourseEnrollmentsState = {
  allEnrollmentsByStatus: {
    inProgress: [],
    upcoming: [],
    completed: [],
    savedForLater: [],
    requested: [],
    assigned: [],
  },
};

const defaultCourseState = {
  course: {
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
  },
  activeCourseRun: {
    isEnrollable: true,
    key: 'test-course-run-key',
    pacingType: COURSE_PACING_MAP.SELF_PACED,
    start: '2020-09-09T04:00:00Z',
    availability: 'Current',
    courseUuid: 'Foo',
  },
  userEnrollments: [],
  userEntitlements: [],
  catalog: {
    containsContentItems: true,
    catalogList: ['catalog-uuid'],
  },
  courseReviews: {
    course_key: 'test-course-run-key',
    reviewsCount: 345,
    avgCourseRating: 3,
    confidentLearnersPercentage: 33,
    mostCommonGoal: 'Job advancement',
    mostCommonGoalLearnersPercentage: 34,
    totalEnrollments: 4444,
  },
  courseRecommendations: { allRecommendations: [], samePartnerRecommendations: [] },
};

const archivedCourseState = {
  ...defaultCourseState,
  course: {
    subjects: [{
      name: 'Old course',
      slug: 'old-course-slug',
    }],
    key: 'old-course-key',
    shortDescription: 'teeny tiny short description',
    title: 'Wow what a nice course this is!',
    owners: [TEST_OWNER],
    programs: [],
    image: {
      src: 'http://test-image.url',
    },
    skills: [],
    courseRuns: [
      {
        key: 'test-course-run-key',
        availability: 'Archived',
      },

    ],
  },
  activeCourseRun: {
    isEnrollable: true,
    key: 'test-course-run-key',
    pacingType: COURSE_PACING_MAP.SELF_PACED,
    start: '2020-09-09T04:00:00Z',
    availability: 'Archived',
    courseUuid: 'Foo',
  },
  userEnrollments: [],
  userEntitlements: [],
  catalog: {
    containsContentItems: false,
    catalogList: [],
  },
  courseRunKeys: ['test-course-run-key'],
  courseRunStatuses: ['archived'],
};

const defaultUserSubsidyState = {
  subscriptionLicense: {
    uuid: 'test-license-uuid',
  },
  couponCodes: {
    couponCodes: [],
    couponCodesCount: 0,
  },
  redeemableLearnerCreditPolicies: emptyRedeemableLearnerCreditPolicies,
};

const CourseHeaderWrapper = ({
  initialCourseEnrollmentsState = defaultCourseEnrollmentsState,
  courseState = defaultCourseState,
  initialUserSubsidyState = defaultUserSubsidyState,
  initialSubsidyRequestsState = defaultSubsidyRequestsState,
}) => (
  <IntlProvider locale="en">
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
        <CourseEnrollmentsContext.Provider value={initialCourseEnrollmentsState}>
          <CourseContextProvider courseState={courseState}>
            <CourseHeader />
          </CourseContextProvider>
        </CourseEnrollmentsContext.Provider>
      </SubsidyRequestsContext.Provider>
    </UserSubsidyContext.Provider>
  </IntlProvider>
);

describe('<CourseHeader />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useEnterpriseCourseEnrollments.mockReturnValue({ data: defaultCourseEnrollmentsState });
  });

  test('renders breadcrumb', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}`],
    });
    expect(screen.queryByText('Find a Course')).toBeInTheDocument();
    expect(screen.queryAllByText(defaultCourseState.course.title)[0]).toBeInTheDocument();
  });

  test('does not render breadcrumb when search is disabled for customer', () => {
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithDisabledSearch });
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomerWithDisabledSearch.slug}/course/${defaultCourseState.course.key}`],
    });
    expect(screen.queryByText('Find a Course')).toBeFalsy();
    expect(screen.queryAllByText(defaultCourseState.course.title)[0]).toBeInTheDocument();
  });

  test('renders course title and short description', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}`],
    });

    const { title, shortDescription } = defaultCourseState.course;
    expect(screen.queryAllByText(title)[1]).toBeInTheDocument();
    expect(screen.queryByText(shortDescription)).toBeInTheDocument();
  });

  test('renders course reviews section', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}`],
    });

    expect(screen.queryByText('average rating')).toBeInTheDocument();
    expect(screen.queryByText('learners took this course in the last 12 months')).toBeInTheDocument();
    expect(screen.getByText('for this course on a 5-star scale')).toBeInTheDocument();
  });

  test('renders course reviews section and change the review information content', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}`],
    });

    userEvent.click(screen.queryByTestId('average-rating'));
    expect(screen.getByText('learners have rated this course in a post completion survey.', { exact: false })).toBeInTheDocument();
    userEvent.click(screen.queryByTestId('confident-learners'));
    expect(screen.getByText('that the learning they did in the course will help them reach their goals.', { exact: false })).toBeInTheDocument();
    userEvent.click(screen.queryByTestId('most-common-goal-learners'));
    expect(screen.getByText('We asked learners who enrolled in this course to choose the reason for taking it.', { exact: false })).toBeInTheDocument();
    userEvent.click(screen.queryByTestId('demand-and-growth'));
    expect(screen.getByText('learners took this course in the past year.')).toBeInTheDocument();
  });

  test('does not renders course reviews section', () => {
    const courseStateWithNoCourseReviews = {
      ...defaultCourseState,
      courseReviews: null,
    };
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper courseState={courseStateWithNoCourseReviews} />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}`],
    });

    expect(screen.queryByText('average rating')).not.toBeInTheDocument();
    expect(screen.queryByText('learners took this course in the last 12 months')).not.toBeInTheDocument();
  });

  test('does not renders course reviews section if course not part of catalog', () => {
    const courseStateWithNoCourseReviews = {
      ...defaultCourseState,
      catalog: {
        containsContentItems: false,
        catalogList: [],
      },
    };
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper courseState={courseStateWithNoCourseReviews} />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}`],
    });

    expect(screen.queryByText('average rating')).not.toBeInTheDocument();
    expect(screen.queryByText('learners took this course in the last 12 months')).not.toBeInTheDocument();
  });

  test('renders course image', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}`],
    });
    expect(screen.queryByAltText('course preview')).toBeInTheDocument();
  });

  test('renders partners', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}`],
    });
    const partner = defaultCourseState.course.owners[0];
    expect(screen.queryByAltText(`${partner.name} logo`)).toBeInTheDocument();
  });

  test('renders not in catalog messaging', () => {
    const courseStateWithNoCatalog = {
      ...defaultCourseState,
      catalog: {
        containsContentItems: false,
        catalogList: [],
      },
    };

    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper courseState={courseStateWithNoCatalog} />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}`],
    });

    const messaging = 'This course is not part of your company\'s curated course catalog.';
    expect(screen.queryByText(messaging)).toBeInTheDocument();

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
        initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}?enrollment_failed=${enrollmentFailed}&failure_reason=${failureReason}`],
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
        initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}${mockedSearchString}`],
      });
      expect(screen.queryByRole('alert')).toBeInTheDocument();
      expect(screen.queryByText(expectedMessage, { exact: false })).toBeInTheDocument();
    },
  );

  test('renders archived warning', () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper courseState={archivedCourseState} />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}`],
    });
    const messaging = 'This course is not part of your company\'s curated course catalog.';
    expect(screen.queryByText(messaging)).not.toBeInTheDocument();
    expect(screen.queryByText('This course is archived.')).toBeInTheDocument();
  });

  test('renders view course materials button if previously enrolled', () => {
    const courseStateWithEnrollment = {
      ...archivedCourseState,
      userEnrollments: [
        {
          id: 1,
          isEnrollmentActive: true,
          isRevoked: false,
          courseRunId: 'test-course-run-key',
          courseRunUrl: 'http://course.url',
          mode: 'verified',
        },
      ],
    };
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <CourseHeaderWrapper courseState={courseStateWithEnrollment} />,
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}`],
    });
    expect(screen.queryByText('This course is archived.')).toBeInTheDocument();
    const button = screen.queryByText('View course materials');
    expect(button).toBeInTheDocument();
    const href = button.closest('a').getAttribute('href');
    expect(href).toEqual('http://course.url');
  });

  describe('renders program messaging', () => {
    const courseStateWithProgramType = (type) => ({
      ...defaultCourseState,
      course: {
        ...defaultCourseState.course,
        programs: [{
          type,
        }],
      },
    });

    test('MicroMasters', () => {
      const micromasters = 'MicroMasters';
      renderWithRouterProvider({
        path: '/:enterpriseSlug/course/:courseKey',
        element: <CourseHeaderWrapper courseState={courseStateWithProgramType(micromasters)} />,
      }, {
        initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}`],
      });

      const messaging = `This course is part of a ${micromasters}`;
      expect(screen.queryByText(messaging, { exact: false })).toBeInTheDocument();
    });

    test('Professional Certificate', () => {
      const profCert = 'Professional Certificate';
      renderWithRouterProvider({
        path: '/:enterpriseSlug/course/:courseKey',
        element: <CourseHeaderWrapper courseState={courseStateWithProgramType(profCert)} />,
      }, {
        initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${defaultCourseState.course.key}`],
      });
      const messaging = `This course is part of a ${profCert}`;
      expect(screen.queryByText(messaging, { exact: false })).toBeInTheDocument();
    });
  });
});
