import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';
import * as frontendEnterpriseCatalogSearch from '@edx/frontend-enterprise-catalog-search';
import {
  useDefaultSearchFilters,
} from '../hooks';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import { features } from '../../../../config';

const {
  getCatalogString, SearchContext, SearchData, SHOW_ALL_NAME,
} = frontendEnterpriseCatalogSearch;

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_SUBSCRIPTION_CATALOG_UUID = 'test-subscription-catalog-uuid';

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

const SearchWrapper = (value) => ({ children }) => (
  <SearchContext.Provider value={value}>{children}</SearchContext.Provider>);

describe('useDefaultSearchFilters hook', () => {
  const enterpriseConfig = { uuid: TEST_ENTERPRISE_UUID };
  const subscriptionPlan = { enterpriseCatalogUuid: TEST_SUBSCRIPTION_CATALOG_UUID };
  const validSubscriptionLicense = { status: LICENSE_STATUS.ACTIVATED };
  const invalidSubscriptionLicense = { status: LICENSE_STATUS.ASSIGNED };
  const refinementsShowAll = { refinements: { [SHOW_ALL_NAME]: 1 } };

  describe('no catalogs', () => {
    test('no subscription: returns enterprise customer uuid as filter', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
      }), { wrapper: SearchData });
      const { filters } = result.current;
      expect(filters).toBeDefined();
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });

    test('with valid subscription: returns subscription catalog uuid as filter', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig, subscriptionPlan, subscriptionLicense: validSubscriptionLicense,
      }), { wrapper: SearchData });
      const { filters } = result.current;
      expect(filters).toBeDefined();
      expect(filters).toEqual(`enterprise_catalog_uuids:${TEST_SUBSCRIPTION_CATALOG_UUID}`);
    });

    test('with invalid subscription: returns enterprise customer uuid as a filter', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        subscriptionLicense: invalidSubscriptionLicense,
      }), { wrapper: SearchData });
      const { filters } = result.current;
      expect(filters).toBeDefined();
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
    test('with valid subscription and showAllCatalogs: returns subscription and all enterprise catalogs', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        subscriptionLicense: validSubscriptionLicense,
      }), { wrapper: SearchWrapper({ ...refinementsShowAll }) });

      const { filters } = result.current;
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
  });
  describe('with catalogs', () => {
    const couponCodesCatalogs = ['catalog1', 'catalog2'];
    test('with valid subscription: returns subscription and coupon codes', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        subscriptionLicense: validSubscriptionLicense,
        couponCodesCatalogs,
      }), { wrapper: SearchData });
      const { filters } = result.current;
      expect(filters).toBeDefined();
      const expectedFilters = `${getCatalogString(couponCodesCatalogs)} OR enterprise_catalog_uuids:${TEST_SUBSCRIPTION_CATALOG_UUID}`;
      expect(filters).toEqual(expectedFilters);
    });
    test('with invalid subscription: returns coupon codes catalogs', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        subscriptionLicense: invalidSubscriptionLicense,
        couponCodesCatalogs,
      }), { wrapper: SearchData });
      const { filters } = result.current;
      expect(filters).toBeDefined();
      expect(filters)
        .toEqual(getCatalogString(couponCodesCatalogs));
    });
    test('no subscription: returns only coupon codes', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan: null,
        couponCodesCatalogs,
      }), { wrapper: SearchData });
      const { filters } = result.current;
      expect(filters).toBeDefined();
      expect(filters).toEqual(getCatalogString(couponCodesCatalogs));
    });
    test('with showAllCatalogs: returns all enterprise catalgos', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan: null,
        couponCodesCatalogs,
      }), { wrapper: SearchWrapper({ ...refinementsShowAll }) });
      const { filters } = result.current;
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
    test('with valid subscription and show all: returns all enterprise catalogs', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        subscriptionLicense: validSubscriptionLicense,
        couponCodesCatalogs,
      }), { wrapper: SearchWrapper({ ...refinementsShowAll }) });
      const { filters } = result.current;
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
  });

  describe('with subsidy requests enabled', () => {
    features.FEATURE_BROWSE_AND_REQUEST = true;

    beforeEach(() => jest.clearAllMocks());

    test('sets SHOW_ALL_NAME refinement correctly', () => {
      const setRefinementActionSpy = jest.spyOn(frontendEnterpriseCatalogSearch, 'setRefinementAction');
      const subsidyRequestConfiguration = {
        subsidyRequestsEnabled: true,
      };
      const catalogsForSubsidyRequests = ['catalog-1'];
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        subscriptionLicense: invalidSubscriptionLicense,
        couponCodesCatalogs: [],
        subsidyRequestConfiguration,
        catalogsForSubsidyRequests,
      }), { wrapper: SearchData });
      const { filters } = result.current;
      expect(filters).toEqual(getCatalogString(catalogsForSubsidyRequests));
      expect(setRefinementActionSpy).not.toHaveBeenCalled();
    });

    test('returns catalogs for subsidy requests if there are no assigned subsidies', () => {
      const subsidyRequestConfiguration = {
        subsidyRequestsEnabled: true,
      };
      const catalogsForSubsidyRequests = ['catalog1', 'catalog2'];
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        subscriptionLicense: invalidSubscriptionLicense,
        couponCodesCatalogs: [],
        subsidyRequestConfiguration,
        catalogsForSubsidyRequests,
      }), { wrapper: SearchData });
      const { filters } = result.current;
      expect(filters).toEqual(getCatalogString(catalogsForSubsidyRequests));
    });

    test('returns catalogs for subsidy requests and catalogs from assigned subsidies', () => {
      const subsidyRequestConfiguration = {
        subsidyRequestsEnabled: true,
      };
      const couponCodesCatalogs = ['catalog1'];
      const catalogsForSubsidyRequests = ['catalog2'];
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        subscriptionLicense: invalidSubscriptionLicense,
        couponCodesCatalogs,
        subsidyRequestConfiguration,
        catalogsForSubsidyRequests,
      }), { wrapper: SearchData });
      const { filters } = result.current;
      expect(filters).toEqual(getCatalogString([...couponCodesCatalogs, ...catalogsForSubsidyRequests]));
    });

    test('returns all enterprise catalogs if there are no catalogs for subsidy requests', () => {
      const subsidyRequestConfiguration = {
        subsidyRequestsEnabled: true,
      };
      const catalogsForSubsidyRequests = [];
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        subscriptionLicense: invalidSubscriptionLicense,
        couponCodesCatalogs: [],
        subsidyRequestConfiguration,
        catalogsForSubsidyRequests,
      }), { wrapper: SearchData });
      const { filters } = result.current;
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
  });
});
