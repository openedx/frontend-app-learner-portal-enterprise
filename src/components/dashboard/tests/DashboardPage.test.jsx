import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { breakpoints } from '@openedx/paragon';
import Cookies from 'universal-cookie';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { camelCaseObject } from '@edx/frontend-platform/utils';
import { SUBSCRIPTION_EXPIRED_MODAL_TITLE, SUBSCRIPTION_EXPIRING_MODAL_TITLE } from '../SubscriptionExpirationModal';
import { SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX } from '../../../config/constants';
import { features } from '../../../config';
import { queryClient, renderWithRouter } from '../../../utils/tests';
import DashboardPage from '../DashboardPage';
import { LICENSE_ACTIVATION_MESSAGE } from '../data/constants';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import learnerPathwayData from '../../pathway-progress/data/__mocks__/PathwayProgressListData.json';
import {
  emptyRedeemableLearnerCreditPolicies,
  useBrowseAndRequest,
  useCanOnlyViewHighlights,
  useCouponCodes,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseOffers,
  useEnterprisePathwaysList,
  useEnterpriseProgramsList,
  useIsAssignmentsOnlyLearner,
  useRedeemablePolicies,
  useSubscriptions,
  useHasAvailableSubsidiesOrRequests,
} from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

const dummyProgramData = {
  uuid: 'test-uuid',
  title: 'Test Program Title',
  type: 'MicroMasters',
  bannerImage: {
    large: {
      url: 'www.example.com/large',
      height: 123,
      width: 455,
    },
    medium: {
      url: 'www.example.com/medium',
      height: 123,
      width: 455,
    },
    small: {
      url: 'www.example.com/small',
      height: 123,
      width: 455,
    },
    xSmall: {
      url: 'www.example.com/xSmall',
      height: 123,
      width: 455,
    },
  },
  authoringOrganizations: [
    {
      key: 'test-key',
      logoImageUrl: '/media/organization/logos/shield.png',
    },
  ],
  progress: {
    inProgress: 1,
    completed: 2,
    notStarted: 3,
  },
};

const defaultCouponCodesState = {
  couponCodeAssignments: [],
};

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory({
  enable_pathways: true,
  enable_programs: true,
});

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useSubscriptions: jest.fn(),
  useCouponCodes: jest.fn(),
  useEnterpriseOffers: jest.fn(),
  useRedeemablePolicies: jest.fn(),
  useEnterpriseProgramsList: jest.fn(),
  useEnterprisePathwaysList: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
  useCanOnlyViewHighlights: jest.fn(),
  useBrowseAndRequest: jest.fn(),
  useIsAssignmentsOnlyLearner: jest.fn(),
  useHasAvailableSubsidiesOrRequests: jest.fn(),
}));

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

const defaultAppState = {
  config: {
    LMS_BASE_URL: process.env.LMS_BASE_URL,
  },
  authenticatedUser: mockAuthenticatedUser,
};

const defaultRedeemablePoliciesState = {
  redeemablePolicies: [{
    learnerContentAssignments: [
      { state: 'allocated' },
    ],
  },
  {
    learnerContentAssignments: [
      { state: 'cancelled' },
    ],
  }],
  learnerContentAssignments: {
    ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
    assignments: [{ state: 'allocated' }, { state: 'cancelled' }],
    hasAssignments: true,
    allocatedAssignments: [{ state: 'allocated' }],
    hasAllocatedAssignments: true,
    canceledAssignments: [{ state: 'cancelled' }],
    assignmentsForDisplay: [{ state: 'allocated' }, { state: 'cancelled' }],
    hasAssignmentsForDisplay: true,
  },
};

