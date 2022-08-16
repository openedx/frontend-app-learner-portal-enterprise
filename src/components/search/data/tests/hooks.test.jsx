import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';
import {
  SearchContext, SearchData, SHOW_ALL_NAME,
} from '@edx/frontend-enterprise-catalog-search';
import {
  useDefaultSearchFilters,
} from '../hooks';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

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
    test('with valid subscription and showAllCatalogs: returns subscription and all enterprise catalogs', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
      }), { wrapper: SearchWrapper({ ...refinementsShowAll }) });

      const { filters } = result.current;
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
  });
  describe('with catalogs', () => {
    const offerCatalogs = ['catalog1', 'catalog2'];
    test('with showAllCatalogs: returns all enterprise catalgos', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan: null,
        offerCatalogs,
      }), { wrapper: SearchWrapper({ ...refinementsShowAll }) });
      const { filters } = result.current;
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
    test('with valid subscription and show all: returns all enterprise catalogs', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        offerCatalogs,
      }), { wrapper: SearchWrapper({ ...refinementsShowAll }) });
      const { filters } = result.current;
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
  });
});
