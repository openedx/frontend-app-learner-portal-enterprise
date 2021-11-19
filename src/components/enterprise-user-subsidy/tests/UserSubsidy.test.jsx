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
  fetchCustomerAgreementData,
  requestAutoAppliedLicense,
} from '../data/service';
import { fetchOffers } from '../offers/data/service';

jest.mock('../data/service');
jest.mock('../offers/data/service');
jest.mock('../../../config', () => ({
  features: {
    ENROLL_WITH_CODES: true,
    ENABLE_AUTO_APPLIED_LICENSES: true,
  },
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

const mockCustomerAgreementData = {
  data: {
    count: 1,
    results: [{
      uuid: 'test-customer-agreement-uuid',
      disable_expiration_notifications: false,
      subscription_for_auto_applied_licenses: 'test-subscription-uuid',
    }],
  },
};

const mockEmptyListResponse = {
  data: {
    count: 0,
    results: [],
  },
};

/* eslint-disable react/prop-types */
const UserSubsidyWithAppContext = ({
  enterpriseConfig = {},
  contextValue = {},
  children,
}) => (
  <AppContext.Provider
    value={{
      enterpriseConfig: {
        slug: TEST_ENTERPRISE_SLUG,
        uuid: TEST_ENTERPRISE_UUID,
        ...enterpriseConfig,
      },
      ...contextValue,
    }}
  >
    <UserSubsidy>
      {children}
    </UserSubsidy>
  </AppContext.Provider>
);
/* eslint-enable react/prop-types */

const SubscriptionLicenseConsumer = () => {
  const { subscriptionLicense } = useContext(UserSubsidyContext);
  return <div>License status: {subscriptionLicense?.status || 'none'}</div>;
};

const OffersConsumer = () => {
  const { offers } = useContext(UserSubsidyContext);
  return <div>Offers count: {offers?.offersCount || 'none'}</div>;
};

describe('UserSubsidy', () => {
  describe('without subsidy', () => {
    beforeEach(() => {
      fetchOffers.mockResolvedValueOnce(mockEmptyListResponse);
      fetchSubscriptionLicensesForUser.mockResolvedValueOnce(mockEmptyListResponse);
      fetchCustomerAgreementData.mockResolvedValueOnce(mockEmptyListResponse);
    });

    afterEach(() => {
      expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
      expect(fetchCustomerAgreementData).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
      expect(fetchOffers).toHaveBeenCalledWith({
        enterprise_uuid: TEST_ENTERPRISE_UUID,
        full_discount_only: 'True',
        is_active: 'True',
      });
      expect(requestAutoAppliedLicense).not.toBeCalled();

      jest.resetAllMocks();
    });

    test('shows no portal access', async () => {
      const Component = (
        <UserSubsidyWithAppContext>
          <SubscriptionLicenseConsumer />
          <OffersConsumer />
        </UserSubsidyWithAppContext>
      );
      renderWithRouter(Component, {
        route: `/${TEST_ENTERPRISE_SLUG}`,
      });

      // assert component is initially loading
      expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('License status: none')).toBeInTheDocument();
        expect(screen.queryByText('Offers count: none')).toBeInTheDocument();
      });

      // assert component is no longer loading
      expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).not.toBeInTheDocument();
    });
  });

  describe('with subsidy', () => {
    describe('existing activated license, no offers', () => {
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
        fetchCustomerAgreementData.mockResolvedValueOnce(mockCustomerAgreementData);
        fetchOffers.mockResolvedValueOnce(mockEmptyListResponse);
      });

      afterEach(() => {
        expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
        expect(fetchCustomerAgreementData).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
        expect(fetchOffers).toHaveBeenCalledWith({
          enterprise_uuid: TEST_ENTERPRISE_UUID,
          full_discount_only: 'True',
          is_active: 'True',
        });
        expect(requestAutoAppliedLicense).not.toHaveBeenCalled();

        jest.resetAllMocks();
      });

      test('activated license status and no offers', async () => {
        const Component = (
          <UserSubsidyWithAppContext>
            <SubscriptionLicenseConsumer />
            <OffersConsumer />
          </UserSubsidyWithAppContext>
        );
        renderWithRouter(Component, {
          route: `/${TEST_ENTERPRISE_SLUG}`,
        });

        // assert component is initially loading
        expect(screen.getByText(LOADING_SCREEN_READER_TEXT)).toBeInTheDocument();

        await waitFor(() => {
          expect(screen.queryByText(`License status: ${LICENSE_STATUS.ACTIVATED}`)).toBeInTheDocument();
          expect(screen.queryByText('Offers count: none')).toBeInTheDocument();
        });

        // assert component is no longer loading
        expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).not.toBeInTheDocument();
      });
    });

    describe('with auto-applied license, no offers', () => {
      beforeEach(() => {
        fetchSubscriptionLicensesForUser.mockResolvedValueOnce(mockEmptyListResponse);
        fetchCustomerAgreementData.mockResolvedValueOnce(mockCustomerAgreementData);
        fetchOffers.mockResolvedValueOnce(mockEmptyListResponse);
        requestAutoAppliedLicense.mockResolvedValueOnce({
          data: {
            uuid: 'test-license-uuid',
            status: 'activated',
          },
        });
      });

      afterEach(() => {
        expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
        expect(fetchCustomerAgreementData).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
        const customerAgreementId = mockCustomerAgreementData.data.results[0].uuid;
        expect(requestAutoAppliedLicense).toHaveBeenCalledWith(customerAgreementId);

        jest.resetAllMocks();
      });

      test('no existing license, requests auto-applied license and has portal access', async () => {
        const Component = (
          <UserSubsidyWithAppContext
            enterpriseConfig={{
              identityProvider: 'test-provider',
            }}
          >
            <SubscriptionLicenseConsumer />
            <OffersConsumer />
          </UserSubsidyWithAppContext>
        );
        renderWithRouter(Component, {
          route: `/${TEST_ENTERPRISE_SLUG}`,
        });

        // assert component is initially loading
        expect(screen.getByText(LOADING_SCREEN_READER_TEXT)).toBeInTheDocument();

        await waitFor(() => {
          expect(screen.queryByText(`License status: ${LICENSE_STATUS.ACTIVATED}`)).toBeInTheDocument();
          expect(screen.queryByText('Offers count: none')).toBeInTheDocument();
        });

        // assert component is no longer loading
        expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).not.toBeInTheDocument();
      });
    });

    describe('with offers, no license', () => {
      beforeEach(() => {
        fetchOffers.mockResolvedValueOnce({
          data: {
            results: [{
              code: 'test-code',
              redemptions_remaining: 1,
              catalog: 'test-catalog-uuid',
            }],
          },
        });
        fetchSubscriptionLicensesForUser.mockResolvedValueOnce(mockEmptyListResponse);
        fetchCustomerAgreementData.mockResolvedValueOnce(mockEmptyListResponse);
      });

      afterEach(() => {
        expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
        expect(fetchCustomerAgreementData).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
        expect(fetchOffers).toHaveBeenCalledWith({
          enterprise_uuid: TEST_ENTERPRISE_UUID,
          full_discount_only: 'True',
          is_active: 'True',
        });
        expect(requestAutoAppliedLicense).not.toHaveBeenCalled();
      });

      test('has portal access and shows correct code redemptions', async () => {
        const Component = (
          <UserSubsidyWithAppContext>
            <SubscriptionLicenseConsumer />
            <OffersConsumer />
          </UserSubsidyWithAppContext>
        );
        renderWithRouter(Component, {
          route: `/${TEST_ENTERPRISE_SLUG}`,
        });

        // assert component is initially loading
        expect(screen.getByText(LOADING_SCREEN_READER_TEXT)).toBeInTheDocument();

        await waitFor(() => {
          expect(screen.queryByText('Offers count: 1')).toBeInTheDocument();
          expect(screen.queryByText('License status: none')).toBeInTheDocument();
        });

        // assert component is no longer loading
        expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).not.toBeInTheDocument();
      });
    });
  });
});
