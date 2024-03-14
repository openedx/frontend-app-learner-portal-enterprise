import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';
import * as frontendEnterpriseCatalogSearch from '@edx/frontend-enterprise-catalog-search';
import {
  useDefaultSearchFilters, useSearchCatalogs,
} from '../hooks';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import { features } from '../../../../config';
import {
  useCouponCodes,
  useSubscriptions,
  useEnterpriseCustomer, useEnterpriseOffers, useRedeemablePolicies,
} from '../../../app/data';
import { useCatalogsForSubsidyRequests } from '../../../hooks';

const {
  SearchContext, SHOW_ALL_NAME,
} = frontendEnterpriseCatalogSearch;

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useSubscriptions: jest.fn(),
  useRedeemablePolicies: jest.fn(),
  useCouponCodes: jest.fn(),
  useEnterpriseOffers: jest.fn(),
  useBrowseAndRequestConfiguration: jest.fn(() => ({ data: {} })),
  useContentHighlightsConfiguration: jest.fn(() => ({ data: {} })),
  useCanOnlyViewHighlights: jest.fn(() => ({ data: {} })),
  useIsAssignmentsOnlyLearner: jest.fn().mockReturnValue(false),
}));

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useCatalogsForSubsidyRequests: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-catalog-search', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-catalog-search'),
  setRefinementAction: jest.fn(() => ({ key: 'SET_REFINEMENT' })),
}));
jest.mock('react-router-dom', () => ({
  useLocation: () => ({
    search: '?q=test%20query&subjects=Computer%20Science,Communication&availability=Upcoming&ignore=true',
  }),
  useHistory: () => ({ push: jest.fn }),
}));
jest.mock('../../../../config', () => ({
  features: { ENROLL_WITH_CODES: true },
}));

const mockEnterpriseCustomer = {
  name: 'test-enterprise',
  slug: 'test',
  uuid: TEST_ENTERPRISE_UUID,
};

useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
describe('useSearchCatalogs', () => {
  const mockSubscriptionCatalog = 'test-subscription-catalog-uuid';
  const mockCouponCodeCatalog = 'test-coupon-code-catalog-uuid';
  const mockEnterpriseOfferCatalog = 'test-enterprise-offer-catalog-uuid';
  const mockPolicyCatalog = 'test-policy-catalog-uuid';

  it.each('should include catalog from subscription (%s)', ({ isSubscriptionPlanExpired }) => {
    const mockSubscriptionLicense = {
      status: LICENSE_STATUS.ACTIVATED,
      subscriptionPlan: {
        enterpriseCatalogUuid: mockSubscriptionCatalog,
      },
    };
    useRedeemablePolicies.mockReturnValue({ data: { redeemablePolicies: [] } });
    useCatalogsForSubsidyRequests.mockReturnValue({ catalogsForSubsidyRequests: [] });
    useEnterpriseOffers.mockReturnValue({ data: { currentEnterpriseOffers: [] } });
    useSubscriptions.mockReturnValue({ data: { subscriptionLicense: mockSubscriptionLicense } });
    useCouponCodes.mockReturnValue({ data: { couponCodeAssignments: [] } });
    const { result } = renderHook((() => useSearchCatalogs()));
    if (isSubscriptionPlanExpired) {
      expect(result.current).toEqual([]);
    } else {
      expect(result.current).toEqual([mockSubscriptionCatalog]);
    }
  });

  it.each([
    { isCouponExpired: true },
    { isCouponExpired: false },
  ])('should include catalogs from coupon codes if features.ENROLL_WITH_CODES = true (%s)', ({
    isCouponExpired,
  }) => {
    features.ENROLL_WITH_CODES = true;
    const mockCouponCodeAssignments = [
      {
        catalog: mockCouponCodeCatalog,
        available: !isCouponExpired,
      },
    ];
    useRedeemablePolicies.mockReturnValue({ data: { redeemablePolicies: [] } });
    useCatalogsForSubsidyRequests.mockReturnValue({ catalogsForSubsidyRequests: [] });
    useEnterpriseOffers.mockReturnValue({ data: { currentEnterpriseOffers: [] } });
    useSubscriptions.mockReturnValue({ data: { subscriptionLicense: {} } });
    useCouponCodes.mockReturnValue({ data: { couponCodeAssignments: mockCouponCodeAssignments } });
    const { result } = renderHook(() => useSearchCatalogs());
    if (isCouponExpired) {
      expect(result.current).toEqual([]);
    } else {
      expect(result.current).toEqual([mockCouponCodeCatalog]);
    }
  });

  it('should not include catalogs from coupon codes if features.ENROLL_WITH_CODES = false', () => {
    features.ENROLL_WITH_CODES = false;
    const mockCouponCodeAssignments = [
      {
        catalog: mockCouponCodeCatalog,
      },
    ];
    useRedeemablePolicies.mockReturnValue({ data: { redeemablePolicies: [] } });
    useCatalogsForSubsidyRequests.mockReturnValue({ catalogsForSubsidyRequests: [] });
    useEnterpriseOffers.mockReturnValue({ data: { currentEnterpriseOffers: [] } });
    useSubscriptions.mockReturnValue({ data: { subscriptionLicense: {} } });
    useCouponCodes.mockReturnValue({ data: { couponCodeAssignments: mockCouponCodeAssignments } });
    const { result } = renderHook(() => useSearchCatalogs());
    expect(result.current).toEqual([]);
  });

  it('should include catalogs from enterprise offers if features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = true', () => {
    features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = true;
    const mockCurrentEnterpriseOffers = [{ enterpriseCatalogUuid: mockEnterpriseOfferCatalog }];
    useRedeemablePolicies.mockReturnValue({ data: { redeemablePolicies: [] } });
    useCatalogsForSubsidyRequests.mockReturnValue({ catalogsForSubsidyRequests: [] });
    useEnterpriseOffers.mockReturnValue({ data: { currentEnterpriseOffers: mockCurrentEnterpriseOffers } });
    useSubscriptions.mockReturnValue({ data: { subscriptionLicense: {} } });
    useCouponCodes.mockReturnValue({ data: { couponCodeAssignments: [] } });
    const { result } = renderHook(() => useSearchCatalogs());
    expect(result.current).toEqual([mockEnterpriseOfferCatalog]);
  });

  it('should not include catalogs from enterprise offers if features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = false', () => {
    features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = false;
    const mockCurrentEnterpriseOffers = [{ enterpriseCatalogUuid: mockEnterpriseOfferCatalog }];
    useRedeemablePolicies.mockReturnValue({ data: { redeemablePolicies: [] } });
    useCatalogsForSubsidyRequests.mockReturnValue({ catalogsForSubsidyRequests: [] });
    useEnterpriseOffers.mockReturnValue({ data: { currentEnterpriseOffers: mockCurrentEnterpriseOffers } });
    useSubscriptions.mockReturnValue({ data: { subscriptionLicense: {} } });
    useCouponCodes.mockReturnValue({ data: { couponCodeAssignments: [] } });
    const { result } = renderHook(() => useSearchCatalogs());
    expect(result.current).toEqual([]);
  });

  it('should include catalogs for browse and request', () => {
    const mockCatalogsForSubsidyRequests = ['test-catalog-uuid-1', 'test-catalog-uuid-2'];
    useRedeemablePolicies.mockReturnValue({ data: { redeemablePolicies: [] } });
    useCatalogsForSubsidyRequests.mockReturnValue({ catalogsForSubsidyRequests: mockCatalogsForSubsidyRequests });
    useEnterpriseOffers.mockReturnValue({ data: { currentEnterpriseOffers: [] } });
    useSubscriptions.mockReturnValue({ data: { subscriptionLicense: {} } });
    useCouponCodes.mockReturnValue({ data: { couponCodeAssignments: [] } });
    const { result } = renderHook(() => useSearchCatalogs());
    expect(result.current).toEqual(mockCatalogsForSubsidyRequests);
  });

  it.each([
    {
      hasDefinedPolicies: false,
      isPolicyExpired: false,
    },
    {
      hasDefinedPolicies: true,
      isPolicyExpired: false,
    },
    {
      hasDefinedPolicies: true,
      isPolicyExpired: true,
    },
  ])('should include catalogs for redeemable subsidy access policies (%s)', ({
    hasDefinedPolicies,
    isPolicyExpired,
  }) => {
    const mockRedeemableLearnerCreditPolicies = {
      redeemablePolicies: hasDefinedPolicies ? [{
        active: !isPolicyExpired,
        catalogUuid: mockPolicyCatalog,
      }] : [],
      learnerContentAssignments: [],
    };
    useRedeemablePolicies.mockReturnValue({ data: mockRedeemableLearnerCreditPolicies });
    useCatalogsForSubsidyRequests.mockReturnValue({ catalogsForSubsidyRequests: [] });
    useEnterpriseOffers.mockReturnValue({ data: { currentEnterpriseOffers: [] } });
    useSubscriptions.mockReturnValue({ data: { subscriptionLicense: {} } });
    useCouponCodes.mockReturnValue({ data: { couponCodeAssignments: [] } });
    const { result } = renderHook(() => useSearchCatalogs());

    if (!hasDefinedPolicies || isPolicyExpired) {
      expect(result.current).toEqual([]);
    } else {
      expect(result.current).toEqual([mockPolicyCatalog]);
    }
  });
});

const SearchWrapper = (value) => function BaseSearchWrapper({ children }) {
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

describe('useDefaultSearchFilters', () => {
  const refinementsShowAll = { refinements: { [SHOW_ALL_NAME]: 1 } };

  it('should set SHOW_ALL_NAME to 1 if searchCatalogs.length === 0', () => {
    const mockDispatch = jest.fn();
    const {
      result,
    } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ refinements: {}, dispatch: mockDispatch }) },
    );
    const { filters } = result.current;
    expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should return default search filters if refinements[SHOW_ALL_NAME] = 1', () => {
    const mockDispatch = jest.fn();
    const {
      result,
    } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ ...refinementsShowAll, dispatch: mockDispatch }) },
    );
    const { filters } = result.current;
    expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
  });

  // TODO: Fix this test
  it.skip('should return aggregated catalog string if searchCatalogs.length > 0', () => {
    const mockDispatch = jest.fn();
    const mockUseSearchCatalog = jest.fn();
    const mockSearchCatalogs = ['test-catalog-uuid-1', 'test-catalog-uuid-2'];
    mockUseSearchCatalog.mockImplementation(() => mockSearchCatalogs);
    const {
      result,
    } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ refinements: {}, dispatch: mockDispatch }) },
    );
    const { filters } = result.current;
    expect(filters).toEqual(frontendEnterpriseCatalogSearch.getCatalogString(mockSearchCatalogs));
  });

  it('should return aggregated catalog string if searchCatalogs.length === 0', () => {
    const mockDispatch = jest.fn();
    const {
      result,
    } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ refinements: {}, dispatch: mockDispatch }) },
    );
    const { filters } = result.current;
    expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
  });
});
