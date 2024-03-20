import { renderHook } from '@testing-library/react-hooks';
import * as frontendEnterpriseCatalogSearch from '@edx/frontend-enterprise-catalog-search';
import React from 'react';
import { SearchContext, SHOW_ALL_NAME } from '@edx/frontend-enterprise-catalog-search';
import { useDefaultSearchFilters } from './index';
import {
  useEnterpriseCustomer,
} from '../../../app/data';
import useSearchCatalogs from './useSearchCatalogs';
import { defaultSubsidyHooksData, mockSubsidyHooksReturnValues } from '../../../../utils/tests';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useSubscriptions: jest.fn(),
  useRedeemablePolicies: jest.fn(),
  useCouponCodes: jest.fn(),
  useEnterpriseOffers: jest.fn(),
}));

jest.mock('./useSearchCatalogs');

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
  useParams: () => ({ enterpriseSlug: 'test' }),
}));

const SearchWrapper = (value) => function BaseSearchWrapper({ children }) {
  // eslint-disable-next-line react/jsx-filename-extension
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

const mockEnterpriseCustomer = {
  name: 'test-enterprise',
  slug: 'test',
  uuid: TEST_ENTERPRISE_UUID,
};

// TODO: Test and hook may have to be refactored
describe('useDefaultSearchFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    mockSubsidyHooksReturnValues(defaultSubsidyHooksData);
  });

  const refinementsShowAll = { refinements: { [SHOW_ALL_NAME]: 1 } };

  it('should set SHOW_ALL_NAME to 1 if searchCatalogs.length === 0', () => {
    useSearchCatalogs.mockReturnValue([]);
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
    useSearchCatalogs.mockReturnValue([]);
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
    const { filters } = result.current;
    expect(filters).toEqual(frontendEnterpriseCatalogSearch.getCatalogString(mockSearchCatalogs));
  });

  it('should return aggregated catalog string if searchCatalogs.length === 0', () => {
    useSearchCatalogs.mockReturnValue([]);
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
