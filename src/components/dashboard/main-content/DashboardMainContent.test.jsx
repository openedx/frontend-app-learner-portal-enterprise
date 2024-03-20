import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { camelCaseObject } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { Factory } from 'rosie';
import { QueryClientProvider } from '@tanstack/react-query';

import DashboardMainContent from './DashboardMainContent';
import { queryClient, renderWithRouter } from '../../../utils/tests';
import { features } from '../../../config';
import { useCanOnlyViewHighlights, useEnterpriseCourseEnrollments, useEnterpriseCustomer } from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useCanOnlyViewHighlights: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
}));

jest.mock('../../../config', () => ({
  ...jest.requireActual('../../../config'),
  features: {
    FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT: jest.fn(),
  },
}));

const mockAuthenticatedUser = camelCaseObject(Factory.build('authenticatedUser'));
const mockEnterpriseCustomer = camelCaseObject(Factory.build('enterpriseCustomer'));

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
    useCanOnlyViewHighlights.mockReturnValue({ data: false });
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
    const mockEnterpriseCustomerWithDisabledSearch = camelCaseObject(Factory.build('enterpriseCustomer', { disableSearch: true }));
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomerWithDisabledSearch });
    renderWithRouter(
      <DashboardMainContentWrapper />,
    );
    expect(screen.getByText('Reach out to your administrator for instructions on how to start learning with edX!', { exact: false })).toBeInTheDocument();
  });
});
