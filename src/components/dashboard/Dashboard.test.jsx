import React from 'react';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { Provider as ReduxProvider } from 'react-redux';
import { breakpoints } from '@edx/paragon';
import { UserSubsidyContext } from '../enterprise-user-subsidy/UserSubsidy';
import { CourseContextProvider } from '../course/CourseContextProvider';
import { COURSE_PACING_MAP } from '../course/data/constants';
import { TEST_OWNER } from '../course/tests/data/constants';

import {
  renderWithRouter, fakeReduxStore,
} from '../../utils/tests';
import Dashboard, { LICENCE_ACTIVATION_MESSAGE } from './Dashboard';

const mockStore = configureMockStore([thunk]);

/* eslint-disable react/prop-types */
const DashboardWithContext = ({
  initialAppState = {},
  initialUserSubsidyState = {},
  initialCourseState = {},
  initialReduxStore = fakeReduxStore,
}) => (
  <AppContext.Provider value={initialAppState}>
    <UserSubsidyContext.Provider value={initialUserSubsidyState}>
      <CourseContextProvider initialState={initialCourseState}>
        <ReduxProvider store={mockStore(initialReduxStore)}>
          <Dashboard />
        </ReduxProvider>
      </CourseContextProvider>
    </UserSubsidyContext.Provider>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

let mockLocation = {
  pathname: '/welcome',
  hash: '',
  search: '',
  state: { activationSuccess: true },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => (mockLocation),
}));

jest.mock('./sidebar/offers', () => ({
  ...jest.requireActual('./sidebar/offers'),
  fetchOffers: () => ({ type: 'fetch' }),
}));

describe('<Dashboard />', () => {
  const initialAppState = { enterpriseConfig: { name: 'BearsRUs' } };
  const initialUserSubsidyState = { hasAccessToPortal: true };
  const mockWindowConfig = {
    type: 'screen',
    width: breakpoints.large.minWidth + 1,
    height: 800,
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
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders license activation alert on activation success', () => {
    renderWithRouter(
      <DashboardWithContext initialAppState={initialAppState} initialUserSubsidyState={initialUserSubsidyState} />,
      { route: '/?activationSuccess=true' },
    );
    expect(screen.getByText(LICENCE_ACTIVATION_MESSAGE)).toBeTruthy();
  });
  it('does not render license activation alert without activation success', () => {
    // NOTE: This modifies the original mockLocation
    mockLocation = { ...mockLocation, state: { activationSuccess: false } };
    renderWithRouter(
      <DashboardWithContext initialAppState={initialAppState} initialUserSubsidyState={initialUserSubsidyState} />,
    );
    expect(screen.queryByText(LICENCE_ACTIVATION_MESSAGE)).toBeFalsy();
  });
  it('renders a sidebar on a large screen', () => {
    window.matchMedia.setConfig(mockWindowConfig);
    renderWithRouter(
      <DashboardWithContext initialAppState={initialAppState} initialUserSubsidyState={initialUserSubsidyState} />,
    );
    expect(screen.getByTestId('sidebar')).toBeTruthy();
  });
  it('does not render a sidebar on a small screen', () => {
    window.matchMedia.setConfig({ ...mockWindowConfig, width: breakpoints.large.minWidth - 1 });
    renderWithRouter(
      <DashboardWithContext
        initialAppState={initialAppState}
        initialUserSubsidyState={initialUserSubsidyState}
        initialCourseState={initialCourseState}
      />,
    );
    expect(screen.queryByTestId('sidebar')).toBeFalsy();
  });
});
