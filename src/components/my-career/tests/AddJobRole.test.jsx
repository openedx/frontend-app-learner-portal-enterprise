import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';

import { renderWithRouter } from '../../../utils/tests';
import AddJobRole from '../AddJobRole';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { useEnterpriseCourseEnrollments, useEnterpriseCustomer } from '../../app/data';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
  getMessages: () => ({}),
}));

// mock useLocation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '',
    state: {
      activationSuccess: true,
    },
  }),
  useNavigate: () => jest.fn(),
}));

// eslint-disable-next-line no-console
console.error = jest.fn();

const mockAuthenticatedUser = authenticatedUserFactory();

const AddJobRoleWrapper = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
      <AddJobRole submitClickHandler={() => jest.fn()} />
    </AppContext.Provider>
  </IntlProvider>
);

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('<AddJobRole />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useEnterpriseCourseEnrollments.mockReturnValue({
      data: {
        allEnrollmentsByStatus: {
          inProgress: [{
            courseRunId: 'edx+Demo',
          }],
          upcoming: [],
          completed: [],
          savedForLater: [],
          requested: [],
          assigned: [],
        },
      },
    });
  });
  it('renders the AddJobRole component', () => {
    renderWithRouter(<AddJobRoleWrapper />);
    expect(screen.getAllByText('Add Role')).toBeTruthy();
  });
});
