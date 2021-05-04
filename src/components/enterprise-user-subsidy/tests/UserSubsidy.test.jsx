import React, { useContext } from 'react';
import moment from 'moment';
import { screen, waitFor } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import UserSubsidy, { UserSubsidyContext } from '../UserSubsidy';

import { renderWithRouter } from '../../../utils/tests';
import { LICENSE_STATUS, LOADING_SCREEN_READER_TEXT } from '../data/constants';
import {
  fetchSubscriptionLicensesForUser,
} from '../data/service';
import { fetchOffers } from '../offers/data/service';

jest.mock('../data/service');
jest.mock('../offers/data/service');
jest.mock('../../../config', () => ({
  features: { ENROLL_WITH_CODES: true },
}));

const TEST_SUBSCRIPTION_UUID = 'test-subscription-uuid';
const TEST_LICENSE_UUID = 'test-license-uuid';
const TEST_ENTERPRISE_SLUG = 'test-enterprise-slug';
const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

const mockSubscriptionPlan = {
  uuid: TEST_SUBSCRIPTION_UUID,
  isActive: true,
  startDate: moment().subtract(1, 'w').toISOString(),
  expirationDate: moment().add(1, 'y').toISOString(),
};

// eslint-disable-next-line react/prop-types
const UserSubsidyWithAppContext = ({ contextValue = {}, children }) => (
  <AppContext.Provider
    value={{
      enterpriseConfig: {
        slug: TEST_ENTERPRISE_SLUG,
        uuid: TEST_ENTERPRISE_UUID,
      },
      ...contextValue,
    }}
  >
    <UserSubsidy>
      {children}
    </UserSubsidy>
  </AppContext.Provider>
);

const HasAccessConsumer = () => {
  const { hasAccessToPortal } = useContext(UserSubsidyContext);
  return <div>Has access: {hasAccessToPortal ? 'true' : 'false'} </div>;
};

const SubscriptionLicenseConsumer = () => {
  const { subscriptionLicense } = useContext(UserSubsidyContext);
  return <div>License status: {subscriptionLicense.status}</div>;
};

const OffersConsumer = () => {
  const { offers } = useContext(UserSubsidyContext);
  return <div>Offers count: {offers.offersCount}</div>;
};

describe('UserSubsidy', () => {
  describe('without a subsidy', () => {
    beforeEach(() => {
      const response = {
        data: {
          count: 0,
          results: [],
        },
      };
      fetchOffers.mockResolvedValueOnce(response);
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce(response);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    test('renders children on Dashboard page route', async () => {
      const Component = (
        <UserSubsidyWithAppContext>
          <span data-testid="did-i-render" />
        </UserSubsidyWithAppContext>
      );
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });

      // assert component is initially loading
      expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('did-i-render')).toBeInTheDocument();
      });

      // assert component is no longer loading
      expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).not.toBeInTheDocument();
    });
  });

  describe('no offers', () => {
    beforeEach(() => {
      fetchOffers.mockResolvedValueOnce({
        data: {
          count: 0,
          results: [],
        },
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    test('no subscription plan or license, shows correct portal access', async () => {
      const response = {
        data: {
          results: [],
        },
      };
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce(response);
      const Component = (
        <UserSubsidyWithAppContext>
          <HasAccessConsumer />
        </UserSubsidyWithAppContext>
      );
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
      expect(fetchOffers).toHaveBeenCalledWith({
        enterprise_uuid: TEST_ENTERPRISE_UUID,
        full_discount_only: 'True',
        is_active: 'True',
      });
      await waitFor(() => {
        expect(screen.queryByText('Has access: false')).toBeInTheDocument();
      });
    });

    test('with license, shows correct portal access', async () => {
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce({
        data: {
          results: [{
            uuid: TEST_LICENSE_UUID,
            status: LICENSE_STATUS.ACTIVATED,
          }],
        },
      });
      const Component = (
        <UserSubsidyWithAppContext>
          <HasAccessConsumer />
        </UserSubsidyWithAppContext>
      );
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
      expect(fetchOffers).toHaveBeenCalledWith({
        enterprise_uuid: TEST_ENTERPRISE_UUID,
        full_discount_only: 'True',
        is_active: 'True',
      });

      await waitFor(() => {
        expect(screen.queryByText('Has access: true')).toBeInTheDocument();
      });
    });

    test('provides license data', async () => {
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce({
        data: {
          results: [{
            uuid: TEST_LICENSE_UUID,
            status: LICENSE_STATUS.ACTIVATED,
            subscriptionPlan: mockSubscriptionPlan,
          }],
        },
      });
      const Component = (
        <UserSubsidyWithAppContext>
          <SubscriptionLicenseConsumer />
        </UserSubsidyWithAppContext>
      );
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
      expect(fetchOffers).toHaveBeenCalledWith({
        enterprise_uuid: TEST_ENTERPRISE_UUID,
        full_discount_only: 'True',
        is_active: 'True',
      });

      await waitFor(() => {
        expect(screen.queryByText(`License status: ${LICENSE_STATUS.ACTIVATED}`)).toBeInTheDocument();
      });
    });

    test('provides offers data', async () => {
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce({
        data: {
          results: [{
            uuid: TEST_LICENSE_UUID,
            status: LICENSE_STATUS.ACTIVATED,
            subscriptionPlan: mockSubscriptionPlan,
          }],
        },
      });
      const Component = (
        <UserSubsidyWithAppContext>
          <OffersConsumer />
        </UserSubsidyWithAppContext>
      );
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
      expect(fetchOffers).toHaveBeenCalledTimes(1);
      expect(fetchOffers).toHaveBeenCalledWith({ enterprise_uuid: TEST_ENTERPRISE_UUID, full_discount_only: 'True', is_active: 'True' });

      await waitFor(() => {
        expect(screen.queryByText('Offers count: 0')).toBeInTheDocument();
      });
    });
  });

  describe('with subscription plan that has started, but not yet ended, no offers', () => {
    beforeEach(() => {
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce({
        data: {
          results: [{
            uuid: TEST_LICENSE_UUID,
            status: LICENSE_STATUS.ACTIVATED,
            subscriptionPlan: mockSubscriptionPlan,
          }],
        },
      });
      fetchOffers.mockResolvedValueOnce({
        data: {
          count: 0,
          results: [],
        },
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    test('renders children if user has an activated license from any route', async () => {
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce({
        data: {
          results: [{
            uuid: TEST_LICENSE_UUID,
            status: LICENSE_STATUS.ACTIVATED,
            subscriptionPlan: mockSubscriptionPlan,
          }],
        },
      });

      const Component = (
        <UserSubsidyWithAppContext>
          <span data-testid="did-i-render" />
        </UserSubsidyWithAppContext>
      );
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}/search`,
      });

      // assert component is initially loading
      expect(screen.getByText(LOADING_SCREEN_READER_TEXT)).toBeInTheDocument();

      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);

      await waitFor(() => {
        expect(screen.getByTestId('did-i-render')).toBeInTheDocument();
      });

      // assert component is no longer loading
      expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).not.toBeInTheDocument();
    });
  });
});
