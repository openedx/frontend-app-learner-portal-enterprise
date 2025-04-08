import { renderHook } from '@testing-library/react-hooks';
import * as frontendEnterpriseCatalogSearch from '@edx/frontend-enterprise-catalog-search';
import { SearchContext, SHOW_ALL_NAME } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';
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
    useAlgoliaSearch.mockReturnValue({ catalogUuidsToCatalogQueryUuids: {}, shouldUseSecuredAlgoliaApiKey: false });
  });

  it('should set SHOW_ALL_NAME to 1 if searchCatalogs.length === 0', () => {
    const mockDispatch = jest.fn();
    const {
      result,
    } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ refinements: {}, dispatch: mockDispatch }) },
    );
    expect(result.current).toEqual(`enterprise_customer_uuids:${mockEnterpriseCustomer.uuid} AND NOT content_type:video`);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should return default search filters if refinements[SHOW_ALL_NAME] = 1', () => {
    const mockDispatch = jest.fn();
    const { result } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ ...refinementsShowAll, dispatch: mockDispatch }) },
    );
    expect(result.current).toEqual(`enterprise_customer_uuids:${mockEnterpriseCustomer.uuid} AND NOT content_type:video`);
  });

  // TODO: Fix this test
  it('should return aggregated catalog string if searchCatalogs.length > 0', () => {
    const mockDispatch = jest.fn();
    useSearchCatalogs.mockReturnValue(mockSearchCatalogs);
    const {
      result,
    } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ refinements: {}, dispatch: mockDispatch }) },
    );
    expect(result.current).toEqual(`(${frontendEnterpriseCatalogSearch.getCatalogString(mockSearchCatalogs)}) AND NOT content_type:video`);
  });

  it('should return aggregated catalog string if searchCatalogs.length === 0', () => {
    const mockDispatch = jest.fn();
    const { result } = renderHook(
      () => useDefaultSearchFilters(),
      { wrapper: SearchWrapper({ refinements: {}, dispatch: mockDispatch }) },
    );
    expect(result.current).toEqual(`enterprise_customer_uuids:${mockEnterpriseCustomer.uuid} AND NOT content_type:video`);
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
        expect(result.current).toEqual('');
      } else {
        expect(result.current).toEqual(baseExpectedVideoOutput);
      }
    }
    if ((!showAllRefinements && searchCatalogs.length > 0) && !isObjEmpty(catalogUuidsToCatalogQueryUuids)) {
      if (enableVideoCatalog) {
        expect(result.current).toEqual(baseExpectedCatalogOutput);
      } else {
        expect(result.current).toEqual(`${baseExpectedCatalogOutput } AND ${ baseExpectedVideoOutput}`);
      }
    }
  });
});
