import React from 'react';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import { screen, fireEvent } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { Provider as ReduxProvider } from 'react-redux';
import { breakpoints } from '@edx/paragon';
import Cookies from 'universal-cookie';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { CourseContextProvider } from '../../course/CourseContextProvider';
import {
  SUBSCRIPTION_EXPIRED_MODAL_TITLE,
  SUBSCRIPTION_EXPIRING_MODAL_TITLE,
} from '../SubscriptionExpirationModal';
import {
  SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX,
} from '../../../config/constants';
import * as service from '../main-content/course-enrollments/data/service';

import {
  renderWithRouter, fakeReduxStore,
} from '../../../utils/tests';
import Dashboard, { LICENCE_ACTIVATION_MESSAGE } from '../Dashboard';
import { TEST_OWNER } from '../../course/tests/data/constants';
import { COURSE_PACING_MAP } from '../../course/data/constants';

const defaultOffersState = {
  offers: [],
  loading: false,
  offersCount: 0,
};

const defaultAppState = {
  enterpriseConfig: {
    name: 'BearsRUs',
    uuid: 'BearsRUs',
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
};

const defaultUserSubsidyState = {
  hasAccessToPortal: true,
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

const mockWindowConfig = {
  type: 'screen',
  width: breakpoints.large.minWidth + 1,
  height: 800,
};

let mockLocation = {
  pathname: '/welcome',
  hash: '',
  search: '',
  state: { activationSuccess: true },
};

const mockStore = configureMockStore([thunk]);

/* eslint-disable react/prop-types */
const DashboardWithContext = ({
  initialAppState = defaultAppState,
  initialUserSubsidyState = defaultUserSubsidyState,
  initialCourseState = defaultCourseState,
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

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => (mockLocation),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ username: 'myspace-tom' }),
}));

jest.mock('universal-cookie');
jest.mock('../main-content/course-enrollments/data/service');

service.fetchEnterpriseCourseEnrollments.mockResolvedValue(undefined);
// eslint-disable-next-line no-console
console.error = jest.fn();

