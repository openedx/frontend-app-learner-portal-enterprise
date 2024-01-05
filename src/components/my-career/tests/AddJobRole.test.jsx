import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { screen } from '@testing-library/react';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { SUBSIDY_TYPE } from '../../enterprise-subsidy-requests/constants';

import { renderWithRouter } from '../../../utils/tests';
import AddJobRole from '../AddJobRole';

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

const defaultAppState = {
  enterpriseConfig: {
    slug: 'test-enterprise',
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

const expiringSubscriptionUserSubsidyState = {
  subsidyRequestConfiguration: null,
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
  catalogsForSubsidyRequests: [],
  subscriptionPlan: {
    daysUntilExpiration: 60,
  },
  showExpirationNotifications: false,
};

const AddJobRoleWithContext = ({
  initialAppState = defaultAppState,
  initialSubsidyRequestState = defaultSubsidyRequestState,
  initialUserSubsidyState = expiringSubscriptionUserSubsidyState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <SubsidyRequestsContext.Provider value={initialSubsidyRequestState}>
          <AddJobRole />
        </SubsidyRequestsContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('<AddJobRole />', () => {
  it('renders the AddJobRole component', () => {
    renderWithRouter(<AddJobRoleWithContext />);
    expect(screen.getAllByText('Add Role')).toBeTruthy();
  });
});
