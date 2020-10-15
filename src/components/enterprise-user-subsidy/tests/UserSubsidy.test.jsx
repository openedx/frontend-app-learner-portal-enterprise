import React from 'react';
import moment from 'moment';
import { screen, waitFor } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import UserSubsidy from '../UserSubsidy';

import { renderWithRouter } from '../../../utils/tests';
import { LICENSE_STATUS, LOADING_SCREEN_READER_TEXT } from '../data/constants';
import { fetchSubscriptionLicensesForUser } from '../data/service';
import { fetchOffers } from '../offers/data/service';

jest.mock('../data/service');
jest.mock('../offers/data/service');

const TEST_SUBSCRIPTION_UUID = 'test-subscription-uuid';
const TEST_LICENSE_UUID = 'test-license-uuid';
const TEST_ENTERPRISE_SLUG = 'test-enterprise-slug';

// eslint-disable-next-line react/prop-types
const UserSubsidyWithAppContext = ({ contextValue = {} }) => (
  <AppContext.Provider
    value={{
      enterpriseConfig: { slug: TEST_ENTERPRISE_SLUG },
      ...contextValue,
    }}
  >
    <UserSubsidy>
      <span data-testid="did-i-render" />
    </UserSubsidy>
  </AppContext.Provider>
);

describe('UserSubsidy', () => {
  describe('without subscription plan', () => {
    const contextValue = {
      subscriptionPlan: null,
    };
    beforeEach(() => {
      const promise = Promise.resolve({
        data: {
          results: [{
            offers: [],
            offer_count: 0,
          }],
        },
      });
      fetchOffers.mockResolvedValueOnce(promise);
    });
    afterEach(() => {
      jest.resetAllMocks();
    });

    test('renders children on Dashboard page route', async () => {
      const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
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

    test('does not redirect to Dashboard page from non-Dashboard page route', async () => {
      const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
      const { history } = renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}/search`,
      });

      await waitFor(() => {
        expect(screen.getByTestId('did-i-render')).toBeInTheDocument();
      });

      // assert we did NOT get redirected
      expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}/search`);
    });
  });

  describe('with subscription plan that is expired or has not yet started', () => {
    const startDate = moment().subtract(1, 'y');
    const expirationDate = moment().subtract(1, 'w');
    const contextValue = {
      subscriptionPlan: {
        uuid: TEST_SUBSCRIPTION_UUID,
        startDate: startDate.toISOString(),
        expirationDate: expirationDate.toISOString(),
      },
    };
    beforeEach(() => {
      const promise = Promise.resolve({
        data: {
          results: [{
            offers: [],
            offer_count: 0,
          }],
        },
      });
      fetchOffers.mockResolvedValueOnce(promise);
    });
    afterEach(() => {
      jest.resetAllMocks();
    });

    test('renders alert if plan has not started or has already ended', async () => {
      const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });

      // assert status alert message renders
      await waitFor(() => {
        const activationMessage = 'does not have an active subscription plan';
        expect(screen.queryByRole('alert')).toBeInTheDocument();
        expect(screen.queryByText(activationMessage, { exact: false })).toBeInTheDocument();
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
          results: [{
            offers: [],
            offer_count: 0,
          }],
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

      const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
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

    test('renders license activation alert if user has an assigned (pending) license on Dashboard page route', async () => {
      const promise = Promise.resolve({
        data: {
          results: [{
            uuid: TEST_LICENSE_UUID,
            status: LICENSE_STATUS.ASSIGNED,
          }],
        },
      });
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);

      const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });

      // assert status alert message renders
      await waitFor(() => {
        const activationMessage = 'activate your enterprise license';
        expect(screen.queryByRole('alert')).toBeInTheDocument();
        expect(screen.queryByText(activationMessage, { exact: false })).toBeInTheDocument();
      });
    });

    test('renders license deactivation alert if user has a revoked license on Dashboard page route', async () => {
      const promise = Promise.resolve({
        data: {
          results: [{
            uuid: TEST_LICENSE_UUID,
            status: LICENSE_STATUS.REVOKED,
          }],
        },
      });
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);

      const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });

      // assert status alert message renders
      await waitFor(() => {
        const deactivationMessage = 'enterprise license is no longer active';
        expect(screen.queryByRole('alert')).toBeInTheDocument();
        expect(screen.queryByText(deactivationMessage, { exact: false })).toBeInTheDocument();
      });
    });

    test('renders unassigned license alert if user does not have an associated license on Dashboard page route', async () => {
      const promise = Promise.resolve({
        data: {
          results: [],
        },
      });
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);

      const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });

      // assert status alert message renders
      await waitFor(() => {
        const deactivationMessage = 'do not have an enterprise license';
        expect(screen.queryByRole('alert')).toBeInTheDocument();
        expect(screen.queryByText(deactivationMessage, { exact: false })).toBeInTheDocument();
      });
    });

    test('redirects to Dashboard page if user has an assigned (pending) license on non-Dashboard page route', async () => {
      const promise = Promise.resolve({
        data: {
          results: [{
            uuid: TEST_LICENSE_UUID,
            status: LICENSE_STATUS.ASSIGNED,
          }],
        },
      });
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);

      const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
      const { history } = renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}/search`,
      });

      await waitFor(() => {
        expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}`);
      });
    });

    test('redirects to Dashboard page if user has a revoked license on non-Dashboard page route', async () => {
      const promise = Promise.resolve({
        data: {
          results: [{
            uuid: TEST_LICENSE_UUID,
            status: LICENSE_STATUS.REVOKED,
          }],
        },
      });
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce(promise);

      const Component = <UserSubsidyWithAppContext contextValue={contextValue} />;
      const { history } = renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}/search`,
      });

      await waitFor(() => {
        expect(history.location.pathname).toEqual(`/${TEST_ENTERPRISE_SLUG}`);
      });
    });
  });
});
