import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';

import { SUBJECTS, AVAILABLILITY, FACET_ATTRIBUTES } from './constants';
import {
  useDefaultSearchFilters,
  useRefinementsFromQueryParams,
  useActiveRefinementsByAttribute,
  useActiveRefinementsAsFlatArray,
  useNbHitsFromSearchResults,
  getCatalogString,
} from '../hooks';
import SearchData from '../../SearchContext';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_SUBSCRIPTION_CATALOG_UUID = 'test-subscription-catalog-uuid';

const TEST_QUERY = 'test query';

jest.mock('react-router-dom', () => ({
  useLocation: () => ({
    search: '?q=test%20query&subjects=Computer%20Science,Communication&availability=Upcoming&ignore=1',
  }),
}));
jest.mock('../../../../config', () => ({
  features: { ENROLL_WITH_CODES: 1 },
}));

describe('useRefinementsFromQueryParams hook', () => {
  test('returns expected refinements data given specific query params', () => {
    const { result } = renderHook(() => useRefinementsFromQueryParams());

    const refinements = result.current;

    // note: the query parameters are configured above when mocking out `useLocation`
    expect(refinements).toEqual({
      q: TEST_QUERY,
      subjects: [SUBJECTS.COMPUTER_SCIENCE, SUBJECTS.COMMUNICATION],
      availability: [AVAILABLILITY.UPCOMING],
    });
  });
});

describe('useActiveRefinementsByAttribute and useActiveRefinementsAsFlatArray hooks', () => {
  const items = [{
    attribute: FACET_ATTRIBUTES.SUBJECTS,
    items: [{ label: SUBJECTS.COMPUTER_SCIENCE }, { label: SUBJECTS.COMMUNICATION }],
  }, {
    attribute: FACET_ATTRIBUTES.AVAILABLILITY,
    items: [{ label: AVAILABLILITY.AVAILABLE_NOW }],
  }];

  describe('useActiveRefinementsByAttribute', () => {
    test('returns expected data given specific items', () => {
      const { result } = renderHook(() => useActiveRefinementsByAttribute(items));

      const refinements = result.current;

      expect(refinements).toEqual({
        subjects: [{ label: SUBJECTS.COMPUTER_SCIENCE }, { label: SUBJECTS.COMMUNICATION }],
        availability: [{ label: AVAILABLILITY.AVAILABLE_NOW }],
      });
    });
  });

  describe('useActiveRefinementsAsFlatArray', () => {
    test('returns expected data given specific items', () => {
      const { result } = renderHook(() => useActiveRefinementsAsFlatArray(items));

      const refinementsAsFlatArray = result.current;

      expect(refinementsAsFlatArray).toEqual([
        { label: SUBJECTS.COMPUTER_SCIENCE, attribute: FACET_ATTRIBUTES.SUBJECTS },
        { label: SUBJECTS.COMMUNICATION, attribute: FACET_ATTRIBUTES.SUBJECTS },
        { label: AVAILABLILITY.AVAILABLE_NOW, attribute: FACET_ATTRIBUTES.AVAILABLILITY },
      ]);
    });
  });
});

describe('getCatalogString helper', () => {
  test('returns correct string for one catalog', () => {
    expect(getCatalogString(['catalog'])).toEqual('enterprise_catalog_uuids:catalog');
  });
  test('return correct catalog string for multiple catalogs', () => {
    const catalogs = ['catalog1', 'catalog2'];
    expect(getCatalogString(catalogs))
      .toEqual('enterprise_catalog_uuids:catalog1 OR enterprise_catalog_uuids:catalog2');
  });
});

