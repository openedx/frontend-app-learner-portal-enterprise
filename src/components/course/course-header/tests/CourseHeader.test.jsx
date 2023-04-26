import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { useLocation } from 'react-router-dom';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { UserSubsidyContext } from '../../../enterprise-user-subsidy/UserSubsidy';
import { CourseContextProvider } from '../../CourseContextProvider';
import { SubsidyRequestsContext, SUBSIDY_TYPE } from '../../../enterprise-subsidy-requests';
import CourseHeader from '../CourseHeader';

import { COURSE_PACING_MAP } from '../../data/constants';
import { TEST_OWNER } from '../../tests/data/constants';
import { CourseEnrollmentsContext } from '../../../dashboard/main-content/course-enrollments/CourseEnrollmentsContextProvider';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));
useLocation.mockImplementation(() => ({
  search: '',
}));

// Stub out the enroll button to avoid testing its implementation here
jest.mock('../CourseRunCards', () => ({
  default: () => <p>Cards</p>,
  Deprecated: () => <p>Deprecated cards</p>,
}));
jest.mock('../../SubsidyRequestButton', () => function SubsidyRequestButton() {
  return <p>SubsidyRequestButton</p>;
});

const defaultSubsidyRequestsState = {
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
  catalogsForSubsidyRequests: [],
};

const defaultCourseEnrollmentsState = {
  courseEnrollmentsByStatus: {
    inProgress: [],
    upcoming: [],
    completed: [],
    savedForLater: [],
    requested: [],
  },
};

