import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';

import UserSubsidy from '../UserSubsidy';

import { LOADING_SCREEN_READER_TEXT } from '../data/constants';
import { useCouponCodes, useSubscriptions, useRedeemableLearnerCreditPolicies } from '../data/hooks';
import { useEnterpriseOffers } from '../enterprise-offers/data/hooks';

jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useSubscriptions: jest.fn().mockReturnValue({}),
  useCouponCodes: jest.fn().mockReturnValue([]),
  useRedeemableLearnerCreditPolicies: jest.fn().mockReturnValue({ data: undefined }),
}));

jest.mock('../enterprise-offers/data/hooks', () => ({
  ...jest.requireActual('../enterprise-offers/data/hooks'),
  useEnterpriseOffers: jest.fn().mockReturnValue({}),
}));

const TEST_ENTERPRISE_SLUG = 'test-enterprise-slug';
const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_USER = {
  username: 'test-username',
  roles: [`enterprise_learner:${TEST_ENTERPRISE_UUID}`],
};

const UserSubsidyWithAppContext = ({
  enterpriseConfig = {},
  contextValue = {},
  authenticatedUser = TEST_USER,
  children,
}) => (
  <AppContext.Provider
    value={{
      enterpriseConfig: {
        slug: TEST_ENTERPRISE_SLUG,
        uuid: TEST_ENTERPRISE_UUID,
        ...enterpriseConfig,
      },
      authenticatedUser,
      ...contextValue,
    }}
  >
    <UserSubsidy>
      {children}
    </UserSubsidy>
  </AppContext.Provider>
);

describe('UserSubsidy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    {
      isSubscriptionsLoading: false,
      isCouponCodesLoading: false,
      isEnterpriseOffersLoading: false,
      isLoadingRedeemablePolicies: false,
      isLoadingExpected: false,
    },
    {
      isSubscriptionsLoading: true,
      isCouponCodesLoading: false,
      isEnterpriseOffersLoading: false,
      isLoadingRedeemablePolicies: false,
      isLoadingExpected: true,
    },
    {
      isSubscriptionsLoading: false,
      isCouponCodesLoading: true,
      isEnterpriseOffersLoading: false,
      isLoadingRedeemablePolicies: false,
      isLoadingExpected: true,
    },
    {
      isSubscriptionsLoading: false,
      isCouponCodesLoading: false,
      isEnterpriseOffersLoading: true,
      isLoadingRedeemablePolicies: false,
      isLoadingExpected: true,
    },
    {
      isSubscriptionsLoading: false,
      isCouponCodesLoading: false,
      isEnterpriseOffersLoading: false,
      isLoadingRedeemablePolicies: true,
      isLoadingExpected: true,
    },
    {
      isSubscriptionsLoading: true,
      isCouponCodesLoading: true,
      isEnterpriseOffersLoading: true,
      isLoadingRedeemablePolicies: true,
      isLoadingExpected: true,
    },
    {
      isSubscriptionsLoading: true,
      isCouponCodesLoading: true,
      isEnterpriseOffersLoading: false,
      isLoadingRedeemablePolicies: true,
      isLoadingExpected: true,
    },
  ])('shows loading spinner when expected (%s)', ({
    isSubscriptionsLoading,
    isCouponCodesLoading,
    isEnterpriseOffersLoading,
    isLoadingRedeemablePolicies,
    isLoadingExpected,
  }) => {
    useSubscriptions.mockReturnValue({ isLoading: isSubscriptionsLoading });
    useCouponCodes.mockReturnValue([[], isCouponCodesLoading]);
    useEnterpriseOffers.mockReturnValue({ isLoading: isEnterpriseOffersLoading });
    useRedeemableLearnerCreditPolicies.mockReturnValue({
      data: { redeemablePolicies: [], learnerContentAssignments: [] },
      isLoading: isLoadingRedeemablePolicies,
    });

    const Component = (
      <UserSubsidyWithAppContext>
        <div>hello world</div>
      </UserSubsidyWithAppContext>
    );
    render(Component);

    if (isLoadingExpected) {
      // assert component is loading
      expect(screen.getByText(LOADING_SCREEN_READER_TEXT)).toBeInTheDocument();
      expect(screen.queryByText('hello world')).not.toBeInTheDocument();
    } else {
      // assert component is not loading
      expect(screen.queryByText(LOADING_SCREEN_READER_TEXT)).not.toBeInTheDocument();
      expect(screen.getByText('hello world')).toBeInTheDocument();
    }
  });
});
