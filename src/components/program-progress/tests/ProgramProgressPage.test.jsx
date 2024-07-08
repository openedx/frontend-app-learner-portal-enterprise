import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { screen } from '@testing-library/react';
import React from 'react';
import { ProgramProgressPage } from '../index';
import { authenticatedUserFactory, enterpriseCustomerFactory, academiesFactory } from '../../app/data/services/data/__factories__';
import {
  useBrowseAndRequest,
  useCouponCodes,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseOffers,
  useIsAssignmentsOnlyLearner,
  useLearnerProgramProgressData,
  useRedeemablePolicies,
  useSubscriptions,
  useHasAvailableSubsidiesOrRequests,
  useAcademies,
} from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useLearnerProgramProgressData: jest.fn(),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
  useSubscriptions: jest.fn(),
  useCouponCodes: jest.fn(),
  useEnterpriseOffers: jest.fn(),
  useRedeemablePolicies: jest.fn(),
  useBrowseAndRequest: jest.fn(),
  useIsAssignmentsOnlyLearner: jest.fn(),
  useHasAvailableSubsidiesOrRequests: jest.fn(),
  useAcademies: jest.fn(),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  ...jest.requireActual('@edx/frontend-platform/react'),
  ErrorPage: () => <div data-testid="error-page" />,
}));

const mockAuthenticatedUser = authenticatedUserFactory();

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const mockUseActiveSubsidyOrRequestsData = {
  mockHasAssignedCodesOrCodeRequests: false,
  mockHasActiveLicenseOrLicenseRequest: false,
  mockLearnerCreditSummaryCardData: {},
};
const useMockHasAvailableSubsidyOrRequests = ({
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
    <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
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
  urls: {
    programListingUrl: '/dashboard/programs/',
  },
};

describe('<ProgramProgressPage />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useHasAvailableSubsidiesOrRequests.mockReturnValue(
      useMockHasAvailableSubsidyOrRequests(mockUseActiveSubsidyOrRequestsData),
    );
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
    useAcademies.mockReturnValue({ data: academiesFactory(3) });
  });
  it('renders error page', () => {
    useLearnerProgramProgressData.mockReturnValue({
      data: {
        programData: null,
        courseData: null,
        urls: null,
      },
    });
    renderWithRouter(<ProgramProgressPageWrapper />);
    expect(screen.getByTestId('not-found-page')).toBeTruthy();
  });
  it('renders page', () => {
    useLearnerProgramProgressData.mockReturnValue({ data: mockData });
    renderWithRouter(<ProgramProgressPageWrapper />);
    expect(screen.getByText('Test Program Title')).toBeTruthy();
  });
});