describe('useDefaultSearchFilters hook', () => {
  const enterpriseConfig = { uuid: TEST_ENTERPRISE_UUID };
  const subscriptionPlan = { enterpriseCatalogUuid: TEST_SUBSCRIPTION_CATALOG_UUID };
  test('showAllCatalogs can be set', () => {
    const { result } = renderHook(() => useDefaultSearchFilters({
      enterpriseConfig,
      subscriptionPlan,
    }), { wrapper: SearchData });
    // eslint-disable-next-line prefer-const
    let { showAllCatalogs, setShowAllCatalogs } = result.current;
    expect(showAllCatalogs).toEqual(0);
    act(() => setShowAllCatalogs(1));
    showAllCatalogs = result.current.showAllCatalogs;
    expect(showAllCatalogs).toEqual(1);
  });
  describe('no catalogs', () => {
    test('no subscription: returns enterprise customer uuid as filter', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
      }), { wrapper: SearchData });
      const { filters, showAllCatalogs } = result.current;
      expect(filters).toBeDefined();
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
      expect(showAllCatalogs).toEqual(1);
    });

    test('with subscription: returns subscription catalog uuid as filter', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig, subscriptionPlan,
      }), { wrapper: SearchData });
      const { filters, showAllCatalogs } = result.current;
      expect(filters).toBeDefined();
      expect(filters).toEqual(`enterprise_catalog_uuids:${TEST_SUBSCRIPTION_CATALOG_UUID}`);
      expect(showAllCatalogs).toEqual(0);
    });
    test('with subscription and showAllCatalogs: returns subscription and all enterprise catalogs', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
      }), { wrapper: SearchData });
      const { setShowAllCatalogs } = result.current;
      act(() => setShowAllCatalogs(1));
      const { filters } = result.current;
      expect(filters).toEqual(`enterprise_catalog_uuids:test-subscription-catalog-uuid OR enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
  });
  describe('with catalogs', () => {
    const offerCatalogs = ['catalog1', 'catalog2'];
    test('with subscription: returns subscription and offers', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        offerCatalogs,
      }), { wrapper: SearchData });
      const { filters, showAllCatalogs } = result.current;
      expect(filters).toBeDefined();
      expect(filters)
        .toEqual(`enterprise_catalog_uuids:${TEST_SUBSCRIPTION_CATALOG_UUID} OR ${getCatalogString(offerCatalogs)}`);
      expect(showAllCatalogs).toEqual(0);
    });
    test('no subscription: returns only offers', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan: null,
        offerCatalogs,
      }), { wrapper: SearchData });
      const { filters, showAllCatalogs } = result.current;
      expect(filters).toBeDefined();
      expect(filters).toEqual(getCatalogString(offerCatalogs));
      expect(showAllCatalogs).toEqual(0);
    });
    test('with showAllCatalogs: returns all enterprise catalgos', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan: null,
        offerCatalogs,
      }), { wrapper: SearchData });
      const { setShowAllCatalogs } = result.current;
      act(() => setShowAllCatalogs(1));
      const { filters } = result.current;
      expect(filters).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
    test('with subscription and show all: returns subscription and all enterprise catalogs', () => {
      const { result } = renderHook(() => useDefaultSearchFilters({
        enterpriseConfig,
        subscriptionPlan,
        offerCatalogs,
      }), { wrapper: SearchData });
      const { setShowAllCatalogs } = result.current;
      act(() => setShowAllCatalogs(1));
      const { filters } = result.current;
      expect(filters).toEqual(`enterprise_catalog_uuids:test-subscription-catalog-uuid OR enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
    });
  });
});

describe('useNbHitsFromSearchResults hook', () => {
  test('returns non-null number of hits', () => {
    const searchResults = { nbHits: 10 };

    const { result } = renderHook(() => useNbHitsFromSearchResults(searchResults));
    const nbHits = result.current;

    expect(nbHits).toEqual(10);
  });

  test('returns null if searchResults is not given', () => {
    const searchResults = undefined;

    const { result } = renderHook(() => useNbHitsFromSearchResults(searchResults));
    const nbHits = result.current;

    expect(nbHits).toEqual(null);
  });

  test('returns null if nbHits is null', () => {
    const searchResults = { nbHits: null };

    const { result } = renderHook(() => useNbHitsFromSearchResults(searchResults));
    const nbHits = result.current;

    expect(nbHits).toEqual(null);
  });
});
