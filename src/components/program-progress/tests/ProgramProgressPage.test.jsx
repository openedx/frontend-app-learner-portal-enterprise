import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { screen } from '@testing-library/react';
import React from 'react';
import { ProgramProgressPage } from '../index';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import {
  useBrowseAndRequest,
  useCouponCodes,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseOffers,
  useIsAssignmentsOnlyLearner,
  useProgramProgressDetails,
  useRedeemablePolicies,
  useSubscriptions,
} from '../../app/data';
import { useHasActiveSubsidy } from '../../hooks';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useProgramProgressDetails: jest.fn(),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
  useSubscriptions: jest.fn(),
  useCouponCodes: jest.fn(),
  useEnterpriseOffers: jest.fn(),
  useRedeemablePolicies: jest.fn(),
  useBrowseAndRequest: jest.fn(),
  useIsAssignmentsOnlyLearner: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useHasActiveSubsidy: jest.fn(),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  ...jest.requireActual('@edx/frontend-platform/react'),
  ErrorPage: () => <div data-testid="error-page" />,
}));

const mockAppContext = {
  authenticatedUser: authenticatedUserFactory(),
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const mockUseActiveSubsidyData = {
  mockHasAssignedCodesOrCodeRequests: false,
  mockHasActiveLicenseOrLicenseRequest: false,
  mockLearnerCreditSummaryCardData: {},
};
const mockUseHasActiveSubsidy = ({
  mockHasAssignedCodesOrCodeRequests,
  mockHasActiveLicenseOrLicenseRequest,
  mockLearnerCreditSummaryCardData,
}) => ({
  hasAvailableLearnerCreditPolicies: false,
  hasAssignedCodesOrCodeRequests: mockHasAssignedCodesOrCodeRequests,
  learnerCreditSummaryCardData: mockLearnerCreditSummaryCardData,
  hasActiveLicenseOrLicenseRequest: mockHasActiveLicenseOrLicenseRequest,
  hasAvailableSubsidyOrRequests: mockHasAssignedCodesOrCodeRequests
    || mockHasActiveLicenseOrLicenseRequest
    || mockLearnerCreditSummaryCardData,
});

const ProgramProgressPageWrapper = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={mockAppContext}>
      <ProgramProgressPage />
    </AppContext.Provider>
  </IntlProvider>
);
const mockCourseData = {
  completed: [],
  notStarted: [],
  inProgress: [],
};
const mockProgramData = {
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
const mockData = {
  programData: mockProgramData,
  courseData: mockCourseData,
};

describe('<ProgramProgressPage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useHasActiveSubsidy.mockReturnValue(mockUseHasActiveSubsidy(mockUseActiveSubsidyData));
    useEnterpriseCourseEnrollments.mockReturnValue({ data: { allEnrollmentsByStatus: {} } });
    useSubscriptions.mockReturnValue({
      data: {
        subscriptions: {
          subscriptionLicense: undefined,
          subscriptionPlan: undefined,
        },
      },
    });
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [],
      },
    });
    useEnterpriseOffers.mockReturnValue({
      data: {
        enterpriseOffers: [],
        canEnrollWithEnterpriseOffers: false,
      },
    });
    useRedeemablePolicies.mockReturnValue({
      data: {
        redeemablePolicies: [],
      },
    });
    useBrowseAndRequest.mockReturnValue({
      data: {
        requests: {
          couponCodes: [],
          subscriptionLicenses: [],
        },
      },
    });
    useIsAssignmentsOnlyLearner.mockReturnValue(false);
  });
  it('renders error page', () => {
    useProgramProgressDetails.mockReturnValue({ data: {}, isError: true, isLoading: false });
    renderWithRouter(<ProgramProgressPageWrapper />);
    expect(screen.getByTestId('error-page')).toBeTruthy();
  });
  it('renders loading page', () => {
    useProgramProgressDetails.mockReturnValue({ data: {}, isError: false, isLoading: true });
    renderWithRouter(<ProgramProgressPageWrapper />);
    expect(screen.getByText('loading program progress')).toBeTruthy();
  });
  it('renders page', () => {
    useProgramProgressDetails.mockReturnValue({ data: mockData, isError: false, isLoading: false });
    renderWithRouter(<ProgramProgressPageWrapper />);
    expect(screen.getByText('Test Program Title')).toBeTruthy();
  });
});
