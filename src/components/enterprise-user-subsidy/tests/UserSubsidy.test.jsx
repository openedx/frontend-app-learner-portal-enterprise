import React, { useContext } from 'react';
import moment from 'moment';
import { screen, waitFor } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import UserSubsidy, { UserSubsidyContext } from '../UserSubsidy';

import { renderWithRouter } from '../../../utils/tests';
import { LICENSE_STATUS, LOADING_SCREEN_READER_TEXT } from '../data/constants';
import { fetchSubscriptionLicensesForUser } from '../data/service';
import { fetchOffers } from '../offers/data/service';

jest.mock('../data/service');
jest.mock('../offers/data/service');
jest.mock('../../../config', () => ({
  features: { ENROLL_WITH_CODES: true },
}));

const TEST_SUBSCRIPTION_UUID = 'test-subscription-uuid';
const TEST_LICENSE_UUID = 'test-license-uuid';
const TEST_ENTERPRISE_SLUG = 'test-enterprise-slug';

// eslint-disable-next-line react/prop-types
const UserSubsidyWithAppContext = ({ contextValue = {}, children }) => (
  <AppContext.Provider
    value={{
      enterpriseConfig: { slug: TEST_ENTERPRISE_SLUG },
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
  describe('without subscription plan', () => {
    const contextValue = {
      subscriptionPlan: null,
    };
    beforeEach(() => {
      const promise = Promise.resolve({
        data: {
          data: {
            count: 0,
            results: [],
          },
        },
      });
      fetchOffers.mockResolvedValueOnce(promise);
    });
    afterEach(() => {
      jest.resetAllMocks();
    });

    test('renders children on Dashboard page route', async () => {
      const Component = <UserSubsidyWithAppContext contextValue={contextValue}><span data-testid="did-i-render" /></UserSubsidyWithAppContext>;
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
    const contextValue = {
      subscriptionPlan: {
        uuid: TEST_SUBSCRIPTION_UUID,
        startDate: moment().subtract(1, 'w').toISOString(),
        expirationDate: moment().add(1, 'y').toISOString(),
      },
    };
    beforeEach(() => {
      const promise = Promise.resolve({
        data: {
          count: 0,
          results: [],
        },
      });
      fetchOffers.mockResolvedValueOnce(promise);
    });
    afterEach(() => {
      jest.resetAllMocks();
    });

    test('no license, shows correct portal access', async () => {
      const promise = Promise.resolve({
        data: {
          results: [],
        },
      });
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);
      const Component = (
        <UserSubsidyWithAppContext contextValue={contextValue}>
          <HasAccessConsumer />
        </UserSubsidyWithAppContext>
      );
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledTimes(1);
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_SUBSCRIPTION_UUID);
      await waitFor(() => {
        expect(screen.queryByText('Has access: false')).toBeInTheDocument();
      });
    });
    test('with license, shows correct portal access', async () => {
      const promise = Promise.resolve({
        data: {
          results: [{
            uuid: TEST_LICENSE_UUID,
            status: LICENSE_STATUS.ACTIVATED,
          }],
        },
      });
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);
      const Component = (
        <UserSubsidyWithAppContext contextValue={contextValue}>
          <HasAccessConsumer />
        </UserSubsidyWithAppContext>
      );
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledTimes(1);
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_SUBSCRIPTION_UUID);
      await waitFor(() => {
        expect(screen.queryByText('Has access: true')).toBeInTheDocument();
      });
    });
    test('provides license data', async () => {
      const promise = Promise.resolve({
        data: {
          results: [{
            uuid: TEST_LICENSE_UUID,
            status: LICENSE_STATUS.ACTIVATED,
          }],
        },
      });
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);
      const Component = (
        <UserSubsidyWithAppContext contextValue={contextValue}>
          <SubscriptionLicenseConsumer />
        </UserSubsidyWithAppContext>
      );
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledTimes(1);
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_SUBSCRIPTION_UUID);
      await waitFor(() => {
        expect(screen.queryByText(`License status: ${LICENSE_STATUS.ACTIVATED}`)).toBeInTheDocument();
      });
    });
    test('provides offers data', async () => {
      const promise = Promise.resolve({
        data: {
          results: [{
            uuid: TEST_LICENSE_UUID,
            status: LICENSE_STATUS.ACTIVATED,
          }],
        },
      });
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);
      const Component = (
        <UserSubsidyWithAppContext contextValue={contextValue}>
          <OffersConsumer />
        </UserSubsidyWithAppContext>
      );
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledTimes(1);
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_SUBSCRIPTION_UUID);
      expect(fetchOffers).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(screen.queryByText('Offers count: 0')).toBeInTheDocument();
      });
    });
  });

  describe('with subscription plan that has started, but not yet ended, no offers', () => {
    const contextValue = {
      subscriptionPlan: {
        uuid: TEST_SUBSCRIPTION_UUID,
        startDate: moment().subtract(1, 'w').toISOString(),
        expirationDate: moment().add(1, 'y').toISOString(),
      },
    };

    beforeEach(() => {
      const promise = Promise.resolve({
        data: {
          count: 0,
          results: [],
        },
      });
      fetchOffers.mockResolvedValueOnce(promise);
    });
    afterEach(() => {
      jest.resetAllMocks();
    });

    test('renders children if user has an activated license from any route', async () => {
      const promise = Promise.resolve({
        data: {
          results: [{
            uuid: TEST_LICENSE_UUID,
            status: LICENSE_STATUS.ACTIVATED,
          }],
        },
      });
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);

      const Component = <UserSubsidyWithAppContext contextValue={contextValue}><span data-testid="did-i-render" /></UserSubsidyWithAppContext>;
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}/search`,
      });

      // assert component is initially loading
      expect(screen.getByText(LOADING_SCREEN_READER_TEXT)).toBeInTheDocument();

      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledTimes(1);
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_SUBSCRIPTION_UUID);

      await waitFor(() => {
        expect(screen.getByTestId('did-i-render')).toBeInTheDocument();
      });

      // assert component is no longer loading
      expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).not.toBeInTheDocument();
    });
  });
});
