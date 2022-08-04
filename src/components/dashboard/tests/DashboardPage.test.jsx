import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, fireEvent } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
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
import * as hooks from '../main-content/course-enrollments/data/hooks';

import {
  renderWithRouter,
} from '../../../utils/tests';
import DashboardPage, { LICENCE_ACTIVATION_MESSAGE } from '../DashboardPage';
import { TEST_OWNER } from '../../course/tests/data/constants';
import { COURSE_PACING_MAP } from '../../course/data/constants';
import CourseEnrollmentsContextProvider from '../main-content/course-enrollments/CourseEnrollmentsContextProvider';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { SUBSIDY_TYPE } from '../../enterprise-subsidy-requests/constants';

const defaultCouponCodesState = {
  couponCodes: [],
  loading: false,
  couponCodesCount: 0,
};

const mockAuthenticatedUser = { username: 'myspace-tom', name: 'John Doe' };

const defaultAppState = {
  enterpriseConfig: {
    name: 'BearsRUs',
    uuid: 'BearsRUs',
    disableSearch: false,
    adminUsers: [{ email: 'admin@foo.com' }],
  },
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: mockAuthenticatedUser,
};

const defaultUserSubsidyState = {
  couponCodes: defaultCouponCodesState,
  enterpriseOffers: [],
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

const defaultSubsidyRequestState = {
  subsidyRequestConfiguration: null,
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
  catalogsForSubsidyRequests: [],
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

/* eslint-disable react/prop-types */
function DashboardWithContext({
  initialAppState = defaultAppState,
  initialUserSubsidyState = defaultUserSubsidyState,
  initialCourseState = defaultCourseState,
  initialSubsidyRequestState = defaultSubsidyRequestState,
}) {
  return (
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <SubsidyRequestsContext.Provider value={initialSubsidyRequestState}>
          <CourseEnrollmentsContextProvider>
            <CourseContextProvider initialState={initialCourseState}>
              <DashboardPage />
            </CourseContextProvider>
          </CourseEnrollmentsContextProvider>
        </SubsidyRequestsContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  );
}
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

  it('renders license activation alert on activation success', () => {
    renderWithRouter(
      <DashboardWithContext />,
      { route: '/?activationSuccess=true' },
    );
    expect(screen.getByText(LICENCE_ACTIVATION_MESSAGE));
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
    expect(screen.getByTestId('sidebar'));
  });

  it('renders subsidies summary on a small screen', () => {
    window.matchMedia.setConfig({ ...mockWindowConfig, width: breakpoints.large.minWidth - 1 });
    renderWithRouter(
      <DashboardWithContext initialUserSubsidyState={{
        ...defaultUserSubsidyState,
        subscriptionPlan: {
          daysUntilExpiration: 60,
        },
        subscriptionLicense: { status: LICENSE_STATUS.ACTIVATED },
      }}
      />,
    );
    expect(screen.getByTestId('subsidies-summary'));
  });

  it('renders "Find a course" when search is enabled for the customer', () => {
    renderWithRouter(
      <DashboardWithContext />,
    );
    expect(screen.getByText('Find a course'));
  });

  it('does not render "Find a course" when search is disabled for the customer', () => {
    const appState = {
      enterpriseConfig: {
        name: 'BearsRUs',
        uuid: 'BearsRUs',
        disableSearch: true,
        adminUsers: [{ email: 'admin@foo.com' }],
      },
      config: {
        LMS_BASE_URL: process.env.LMS_BASE_URL,
      },
    };
    renderWithRouter(
      <DashboardWithContext
        initialAppState={appState}
      />,
    );
    expect(screen.queryByText('Find a course')).toBeFalsy();
  });

  it('Renders all tabs for progress in dashboard page', () => {
    renderWithRouter(
      <DashboardWithContext />,
    );
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Programs')).toBeInTheDocument();
  });

  it('Selects courses tab from progress tabs by default', () => {
    renderWithRouter(
      <DashboardWithContext />,
    );
    const coursesTab = screen.getByText('Courses');
    const programsTab = screen.getByText('Programs');
    expect(coursesTab).toHaveAttribute('aria-selected', 'true');
    expect(programsTab).toHaveAttribute('aria-selected', 'false');
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
        ...defaultUserSubsidyState,
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
      expect(mockSetCookies).toHaveBeenCalledWith(`${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}60-${defaultAppState.enterpriseConfig.uuid}-${subscriptionPlanId}`, true, { sameSite: 'strict' });
    });

    it('should not show the modal if 60 >= daysUntilExpiration > 30 and the 60 day cookie has been set', () => {
      Cookies.mockReturnValue({ get: () => 'cookie' });
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
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });

    it('should set the 30 day cookie when closed for the 30 day threshold', () => {
      const mockSetCookies = jest.fn();
      Cookies.mockReturnValue({ get: () => null, set: mockSetCookies });

      const subscriptionPlanId = 'expiring-plan-30';
      const expiringSubscriptionUserSubsidyState = {
        ...defaultUserSubsidyState,
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
      expect(mockSetCookies).toHaveBeenCalledWith(`${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}30-${defaultAppState.enterpriseConfig.uuid}-${subscriptionPlanId}`, true, { sameSite: 'strict' });
    });

    it('should not show the modal if 30 >= daysUntilExpiration > 0 and the 30 day cookie has been set', () => {
      Cookies.mockReturnValue({ get: () => 'cookie' });
      const expiringSubscriptionUserSubsidyState = {
        ...defaultUserSubsidyState,
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