const mockUseActiveSubsidyOrRequestsData = {
  mockHasAvailableLearnerCreditPolicies: false,
  mockHasAssignedCodesOrCodeRequests: false,
  mockHasActiveLicenseOrLicenseRequest: false,
  mockLearnerCreditSummaryCardData: null,
};
const useMockHasAvailableSubsidyOrRequests = ({
  mockHasAvailableLearnerCreditPolicies,
  mockHasAssignedCodesOrCodeRequests,
  mockHasActiveLicenseOrLicenseRequest,
  mockLearnerCreditSummaryCardData,
}) => ({
  hasAvailableLearnerCreditPolicies: mockHasAvailableLearnerCreditPolicies,
  hasAssignedCodesOrCodeRequests: mockHasAssignedCodesOrCodeRequests,
  learnerCreditSummaryCardData: mockLearnerCreditSummaryCardData,
  hasActiveLicenseOrLicenseRequest: mockHasActiveLicenseOrLicenseRequest,
  hasAvailableSubsidyOrRequests: mockHasAssignedCodesOrCodeRequests
    || mockHasActiveLicenseOrLicenseRequest
    || mockLearnerCreditSummaryCardData,
});

const mockWindowConfig = {
  type: 'screen',
  width: breakpoints.large.minWidth + 1,
  height: 800,
};

let mockQueryClient;
const DashboardWithContext = ({
  initialAppState = defaultAppState,
}) => {
  mockQueryClient = queryClient();
  return (
    <QueryClientProvider client={mockQueryClient}>
      <IntlProvider locale="en">
        <AppContext.Provider value={initialAppState}>
          <DashboardPage />
        </AppContext.Provider>
      </IntlProvider>
    </QueryClientProvider>
  );
};

jest.mock('plotly.js-dist', () => {});
jest.mock('universal-cookie');

// eslint-disable-next-line no-console
console.error = jest.fn();

