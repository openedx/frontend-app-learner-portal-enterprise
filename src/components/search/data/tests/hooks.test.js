import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';

import {
  useDefaultSearchFilters,
  useRefinementsFromQueryParams,
  useActiveRefinementsByAttribute,
  useActiveRefinementsAsFlatArray,
  useNbHitsFromSearchResults,
} from '../hooks';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_SUBSCRIPTION_CATALOG_UUID = 'test-subscription-catalog-uuid';

jest.mock('react-router-dom', () => ({
  useLocation: () => ({
    search: '?q=test%20query&subjects=Computer%20Science,Communication&availability=Upcoming&ignore=true',
  }),
}));

describe('useRefinementsFromQueryParams hook', () => {
  test('returns expected refinements data given specific query params', () => {
    const { result } = renderHook(() => useRefinementsFromQueryParams());

    const refinements = result.current;

    // note: the query parameters are configured above when mocking out `useLocation`
    expect(refinements).toEqual({
      q: 'test query',
      subjects: ['Computer Science', 'Communication'],
      availability: ['Upcoming'],
    });
  });
});

describe('useActiveRefinementsByAttribute and useActiveRefinementsAsFlatArray hooks', () => {
  const items = [{
    attribute: 'subjects',
    items: [{ label: 'Computer Science' }, { label: 'Communication' }],
  }, {
    attribute: 'availability',
    items: [{ label: 'Available Now' }],
  }];

  describe('useActiveRefinementsByAttribute', () => {
    test('returns expected data given specific items', () => {
      const { result } = renderHook(() => useActiveRefinementsByAttribute(items));

      const refinements = result.current;

      expect(refinements).toEqual({
        subjects: [{ label: 'Computer Science' }, { label: 'Communication' }],
        availability: [{ label: 'Available Now' }],
      });
    });
  });

  describe('useActiveRefinementsAsFlatArray', () => {
    test('returns expected data given specific items', () => {
      const { result } = renderHook(() => useActiveRefinementsAsFlatArray(items));

      const refinementsAsFlatArray = result.current;

      expect(refinementsAsFlatArray).toEqual([
        { label: 'Computer Science', attribute: 'subjects' },
        { label: 'Communication', attribute: 'subjects' },
        { label: 'Available Now', attribute: 'availability' },
      ]);
    });
  });
});

describe('useDefaultSearchFilters hook', () => {
  test('returns enterprise customer uuid as filter', () => {
    const enterpriseConfig = { uuid: TEST_ENTERPRISE_UUID };

    const { result } = renderHook(() => useDefaultSearchFilters({
      enterpriseConfig,
    }));

    const filter = result.current;

    expect(filter).toBeDefined();
    expect(filter).toEqual(`enterprise_customer_uuids:${TEST_ENTERPRISE_UUID}`);
  });

  test('returns subscription catalog uuid as filter', () => {
    const enterpriseConfig = { uuid: TEST_ENTERPRISE_UUID };
    const subscriptionPlan = { enterpriseCatalogUuid: TEST_SUBSCRIPTION_CATALOG_UUID };

    const { result } = renderHook(() => useDefaultSearchFilters({
      enterpriseConfig, subscriptionPlan,
    }));

    const filter = result.current;

    expect(filter).toBeDefined();
    expect(filter).toEqual(`enterprise_catalog_uuids:${TEST_SUBSCRIPTION_CATALOG_UUID}`);
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
