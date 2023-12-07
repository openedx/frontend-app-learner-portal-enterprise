import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { breakpoints } from '@edx/paragon';
import Cookies from 'universal-cookie';

import userEvent from '@testing-library/user-event';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { CourseContextProvider } from '../../course/CourseContextProvider';
import { SUBSCRIPTION_EXPIRED_MODAL_TITLE, SUBSCRIPTION_EXPIRING_MODAL_TITLE } from '../SubscriptionExpirationModal';
import { SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX } from '../../../config/constants';
import { features } from '../../../config';
import * as hooks from '../main-content/course-enrollments/data/hooks';

import { renderWithRouter } from '../../../utils/tests';
import DashboardPage from '../DashboardPage';

import { LICENSE_ACTIVATION_MESSAGE } from '../data/constants';
import { TEST_OWNER } from '../../course/tests/data/constants';
import { COURSE_PACING_MAP } from '../../course/data/constants';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { SUBSIDY_TYPE } from '../../enterprise-subsidy-requests/constants';
import { sortAssignmentsByAssignmentStatus } from '../main-content/course-enrollments/data/utils';

const defaultCouponCodesState = {
  couponCodes: [],
  loading: false,
  couponCodesCount: 0,
};

const mockAuthenticatedUser = { username: 'myspace-tom', name: 'John Doe' };

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../../config', () => ({
  features: {
    FEATURE_ENABLE_PATHWAY_PROGRESS: jest.fn(),
    FEATURE_ENABLE_MY_CAREER: jest.fn(),
    FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT: jest.fn(),
  },
}));

jest.mock('../main-content/course-enrollments/data/utils', () => ({
  ...jest.requireActual('../main-content/course-enrollments/data/utils'),
  sortAssignmentsByAssignmentStatus: jest.fn(),
}));

jest.mock('../../enterprise-redirects/EnterpriseLearnerFirstVisitRedirect', () => jest.fn(
  () => (<div>enterprise-learner-first-visit-redirect</div>),
));

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
  redeemableLearnerCreditPolicies: [{
    learnerContentAssignments: {
      state: 'allocated',
    },
  },
  {
    learnerContentAssignments: {
      state: 'cancelled',
    },
  }],
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

const DashboardWithContext = ({
  initialAppState = defaultAppState,
  initialUserSubsidyState = defaultUserSubsidyState,
  courseState = defaultCourseState,
  initialSubsidyRequestState = defaultSubsidyRequestState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <SubsidyRequestsContext.Provider value={initialSubsidyRequestState}>
          <CourseContextProvider courseState={courseState}>
            <DashboardPage />
          </CourseContextProvider>
        </SubsidyRequestsContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

jest.mock('plotly.js-dist', () => {});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => mockLocation),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: jest.fn(() => mockAuthenticatedUser),
  getAuthenticatedHttpClient: jest.fn(() => ({
    get: jest.fn(() => ({})),
  })),
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

  beforeEach(() => {
    jest.clearAllMocks();
    sortAssignmentsByAssignmentStatus.mockReturnValue([]);
  });

  it('renders user first name if available', () => {
    renderWithRouter(<DashboardWithContext />);
    expect(screen.getByText('Welcome, John!')).toBeInTheDocument();
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
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
  });

  it('renders license activation alert on activation success', () => {
    renderWithRouter(
      <DashboardWithContext />,
      { route: '/?activationSuccess=true' },
    );
    expect(screen.getByText(LICENSE_ACTIVATION_MESSAGE)).toBeInTheDocument();
  });

  it('does not render license activation alert without activation success', () => {
    // NOTE: This modifies the original mockLocation
    mockLocation = { ...mockLocation, state: { activationSuccess: false } };
    renderWithRouter(
      <DashboardWithContext />,
    );
    expect(screen.queryByText(LICENSE_ACTIVATION_MESSAGE)).toBeFalsy();
  });

  it('renders a sidebar on a large screen', () => {
    window.matchMedia.setConfig(mockWindowConfig);
    renderWithRouter(
      <DashboardWithContext />,
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
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
    expect(screen.getByTestId('subsidies-summary')).toBeInTheDocument();
  });

  it('renders "Find a course" when search is enabled for the customer', () => {
    features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT.mockImplementation(() => true);
    renderWithRouter(
      <DashboardWithContext />,
    );
    expect(screen.getByText('Find a course')).toBeInTheDocument();
  });

  it('renders Pathways when feature is enabled', () => {
    const appState = {
      ...defaultAppState,
      enterpriseConfig: {
        name: 'BearsRUs',
        uuid: 'BearsRUs',
        disableSearch: true,
        adminUsers: [{ email: 'admin@foo.com' }],
        enablePathways: true,
      },
    };

    renderWithRouter(
      <DashboardWithContext initialAppState={appState} />,
    );
    expect(screen.getByText('Pathways')).toBeInTheDocument();
  });

  it('renders My Career when feature is enabled', () => {
    features.FEATURE_ENABLE_MY_CAREER.mockImplementation(() => true);
    renderWithRouter(
      <DashboardWithContext />,
    );
    expect(screen.getByText('My Career')).toBeInTheDocument();
  });

  it('does not render "Find a course" when search is disabled for the customer', () => {
    const appState = {
      ...defaultAppState,
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
    const appState = {
      ...defaultAppState,
      enterpriseConfig: {
        name: 'BearsRUs',
        uuid: 'BearsRUs',
        disableSearch: true,
        adminUsers: [{ email: 'admin@foo.com' }],
        enablePathways: true,
        enablePrograms: true,
      },
    };
    renderWithRouter(
      <DashboardWithContext initialAppState={appState} />,
    );
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Programs')).toBeInTheDocument();
  });

  it('Selects courses tab from progress tabs by default', () => {
    const appState = {
      ...defaultAppState,
      enterpriseConfig: {
        name: 'BearsRUs',
        uuid: 'BearsRUs',
        disableSearch: true,
        adminUsers: [{ email: 'admin@foo.com' }],
        enablePathways: true,
        enablePrograms: true,
      },
    };

    renderWithRouter(
      <DashboardWithContext initialAppState={appState} />,
    );
    const coursesTab = screen.getByText('Courses');
    const programsTab = screen.getByText('Programs');
    expect(coursesTab).toHaveAttribute('aria-selected', 'true');
    expect(programsTab).toHaveAttribute('aria-selected', 'false');
  });

  it('should send track event when "my-career" tab selected', () => {
    renderWithRouter(<DashboardWithContext />);

    const myCareerTab = screen.getByText('My Career');
    userEvent.click(myCareerTab);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });

  it('should render redirect component if no cookie and no courseAssignments exist', () => {
    const noActiveCourseAssignmentUserSubsidyState = {
      ...defaultUserSubsidyState,
      redeemableLearnerCreditPolicies: [],
    };
    renderWithRouter(<DashboardWithContext initialUserSubsidyState={noActiveCourseAssignmentUserSubsidyState} />);
    expect(screen.queryByText('enterprise-learner-first-visit-redirect')).toBeTruthy();
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
      userEvent.click(modal.querySelector('button'));
      expect(mockSetCookies).toHaveBeenCalledWith(
        `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}60-${defaultAppState.enterpriseConfig.uuid}-${subscriptionPlanId}`,
        true,
        { sameSite: 'strict' },
      );
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
      userEvent.click(modal.querySelector('button'));
      expect(mockSetCookies).toHaveBeenCalledWith(
        `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}30-${defaultAppState.enterpriseConfig.uuid}-${subscriptionPlanId}`,
        true,
        { sameSite: 'strict' },
      );
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
