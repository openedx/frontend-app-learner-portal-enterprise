import { renderHook } from '@testing-library/react';
import { SearchContext, SHOW_ALL_NAME } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';
import { logInfo } from '@edx/frontend-platform/logging';
import useDefaultSearchFilters from './useDefaultSearchFilters';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useSearchCatalogs from './useSearchCatalogs';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useAlgoliaSearch from './useAlgoliaSearch';
import { generateTestPermutations } from '../../../../utils/tests';
import { features } from '../../../../config';
import { isObjEmpty } from '../utils';

jest.mock('./useEnterpriseCustomer', () => jest.fn());
jest.mock('./useSearchCatalogs', () => jest.fn());
jest.mock('./useAlgoliaSearch', () => jest.fn());
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  getSupportedLocale: jest.fn().mockReturnValue('en'),
}));
jest.mock('../../../../config', () => ({
  ...jest.requireActual('../../../../config'),
  features: {
    FEATURE_ENABLE_VIDEO_CATALOG: false,
  },
}));

jest.mock('@edx/frontend-enterprise-catalog-search', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-catalog-search'),
  setRefinementAction: jest.fn(() => ({ key: 'SET_REFINEMENT' })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    search: '?q=test%20query&subjects=Computer%20Science,Communication&availability=Upcoming&ignore=true',
  }),
  useHistory: () => ({ push: jest.fn }),
  useParams: () => ({ enterpriseSlug: 'test' }),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();
const mockSearchCatalogs = ['test-catalog-uuid-1', 'test-catalog-uuid-2'];
const emptyRefinements = { refinements: {} };
const refinementsShowAll = { refinements: { [SHOW_ALL_NAME]: 1 } };

const SearchWrapper = (value) => function BaseSearchWrapper({ children }) {
  return (
    <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
      <SearchContext.Provider value={value}>
        {children}
      </SearchContext.Provider>
    </AppContext.Provider>
  );
};

// TODO: Test and hook may have to be refactored
describe('useDefaultSearchFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useSearchCatalogs.mockReturnValue([]);
    useAlgoliaSearch.mockReturnValue({ catalogUuidsToCatalogQueryUuids: {}, shouldUseSecuredAlgoliaApiKey: true });
  });

  it('should set SHOW_ALL_NAME to 1 if searchCatalogs.length === 0', () => {
    const mockDispatch = jest.fn();
    const {
      result,
    } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ refinements: {}, dispatch: mockDispatch }) },
    );
    expect(result.current).toEqual('NOT content_type:video AND metadata_language:en');
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should return default search filters if refinements[SHOW_ALL_NAME] = 1', () => {
    const mockDispatch = jest.fn();
    const { result } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ ...refinementsShowAll, dispatch: mockDispatch }) },
    );
    expect(result.current).toEqual('NOT content_type:video AND metadata_language:en');
  });

  // TODO: Fix this test
  it('should return aggregated catalog string if searchCatalogs.length > 0', () => {
    const mockDispatch = jest.fn();
    const catalogUuidsToCatalogQueryUuids = {
      'test-catalog-uuid-1': 'test-catalog-query-uuid-1',
      'test-catalog-uuid-2': 'test-catalog-query-uuid-2',
    };
    useSearchCatalogs.mockReturnValue(mockSearchCatalogs);
    useAlgoliaSearch.mockReturnValue({
      catalogUuidsToCatalogQueryUuids,
      shouldUseSecuredAlgoliaApiKey: true,
    });
    const {
      result,
    } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ refinements: {}, dispatch: mockDispatch }) },
    );
    expect(result.current).toEqual('(enterprise_catalog_query_uuids:test-catalog-query-uuid-1 OR enterprise_catalog_query_uuids:test-catalog-query-uuid-2) AND NOT content_type:video AND metadata_language:en');
  });

  it('should return aggregated catalog string if searchCatalogs.length === 0', () => {
    const mockDispatch = jest.fn();
    const { result } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ refinements: {}, dispatch: mockDispatch }) },
    );
    expect(result.current).toEqual('NOT content_type:video AND metadata_language:en');
  });

  it.each(
    generateTestPermutations({
      catalogUuidsToCatalogQueryUuids: [
        {
          'test-catalog-uuid-1': 'test-catalog-query-uuid-1',
          'test-catalog-uuid-2': 'test-catalog-query-uuid-2',
        },
        {},
      ],
      searchCatalogs: [
        mockSearchCatalogs,
        [],
      ],
      enableVideoCatalog: [true, false],
      showAllRefinements: [true, false],
    }),
  )('should return query based when the secured algolia api key is enabled (%s)', ({
    catalogUuidsToCatalogQueryUuids,
    searchCatalogs,
    enableVideoCatalog,
    showAllRefinements,
  }) => {
    const mockDispatch = jest.fn();
    features.FEATURE_ENABLE_VIDEO_CATALOG = enableVideoCatalog;
    useSearchCatalogs.mockReturnValue(searchCatalogs);
    useAlgoliaSearch.mockReturnValue({
      catalogUuidsToCatalogQueryUuids,
      shouldUseSecuredAlgoliaApiKey: true,
    });
    const refinements = showAllRefinements ? refinementsShowAll : emptyRefinements;

    const baseExpectedCatalogOutput = '(enterprise_catalog_query_uuids:test-catalog-query-uuid-1 OR enterprise_catalog_query_uuids:test-catalog-query-uuid-2)';
    const baseExpectedVideoOutput = 'NOT content_type:video';

    const { result } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ ...refinements, dispatch: mockDispatch }) },
    );

    if (searchCatalogs.length === 0 || isObjEmpty(catalogUuidsToCatalogQueryUuids)) {
      if (enableVideoCatalog) {
        expect(result.current).toEqual('metadata_language:en');
      } else {
        expect(result.current).toEqual(`${baseExpectedVideoOutput} AND metadata_language:en`);
        expect(logInfo).not.toHaveBeenCalled();
      }
    }
    if ((!showAllRefinements && searchCatalogs.length > 0) && !isObjEmpty(catalogUuidsToCatalogQueryUuids)) {
      if (enableVideoCatalog) {
        expect(result.current).toEqual(`${baseExpectedCatalogOutput} AND metadata_language:en`);
        expect(logInfo).not.toHaveBeenCalled();
      } else {
        expect(result.current).toEqual(`${baseExpectedCatalogOutput} AND ${baseExpectedVideoOutput} AND metadata_language:en`);
        expect(logInfo).not.toHaveBeenCalled();
      }
    }
  });
  it('calls logInfo if shouldUseSecuredAlgoliaApiKey is false', () => {
    const mockDispatch = jest.fn();
    useSearchCatalogs.mockReturnValue([]);
    useAlgoliaSearch.mockReturnValue({
      catalogUuidsToCatalogQueryUuids: {
        'test-catalog-uuid-1': 'test-catalog-query-uuid-1',
        'test-catalog-uuid-2': 'test-catalog-query-uuid-2',
      },
      shouldUseSecuredAlgoliaApiKey: false,
    });
    const { result } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ ...emptyRefinements, dispatch: mockDispatch }) },
    );
    expect(result.current).toEqual('');
    expect(logInfo).toHaveBeenCalledTimes(1);
  });
});
