import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import SubscriptionStatusCard from '../SubscriptionStatusCard';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SUBSIDY_TYPE } from '../../../constants';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    enterpriseSlug: 'test-enterprise-slug',
  }),
  useLocation: jest.fn(),
}));

const userSubsidyState = {
  subscriptionLicense: {
    uuid: 'test-license-uuid',
  },
  couponCodes: {
    couponCodes: [],
    couponCodesCount: 0,
  },
};
const appState = {
  enterpriseConfig: {
    slug: 'test-enterprise-slug',
    name: 'test',
  },
};
const subsidyRequestsState = {
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
};

const SubscriptionStatusCardWithContext = ({
  initialAppState, initialUserSubsidyState, initialSubsidyRequestsState,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
          <SubscriptionStatusCard />
        </SubsidyRequestsContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

describe('SubscriptionStatusCard', () => {
  it('renders "Not Active" badge when no active license or license request', () => {
    const { getByText } = render(<SubscriptionStatusCardWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      initialSubsidyRequestsState={subsidyRequestsState}
    />);
    expect(getByText('Not Active')).toBeInTheDocument();
  });

  it('renders "Active" badge when there is an active license or license request', () => {
    const mockUserSubsidyState = {
      subscriptionLicense: {
        uuid: 'test-license-uuid',
        status: LICENSE_STATUS.ACTIVATED,
      },
      subscriptionPlan: {
        expirationDate: '2024-12-31',
      },
      couponCodes: {
        couponCodes: [],
        couponCodesCount: 0,
      },
    };
    const { getByText } = render(<SubscriptionStatusCardWithContext
      initialAppState={appState}
      initialUserSubsidyState={mockUserSubsidyState}
      initialSubsidyRequestsState={subsidyRequestsState}
    />);
    expect(getByText('Active')).toBeInTheDocument();
  });

  it('renders expiry date when subscription is active and has expiration date', () => {
    const expiredUserSubsidyState = {
      subscriptionLicense: {
        uuid: 'test-license-uuid',
        status: LICENSE_STATUS.ACTIVATED,
      },
      subscriptionPlan: {
        expirationDate: '2024-12-31',
      },
      couponCodes: {
        couponCodes: [],
        couponCodesCount: 0,
      },
    };
    const { getByText } = render(<SubscriptionStatusCardWithContext
      initialAppState={appState}
      initialUserSubsidyState={expiredUserSubsidyState}
      initialSubsidyRequestsState={subsidyRequestsState}
    />);
    expect(getByText('Available until')).toBeInTheDocument();
    expect(getByText('December 31st, 2024')).toBeInTheDocument();
  });

  it('does not render expiry date when subscription is not active', () => {
    const { queryByText } = render(<SubscriptionStatusCardWithContext
      initialAppState={appState}
      initialUserSubsidyState={userSubsidyState}
      initialSubsidyRequestsState={subsidyRequestsState}
    />);
    expect(queryByText('Available until December 31st, 2024')).toBeNull();
  });
});
