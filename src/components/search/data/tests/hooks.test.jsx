import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';
import * as frontendEnterpriseCatalogSearch from '@edx/frontend-enterprise-catalog-search';
import {
  useDefaultSearchFilters, useSearchCatalogs,
} from '../hooks';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import { features } from '../../../../config';

const {
  SearchContext, SHOW_ALL_NAME,
} = frontendEnterpriseCatalogSearch;

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

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

describe('useSearchCatalogs', () => {
  const mockSubscriptionCatalog = 'test-subscription-catalog-uuid';
  const mockCouponCodeCatalog = 'test-coupon-code-catalog-uuid';
  const mockEnterpriseOfferCatalog = 'test-enterprise-offer-catalog-uuid';

  it('should include catalog from subscription', () => {
    const { result } = renderHook(() => useSearchCatalogs({
      subscriptionPlan: { enterpriseCatalogUuid: mockSubscriptionCatalog },
      subscriptionLicense: { status: LICENSE_STATUS.ACTIVATED },
      couponCodes: [],
      enterpriseOffers: [],
      catalogsForSubsidyRequests: [],
    }));
    expect(result.current).toEqual([mockSubscriptionCatalog]);
  });

  it('should include catalogs from coupon codes if features.ENROLL_WITH_CODES = true', () => {
    features.ENROLL_WITH_CODES = true;

    const { result } = renderHook(() => useSearchCatalogs({
      subscriptionPlan: undefined,
      subscriptionLicense: undefined,
      couponCodes: [{
        catalog: mockCouponCodeCatalog,
      }],
      enterpriseOffers: [],
      catalogsForSubsidyRequests: [],
    }));
    expect(result.current).toEqual([mockCouponCodeCatalog]);
  });

  it('should not include catalogs from coupon codes if features.ENROLL_WITH_CODES = false', () => {
    features.ENROLL_WITH_CODES = false;

    const { result } = renderHook(() => useSearchCatalogs({
      subscriptionPlan: undefined,
      subscriptionLicense: undefined,
      couponCodes: [{
        catalog: mockCouponCodeCatalog,
      }],
      enterpriseOffers: [],
      catalogsForSubsidyRequests: [],
    }));
    expect(result.current).toEqual([]);
  });

  it('should include catalogs from enterprise offers if features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = true', () => {
    features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = true;

    const { result } = renderHook(() => useSearchCatalogs({
      subscriptionPlan: undefined,
      subscriptionLicense: undefined,
      couponCodes: [],
      enterpriseOffers: [{
        enterpriseCatalogUuid: mockEnterpriseOfferCatalog,
      }],
      catalogsForSubsidyRequests: [],
    }));
    expect(result.current).toEqual([mockEnterpriseOfferCatalog]);
  });

  it('should not include catalogs from enterprise offers if features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = false', () => {
    features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = false;

    const { result } = renderHook(() => useSearchCatalogs({
      subscriptionPlan: undefined,
      subscriptionLicense: undefined,
      couponCodes: [],
      enterpriseOffers: [{
        enterpriseCatalogUuid: mockEnterpriseOfferCatalog,
      }],
      catalogsForSubsidyRequests: [],
    }));
    expect(result.current).toEqual([]);
  });

  it('should include catalogs for browse and request', () => {
    const catalogsForSubsidyRequests = ['test-catalog-uuid-1', 'test-catalog-uuid-2'];

    const { result } = renderHook(() => useSearchCatalogs({
      subscriptionPlan: undefined,
      subscriptionLicense: undefined,
      couponCodes: [],
      enterpriseOffers: [],
      catalogsForSubsidyRequests,
    }));
    expect(result.current).toEqual(catalogsForSubsidyRequests);
  });
});

const SearchWrapper = (value) => function ({ children }) {
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

describe('useDefaultSearchFilters', () => {
  const refinementsShowAll = { refinements: { [SHOW_ALL_NAME]: 1 } };
  const enterpriseConfig = {
    uuid: TEST_ENTERPRISE_UUID,
  };

  it('should set SHOW_ALL_NAME to 1 if searchCatalogs.length === 0', () => {
    const mockDispatch = jest.fn();
    const { result } = renderHook(() => useDefaultSearchFilters({
      enterpriseConfig,
      searchCatalogs: [],
    }), { wrapper: SearchWrapper({ refinements: {}, dispatch: mockDispatch }) });
    const { filters } = result.current;
    expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should return default search filters if refinements[SHOW_ALL_NAME] = 1', () => {
    const mockDispatch = jest.fn();
    const { result } = renderHook(() => useDefaultSearchFilters({
      enterpriseConfig,
      searchCatalogs: [],
    }), { wrapper: SearchWrapper({ ...refinementsShowAll, dispatch: mockDispatch }) });
    const { filters } = result.current;
    expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
  });

  it('should return aggregated catalog string if searchCatalogs.length > 0', () => {
    const mockDispatch = jest.fn();
    const mockSearchCatalogs = ['test-catalog-uuid-1', 'test-catalog-uuid-2'];
    const { result } = renderHook(() => useDefaultSearchFilters({
      enterpriseConfig,
      searchCatalogs: mockSearchCatalogs,
    }), { wrapper: SearchWrapper({ refinements: {}, dispatch: mockDispatch }) });
    const { filters } = result.current;
    expect(filters).toEqual(frontendEnterpriseCatalogSearch.getCatalogString(mockSearchCatalogs));
  });

  it('should return aggregated catalog string if searchCatalogs.length === 0', () => {
    const mockDispatch = jest.fn();
    const mockSearchCatalogs = [];
    const { result } = renderHook(() => useDefaultSearchFilters({
      enterpriseConfig,
      searchCatalogs: mockSearchCatalogs,
    }), { wrapper: SearchWrapper({ refinements: {}, dispatch: mockDispatch }) });
    const { filters } = result.current;
    expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
  });
});