describe('<Dashboard />', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: undefined,
        subscriptionPlan: undefined,
        shouldShowActivationSuccessMessage: false,
      },
    });
    useRedeemablePolicies.mockReturnValue({ data: defaultRedeemablePoliciesState });
    useCouponCodes.mockReturnValue({ data: defaultCouponCodesState });
    useEnterpriseOffers.mockReturnValue({ data: { enterpriseOffers: [] } });
    useEnterpriseProgramsList.mockReturnValue({ data: [] });
    useEnterprisePathwaysList.mockReturnValue({ data: [] });
    useEnterpriseCourseEnrollments.mockReturnValue({
      data: {
        allEnrollmentsByStatus: {
          inProgress: [],
          upcoming: [],
          completed: [],
          savedForLater: [],
          requested: [],
          assigned: {
            assignments: [],
            hasAssignments: false,
            allocatedAssignments: [],
            hasAllocatedAssignments: false,
            canceledAssignments: [],
            hasCanceledAssignments: false,
            expiredAssignments: [],
            hasExpiredAssignments: false,
            assignmentsForDisplay: [],
            hasAssignmentsForDisplay: false,
          },
        },
      },
    });
    useCanOnlyViewHighlights.mockReturnValue({ data: false });
    useBrowseAndRequest.mockReturnValue({
      data: {
        requests: {
          subscriptionLicenses: [],
          couponCodes: [],
        },
      },
    });
    useIsAssignmentsOnlyLearner.mockReturnValue(false);
    useHasAvailableSubsidiesOrRequests.mockReturnValue(
      useMockHasAvailableSubsidyOrRequests(mockUseActiveSubsidyOrRequestsData),
    );
  });

  it('renders user first name if available', () => {
    renderWithRouter(<DashboardWithContext />);
    expect(screen.getByText(`Welcome, ${mockAuthenticatedUser.name.split(' ')[0]}!`)).toBeInTheDocument();
  });

  it('does not render user first name if not available', () => {
    const mockAuthenticatedUserWithoutName = authenticatedUserFactory({ name: '' });
    const appState = {
      ...defaultAppState,
      authenticatedUser: mockAuthenticatedUserWithoutName,
    };
    renderWithRouter(<DashboardWithContext initialAppState={appState} />);
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
  });

  it('renders license activation alert on activation success', () => {
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: { status: LICENSE_STATUS.ACTIVATED },
        subscriptionPlan: { uuid: 'test-uuid' },
        shouldShowActivationSuccessMessage: true,
      },
    });
    renderWithRouter(<DashboardWithContext />);
    expect(screen.getByText(LICENSE_ACTIVATION_MESSAGE)).toBeInTheDocument();
  });

  it('does not render license activation alert without activation success', () => {
    renderWithRouter(<DashboardWithContext />);
    expect(screen.queryByText(LICENSE_ACTIVATION_MESSAGE)).toBeFalsy();
  });

  it('renders a courses sidebar on a large screen', async () => {
    window.matchMedia.setConfig(mockWindowConfig);
    renderWithRouter(
      <DashboardWithContext />,
    );
    expect(screen.getByTestId('courses-tab-sidebar')).toBeInTheDocument();
  });

  it('renders an add job sidebar on a large screen', async () => {
    features.FEATURE_ENABLE_MY_CAREER.mockImplementation(() => true);
    window.matchMedia.setConfig(mockWindowConfig);
    renderWithRouter(
      <DashboardWithContext />,
    );

    userEvent.click(screen.getByText('My Career'));

    await waitFor(() => expect(screen.getByTestId('add-job-role-sidebar')).toBeInTheDocument());
  });

  it('renders pathway tab', () => {
    useEnterprisePathwaysList.mockReturnValue({ data: camelCaseObject(learnerPathwayData) });
    renderWithRouter(
      <DashboardWithContext />,
    );

    userEvent.click(screen.getByText('Pathways'));

    expect(screen.getByTestId('pathway-listing-page')).toBeInTheDocument();
  });

  it('renders programs tab', async () => {
    useEnterpriseProgramsList.mockReturnValue({ data: camelCaseObject(dummyProgramData) });
    renderWithRouter(
      <DashboardWithContext />,
    );

    userEvent.click(screen.getByText('Programs'));

    expect(screen.getByTestId('program-listing-page')).toBeInTheDocument();
  });

  it('renders My Career when feature is enabled', () => {
    features.FEATURE_ENABLE_MY_CAREER.mockImplementation(() => true);
    renderWithRouter(
      <DashboardWithContext />,
    );
    expect(screen.getByText('My Career')).toBeInTheDocument();
  });

  it('renders subsidies summary on a small screen', () => {
    window.matchMedia.setConfig({ ...mockWindowConfig, width: breakpoints.large.minWidth - 1 });
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: { status: LICENSE_STATUS.ACTIVATED },
        subscriptionPlan: { uuid: 'test-uuid' },
        shouldShowActivationSuccessMessage: false,
      },
    });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(
      useMockHasAvailableSubsidyOrRequests({ mockHasActiveLicenseOrLicenseRequest: true }),
    );
    renderWithRouter(
      <DashboardWithContext />,
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

  it('does not render "Find a course" when search is disabled for the customer', () => {
    const mockEnterpriseCustomerWithoutSearch = enterpriseCustomerFactory({
      disable_search: true,
    });
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithoutSearch });
    renderWithRouter(
      <DashboardWithContext />,
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

  describe('SubscriptionExpirationModal', () => {
    it('should not render when > 60 days of access remain', () => {
      renderWithRouter(
        <DashboardWithContext />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });

    it('should render when 60 >= daysUntilExpiration > 0', () => {
      useSubscriptions.mockReturnValue({
        data: {
          showExpirationNotifications: true,
          subscriptionPlan: {
            daysUntilExpiration: 60,
          },
        },
      });
      renderWithRouter(
        <DashboardWithContext />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeTruthy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });

    it('should render the expired version of the modal when 0 >= daysUntilExpiration', () => {
      useSubscriptions.mockReturnValue({
        data: {
          showExpirationNotifications: true,
          subscriptionPlan: {
            daysUntilExpiration: 0,
          },
        },
      });
      renderWithRouter(
        <DashboardWithContext />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeTruthy();
    });

    it('should not render when 0 >= daysUntilExpiration and expiration messages are disabled ', () => {
      useSubscriptions.mockReturnValue({
        data: {
          showExpirationNotifications: false,
          subscriptionPlan: {
            daysUntilExpiration: 0,
          },
        },
      });
      renderWithRouter(
        <DashboardWithContext />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });

    it('should not render when 60 >= daysUntilExpiration > 0 and expiration messages are disabled', () => {
      useSubscriptions.mockReturnValue({
        data: {
          showExpirationNotifications: false,
          subscriptionPlan: {
            daysUntilExpiration: 60,
          },
        },
      });
      renderWithRouter(
        <DashboardWithContext />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });

    it('should render the expiration warning version of the modal when 60 >= daysUntilExpiration > 0', () => {
      useSubscriptions.mockReturnValue({
        data: {
          showExpirationNotifications: true,
          subscriptionPlan: {
            daysUntilExpiration: 60,
          },
        },
      });
      renderWithRouter(
        <DashboardWithContext />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeTruthy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });

    it('should set the 60 day cookie when closed for the 60 day threshold', () => {
      const mockSetCookies = jest.fn();
      Cookies.mockReturnValue({ get: () => null, set: mockSetCookies });

      const subscriptionPlanId = 'expiring-plan-60';
      useSubscriptions.mockReturnValue({
        data: {
          showExpirationNotifications: true,
          subscriptionPlan: {
            uuid: subscriptionPlanId,
            daysUntilExpiration: 60,
          },
        },
      });
      renderWithRouter(
        <DashboardWithContext />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeTruthy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
      const modal = screen.getByRole('dialog');
      userEvent.click(modal.querySelector('button'));
      expect(mockSetCookies).toHaveBeenCalledWith(
        `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}60-${mockEnterpriseCustomer.uuid}-${subscriptionPlanId}`,
        true,
        { sameSite: 'strict' },
      );
    });

    it('should not show the modal if 60 >= daysUntilExpiration > 30 and the 60 day cookie has been set', () => {
      Cookies.mockReturnValue({ get: () => 'cookie' });
      useSubscriptions.mockReturnValue({
        data: {
          showExpirationNotifications: true,
          subscriptionPlan: {
            daysUntilExpiration: 60,
          },
        },
      });
      renderWithRouter(
        <DashboardWithContext />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });

    it('should set the 30 day cookie when closed for the 30 day threshold', () => {
      const mockSetCookies = jest.fn();
      Cookies.mockReturnValue({ get: () => null, set: mockSetCookies });

      const subscriptionPlanId = 'expiring-plan-30';
      useSubscriptions.mockReturnValue({
        data: {
          showExpirationNotifications: true,
          subscriptionPlan: {
            uuid: subscriptionPlanId,
            daysUntilExpiration: 30,
          },
        },
      });
      renderWithRouter(
        <DashboardWithContext />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeTruthy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
      const modal = screen.getByRole('dialog');
      userEvent.click(modal.querySelector('button'));
      expect(mockSetCookies).toHaveBeenCalledWith(
        `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}30-${mockEnterpriseCustomer.uuid}-${subscriptionPlanId}`,
        true,
        { sameSite: 'strict' },
      );
    });

    it('should not show the modal if 30 >= daysUntilExpiration > 0 and the 30 day cookie has been set', () => {
      Cookies.mockReturnValue({ get: () => 'cookie' });
      useSubscriptions.mockReturnValue({
        data: {
          showExpirationNotifications: true,
          subscriptionPlan: {
            daysUntilExpiration: 30,
          },
        },
      });
      renderWithRouter(
        <DashboardWithContext />,
      );
      expect(screen.queryByText(SUBSCRIPTION_EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByText(SUBSCRIPTION_EXPIRED_MODAL_TITLE)).toBeFalsy();
    });
  });
});
