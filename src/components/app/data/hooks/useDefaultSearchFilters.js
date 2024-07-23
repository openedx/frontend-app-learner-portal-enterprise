import { useContext, useEffect, useMemo } from 'react';
import {
  getCatalogString,
  SearchContext,
  setRefinementAction,
  SHOW_ALL_NAME,
} from '@edx/frontend-enterprise-catalog-search';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useSearchCatalogs from './useSearchCatalogs';
import { features } from '../../../../config';

export default function useDefaultSearchFilters() {
  const { refinements, dispatch } = useContext(SearchContext);
  const showAllRefinement = refinements[SHOW_ALL_NAME];
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const videoSearchQuery = features.FEATURE_ENABLE_VIDEO_CATALOG ? '' : ' AND (NOT content_type:video)';
  const searchCatalogs = useSearchCatalogs();
  useEffect(() => {
    // default to showing all catalogs if there are no confined search catalogs
    if (searchCatalogs.length === 0 && !showAllRefinement) {
      dispatch(setRefinementAction(SHOW_ALL_NAME, 1));
    }
  }, [dispatch, searchCatalogs, showAllRefinement]);

  const filters = useMemo(
    () => {
      // Show all enterprise catalogs
      if (showAllRefinement) {
        return `enterprise_customer_uuids:${enterpriseCustomer.uuid}${videoSearchQuery}`;
      }

      if (searchCatalogs.length > 0) {
        return `${getCatalogString(searchCatalogs)}${videoSearchQuery}`;
      }

      // If the learner is not confined to certain catalogs, scope to all of enterprise's catalogs
      return `enterprise_customer_uuids:${enterpriseCustomer.uuid}${videoSearchQuery}`;
    },
    [enterpriseCustomer.uuid, searchCatalogs, showAllRefinement, videoSearchQuery],
  );
  return filters;
}
