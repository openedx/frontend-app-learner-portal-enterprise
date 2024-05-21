import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';

import DashboardMainContent from './DashboardMainContent';
import { queryClient, renderWithRouter } from '../../../utils/tests';
import { features } from '../../../config';
import {
  useCanOnlyViewHighlights,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useAcademies,
  useEnterpriseGroupMemberships,
  useEnterpriseFeatures,
} from '../../app/data';
import {
  authenticatedUserFactory,
  enterpriseCustomerFactory,
  academiesFactory,
  groupMembershipFactories,
} from '../../app/data/services/data/__factories__';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useAcademies: jest.fn(),
  useCanOnlyViewHighlights: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseFeatures: jest.fn(),
  useEnterpriseGroupMemberships: jest.fn(),
}));

jest.mock('../../../config', () => ({
  ...jest.requireActual('../../../config'),
  features: {
    FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT: jest.fn(),
  },
}));

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();

const DashboardMainContentWrapper = () => (
  <QueryClientProvider client={queryClient()}>
    <IntlProvider locale="en">
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        <DashboardMainContent />
      </AppContext.Provider>
    </IntlProvider>
  </QueryClientProvider>
);

describe('DashboardMainContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useAcademies.mockReturnValue({ data: academiesFactory(3) });
    useCanOnlyViewHighlights.mockReturnValue({ data: false });
    useEnterpriseFeatures.mockReturnValue({ data: { enterpriseGroupsV1: false } });
    useEnterpriseGroupMemberships.mockReturnValue({
      data: groupMembershipFactories(),
    });
    useEnterpriseCourseEnrollments.mockReturnValue({
      data: {
        allEnrollmentsByStatus: {
          inProgress: [],
          upcoming: [],
          completed: [],
          requested: [],
          savedForLater: [],
          assigned: {
            assignmentsForDisplay: [],
            canceledAssignments: [],
            expiredAssignments: [],
          },
        },
      },
    });
  });
  it('does not render recommended courses when canOnlyViewHighlightSets true', async () => {
    useCanOnlyViewHighlights.mockReturnValue({ data: true });
    renderWithRouter(
      <DashboardMainContentWrapper />,
    );
    await waitFor(() => {
      expect(screen.queryByText('Recommend courses for me')).not.toBeInTheDocument();
    });
  });
  it('renders recommended courses when canOnlyViewHighlightSets false', async () => {
    features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT.mockImplementation(() => true);
    renderWithRouter(
      <DashboardMainContentWrapper />,
    );
    await waitFor(() => {
      expect(screen.getByText('Recommend courses for me')).toBeInTheDocument();
    });
  });

  it('Displays disableSearch flag message', () => {
    const mockEnterpriseCustomerWithDisabledSearch = enterpriseCustomerFactory({ disable_search: true });
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithDisabledSearch });
    renderWithRouter(
      <DashboardMainContentWrapper />,
    );
    expect(screen.getByText('Reach out to your administrator for instructions on how to start learning with edX!', { exact: false })).toBeInTheDocument();
  });
});