const CourseHeaderWrapper = ({
  initialAppState = {},
  initialCourseEnrollmentsState = defaultCourseEnrollmentsState,
  initialCourseState = {},
  initialUserSubsidyState = {},
  initialSubsidyRequestsState = defaultSubsidyRequestsState,
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
        <CourseEnrollmentsContext.Provider value={initialCourseEnrollmentsState}>
          <CourseContextProvider initialState={initialCourseState}>
            <CourseHeader />
          </CourseContextProvider>
        </CourseEnrollmentsContext.Provider>
      </SubsidyRequestsContext.Provider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);

describe('<CourseHeader />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
    },
  };
  const initialCourseState = {
    course: {
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
  };
  const initialUserSubsidyState = {
    subscriptionLicense: {
      uuid: 'test-license-uuid',
    },
    couponCodes: {
      couponCodes: [],
      couponCodesCount: 0,
    },
  };

  test('renders breadcrumb', () => {
    render(
      <CourseHeaderWrapper
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    expect(screen.queryByText('Find a Course')).toBeInTheDocument();
    expect(screen.queryAllByText(initialCourseState.course.title)[0]).toBeInTheDocument();
  });

  test('does not render breadcrumb when search is disabled for customer', () => {
    render(
      <CourseHeaderWrapper
        initialAppState={{ enterpriseConfig: { disableSearch: true } }}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    expect(screen.queryByText('Find a Course')).toBeFalsy();
    expect(screen.queryAllByText(initialCourseState.course.title)[0]).toBeInTheDocument();
  });

  test('renders course title and short description', () => {
    render(
      <CourseHeaderWrapper
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    const { title, shortDescription } = initialCourseState.course;
    expect(screen.queryAllByText(title)[1]).toBeInTheDocument();
    expect(screen.queryByText(shortDescription)).toBeInTheDocument();
  });

  test('renders course reviews section', () => {
    render(
      <CourseHeaderWrapper
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.queryByText('average rating')).toBeInTheDocument();
    expect(screen.queryByText('learners took this course in the last 12 months')).toBeInTheDocument();
    expect(screen.getByText('learner took this course in the past year.')).toBeInTheDocument();
    expect(screen.getByText('for this course on a 5-star scale')).toBeInTheDocument();
  });

  test('renders course reviews section and change the review information content', () => {
    render(
      <CourseHeaderWrapper
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    userEvent.click(screen.queryByTestId('average-rating'));
    expect(screen.getByText('learners have rated this course in a post completion survey.', { exact: false })).toBeInTheDocument();
    userEvent.click(screen.queryByTestId('confident-learners'));
    expect(screen.getByText('that the learning they did in the course will help them reach their goals.', { exact: false })).toBeInTheDocument();
    userEvent.click(screen.queryByTestId('most-common-goal-learners'));
    expect(screen.getByText('We asked learners who enrolled in this course to choose the reason for taking it.', { exact: false })).toBeInTheDocument();
    userEvent.click(screen.queryByTestId('demand-and-growth'));
    expect(screen.getByText('learner took this course in the past year.')).toBeInTheDocument();
  });

  test('does not renders course reviews section', () => {
    const courseStateWithNoCourseReviews = {
      ...initialCourseState,
      courseReviews: null,
    };
    render(
      <CourseHeaderWrapper
        initialAppState={initialAppState}
        initialCourseState={courseStateWithNoCourseReviews}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.queryByText('average rating')).not.toBeInTheDocument();
    expect(screen.queryByText('learners took this course in the last 12 months')).not.toBeInTheDocument();
  });

  test('does not renders course reviews section if course not part of catalog', () => {
    const courseStateWithNoCourseReviews = {
      ...initialCourseState,
      catalog: {
        containsContentItems: false,
        catalogList: [],
      },
    };
    render(
      <CourseHeaderWrapper
        initialAppState={initialAppState}
        initialCourseState={courseStateWithNoCourseReviews}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.queryByText('average rating')).not.toBeInTheDocument();
    expect(screen.queryByText('learners took this course in the last 12 months')).not.toBeInTheDocument();
  });

  test('renders deprecated course run cards', () => {
    render(
      <CourseHeaderWrapper
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );
    expect(screen.queryByText('Deprecated cards')).toBeInTheDocument();
  });

  test('renders course image', () => {
    render(
      <CourseHeaderWrapper
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    expect(screen.queryByAltText('course preview')).toBeInTheDocument();
  });

  test('renders partners', () => {
    render(
      <CourseHeaderWrapper
        initialAppState={initialAppState}
        initialCourseState={initialCourseState}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

    const partner = initialCourseState.course.owners[0];
    expect(screen.queryByAltText(`${partner.name} logo`)).toBeInTheDocument();
  });

  test('renders not in catalog messaging', () => {
    const courseStateWithNoCatalog = {
      ...initialCourseState,
      catalog: {
        containsContentItems: false,
        catalogList: [],
      },
    };

    render(
      <CourseHeaderWrapper
        initialAppState={initialAppState}
        initialCourseState={courseStateWithNoCatalog}
        initialUserSubsidyState={initialUserSubsidyState}
      />,
    );

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
      useLocation.mockImplementation(() => ({
        search: `?enrollment_failed=${enrollmentFailed}&failure_reason=${failureReason}`,
      }));

      render(
        <CourseHeaderWrapper
          initialAppState={initialAppState}
          initialCourseState={initialCourseState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
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
      useLocation.mockImplementation(() => ({
        search: mockedSearchString,
      }));

      render(
        <CourseHeaderWrapper
          initialAppState={initialAppState}
          initialCourseState={initialCourseState}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );
      expect(screen.queryByRole('alert')).toBeInTheDocument();
      expect(screen.queryByText(expectedMessage, { exact: false })).toBeInTheDocument();
    },
  );

  describe('renders program messaging', () => {
    const courseStateWithProgramType = (type) => ({
      ...initialCourseState,
      course: {
        ...initialCourseState.course,
        programs: [{
          type,
        }],
      },
    });

    test('MicroMasters', () => {
      const micromasters = 'MicroMasters';

      render(
        <CourseHeaderWrapper
          initialAppState={initialAppState}
          initialCourseState={courseStateWithProgramType(micromasters)}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      const messaging = `This course is part of a ${micromasters}`;
      expect(screen.queryByText(messaging, { exact: false })).toBeInTheDocument();
    });

    test('Professional Certificate', () => {
      const profCert = 'Professional Certificate';

      render(
        <CourseHeaderWrapper
          initialAppState={initialAppState}
          initialCourseState={courseStateWithProgramType(profCert)}
          initialUserSubsidyState={initialUserSubsidyState}
        />,
      );

      const messaging = `This course is part of a ${profCert}`;
      expect(screen.queryByText(messaging, { exact: false })).toBeInTheDocument();
    });
  });
});
