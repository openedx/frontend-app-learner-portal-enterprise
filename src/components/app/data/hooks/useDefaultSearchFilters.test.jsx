import { renderHook } from '@testing-library/react-hooks';
import * as frontendEnterpriseCatalogSearch from '@edx/frontend-enterprise-catalog-search';
import { SearchContext, SHOW_ALL_NAME } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';
import useDefaultSearchFilters from './useDefaultSearchFilters';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useSearchCatalogs from './useSearchCatalogs';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useAlgoliaSearch from './useAlgoliaSearch';

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

const SearchWrapper = (value) => function BaseSearchWrapper({ children }) {
  // eslint-disable-next-line react/jsx-filename-extension
  return (
    <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
      <SearchContext.Provider value={value}>
        {children}
      </SearchContext.Provider>
    </AppContext.Provider>
  );
};

const refinementsShowAll = { refinements: { [SHOW_ALL_NAME]: 1 } };

// TODO: Test and hook may have to be refactored
describe('useDefaultSearchFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useSearchCatalogs.mockReturnValue([]);
    useAlgoliaSearch.mockReturnValue({ catalogUuidsToCatalogQueryUuids: {} });
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
    const mockSearchCatalogs = ['test-catalog-uuid-1', 'test-catalog-uuid-2'];
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
});
