import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { CourseContextProvider } from '../../course/CourseContextProvider';
import * as hooks from '../main-content/course-enrollments/data/hooks';

import {
  renderWithRouter,
} from '../../../utils/tests';
import Dashboard from '../Dashboard';
import { TEST_OWNER } from '../../course/tests/data/constants';
import { COURSE_PACING_MAP } from '../../course/data/constants';
import CourseEnrollmentsContextProvider from '../main-content/course-enrollments/CourseEnrollmentsContextProvider';

const defaultOffersState = {
  offers: [],
  loading: false,
  offersCount: 0,
};

const mockAuthenticatedUser = { username: 'myspace-tom', name: 'John Doe' };

const defaultAppState = {
  enterpriseConfig: {
    name: 'BearsRUs',
    uuid: 'BearsRUs',
    disableSearch: false,
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: mockAuthenticatedUser,
};

const defaultUserSubsidyState = {
  offers: defaultOffersState,
};

const defaultCourseState = {
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
  },
};

const mockLocation = {
  pathname: '/welcome',
  hash: '',
  search: '',
  state: { activationSuccess: true },
};

/* eslint-disable react/prop-types */
const DashboardWithContext = ({
  initialAppState = defaultAppState,
  initialUserSubsidyState = defaultUserSubsidyState,
  initialCourseState = defaultCourseState,
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <CourseEnrollmentsContextProvider>
        <CourseContextProvider initialState={initialCourseState}>
          <Dashboard />
        </CourseContextProvider>
      </CourseEnrollmentsContextProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => (mockLocation),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => mockAuthenticatedUser,
}));

jest.mock('universal-cookie');
jest.mock('../main-content/course-enrollments/data/hooks');
hooks.useCourseEnrollments.mockReturnValue({
  courseEnrollmentsByStatus: {
    inProgress: [],
    upcoming: [],
    completed: [],
    savedForLater: [],
    requested: [],
  },
  programEnrollments: [],
});

// eslint-disable-next-line no-console
console.error = jest.fn();

describe('<Dashboard />', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders user first name if available', () => {
    renderWithRouter(<DashboardWithContext />);
    expect(screen.getByText('Welcome, John!'));
  });

  it('does not render user first name if not available', () => {
    const appState = {
      ...defaultAppState,
      authenticatedUser: {
        ...defaultAppState.authenticatedUser,
        name: '',
      },
    };
    renderWithRouter(<DashboardWithContext initialAppState={appState} />);
    expect(screen.getByText('Welcome!'));
  });
});
