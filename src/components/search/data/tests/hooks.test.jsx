import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';
import {
  getCatalogString, SearchContext, SearchData, SHOW_ALL_NAME,
} from '@edx/frontend-enterprise-catalog-search';
import {
  useDefaultSearchFilters,
} from '../hooks';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_SUBSCRIPTION_CATALOG_UUID = 'test-subscription-catalog-uuid';

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
  const refinementsFromQueryParamsShowAll = { refinementsFromQueryParams: { [SHOW_ALL_NAME]: 1 } };
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
      }), { wrapper: SearchWrapper({ ...refinementsFromQueryParamsShowAll }) });

      const { filters } = result.current;
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
  });
  describe('with catalogs', () => {
    const offerCatalogs = ['catalog1', 'catalog2'];
    test('with valid subscription: returns subscription and offers', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        subscriptionLicense: validSubscriptionLicense,
        offerCatalogs,
      }), { wrapper: SearchData });
      const { filters } = result.current;
      expect(filters).toBeDefined();
      const expectedFilters = `${getCatalogString(offerCatalogs)} OR enterprise_catalog_uuids:${TEST_SUBSCRIPTION_CATALOG_UUID}`;
      expect(filters).toEqual(expectedFilters);
    });
    test('with invalid subscription: returns offer catalogs', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        subscriptionLicense: invalidSubscriptionLicense,
        offerCatalogs,
      }), { wrapper: SearchData });
      const { filters } = result.current;
      expect(filters).toBeDefined();
      expect(filters)
        .toEqual(getCatalogString(offerCatalogs));
    });
    test('no subscription: returns only offers', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan: null,
        offerCatalogs,
      }), { wrapper: SearchData });
      const { filters } = result.current;
      expect(filters).toBeDefined();
      expect(filters).toEqual(getCatalogString(offerCatalogs));
    });
    test('with showAllCatalogs: returns all enterprise catalgos', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan: null,
        offerCatalogs,
      }), { wrapper: SearchWrapper({ ...refinementsFromQueryParamsShowAll }) });
      const { filters } = result.current;
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
    test('with valid subscription and show all: returns all enterprise catalogs', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        subscriptionLicense: validSubscriptionLicense,
        offerCatalogs,
      }), { wrapper: SearchWrapper({ ...refinementsFromQueryParamsShowAll }) });
      const { filters } = result.current;
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
  });
});