describe('<Dashboard />', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders license activation alert on activation success', () => {
    renderWithRouter(
      <DashboardWithContext />,
      { route: '/?activationSuccess=true' },
    );
    expect(screen.getByText(LICENCE_ACTIVATION_MESSAGE)).toBeTruthy();
  });

  it('does not render license activation alert without activation success', () => {
    // NOTE: This modifies the original mockLocation
    mockLocation = { ...mockLocation, state: { activationSuccess: false } };
    renderWithRouter(
      <DashboardWithContext />,
    );
    expect(screen.queryByText(LICENCE_ACTIVATION_MESSAGE)).toBeFalsy();
  });

  it('renders a sidebar on a large screen', () => {
    window.matchMedia.setConfig(mockWindowConfig);
    renderWithRouter(
      <DashboardWithContext />,
    );
    expect(screen.getByTestId('sidebar')).toBeTruthy();
  });

  it('renders a sidebar on a small screen', () => {
    window.matchMedia.setConfig({ ...mockWindowConfig, width: breakpoints.large.minWidth - 1 });
    renderWithRouter(
      <DashboardWithContext />,
    );
    expect(screen.getByTestId('sidebar')).toBeTruthy();
  });

  describe('SubscriptionExpirationModal', () => {
    it('should not render when > 60 days of access remain', () => {
      renderWithRouter(
        <DashboardWithContext />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });

    it('should render when 60 >= daysUntilExpiration > 0', () => {
      const expiringSubscriptionUserSubsidyState = {
        ...defaultUserSubsidyState,
        subscriptionPlan: {
          daysUntilExpiration: 60,
        },
        showExpirationNotifications: true,
      };
      renderWithRouter(
        <DashboardWithContext
          initialUserSubsidyState={expiringSubscriptionUserSubsidyState}
        />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeTruthy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });

    it('should render the expired version of the modal when 0 >= daysUntilExpiration', () => {
      const expiringSubscriptionUserSubsidyState = {
        ...defaultUserSubsidyState,
        subscriptionPlan: {
          daysUntilExpiration: 0,
        },
        showExpirationNotifications: true,
      };
      renderWithRouter(
        <DashboardWithContext
          initialUserSubsidyState={expiringSubscriptionUserSubsidyState}
        />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeTruthy();
    });

    it('should not render when 0 >= daysUntilExpiration and expiration messages are disabled ', () => {
      const expiringSubscriptionUserSubsidyState = {
        ...defaultUserSubsidyState,
        subscriptionPlan: {
          daysUntilExpiration: 0,
        },
        showExpirationNotifications: false,
      };
      renderWithRouter(
        <DashboardWithContext
          initialUserSubsidyState={expiringSubscriptionUserSubsidyState}
        />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });

    it('should not render when 60 >= daysUntilExpiration > 0 and expiration messages are disabled', () => {
      const expiringSubscriptionUserSubsidyState = {
        ...defaultUserSubsidyState,
        subscriptionPlan: {
          daysUntilExpiration: 60,
        },
        showExpirationNotifications: false,
      };
      renderWithRouter(
        <DashboardWithContext
          initialUserSubsidyState={expiringSubscriptionUserSubsidyState}

        />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });

    it('should render the expiration warning version of the modal when 60 >= daysUntilExpiration > 0', () => {
      const expiringSubscriptionUserSubsidyState = {
        ...defaultUserSubsidyState,
        subscriptionPlan: {
          daysUntilExpiration: 60,
        },
        showExpirationNotifications: true,
      };
      renderWithRouter(
        <DashboardWithContext
          initialUserSubsidyState={expiringSubscriptionUserSubsidyState}
        />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeTruthy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });

    it('should set the 60 day cookie when closed for the 60 day threshold', () => {
      const mockSetCookies = jest.fn();
      Cookies.mockReturnValue({ get: () => null, set: mockSetCookies });

      const subscriptionPlanId = 'expiring-plan-60';
      const expiringSubscriptionUserSubsidyState = {
        ...defaultOffersState,
        subscriptionPlan: {
          uuid: subscriptionPlanId,
          daysUntilExpiration: 60,
        },
        showExpirationNotifications: true,
      };
      renderWithRouter(
        <DashboardWithContext
          initialUserSubsidyState={expiringSubscriptionUserSubsidyState}
        />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeTruthy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
      const modal = screen.getByRole('dialog');
      fireEvent.click(modal.querySelector('button'));
      expect(mockSetCookies).toHaveBeenCalledWith(
        `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}60-${defaultAppState.enterpriseConfig.uuid}-${subscriptionPlanId}`, true, { sameSite: 'strict' },
      );
    });

    it('should not show the modal if 60 >= daysUntilExpiration > 30 and the 60 day cookie has been set', () => {
      Cookies.mockReturnValue({ get: () => 'cookie' });
      const expiringSubscriptionUserSubsidyState = {
        ...defaultOffersState,
        subscriptionPlan: {
          daysUntilExpiration: 60,
        },
        showExpirationNotifications: true,
      };
      renderWithRouter(
        <DashboardWithContext
          initialUserSubsidyState={expiringSubscriptionUserSubsidyState}
        />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });

    it('should set the 30 day cookie when closed for the 30 day threshold', () => {
      const mockSetCookies = jest.fn();
      Cookies.mockReturnValue({ get: () => null, set: mockSetCookies });

      const subscriptionPlanId = 'expiring-plan-30';
      const expiringSubscriptionUserSubsidyState = {
        ...defaultOffersState,
        subscriptionPlan: {
          uuid: subscriptionPlanId,
          daysUntilExpiration: 30,
        },
        showExpirationNotifications: true,
      };
      renderWithRouter(
        <DashboardWithContext
          initialUserSubsidyState={expiringSubscriptionUserSubsidyState}
        />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeTruthy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
      const modal = screen.getByRole('dialog');
      fireEvent.click(modal.querySelector('button'));
      expect(mockSetCookies).toHaveBeenCalledWith(
        `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}30-${defaultAppState.enterpriseConfig.uuid}-${subscriptionPlanId}`, true, { sameSite: 'strict' },
      );
    });

    it('should not show the modal if 30 >= daysUntilExpiration > 0 and the 30 day cookie has been set', () => {
      Cookies.mockReturnValue({ get: () => 'cookie' });
      const expiringSubscriptionUserSubsidyState = {
        ...defaultOffersState,
        subscriptionPlan: {
          daysUntilExpiration: 30,
        },
        showExpirationNotifications: true,
      };
      renderWithRouter(
        <DashboardWithContext
          initialUserSubsidyState={expiringSubscriptionUserSubsidyState}
        />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });
  });
});
