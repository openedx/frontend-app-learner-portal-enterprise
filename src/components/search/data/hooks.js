import {
  useMemo, useContext, useEffect,
} from 'react';
import { SearchContext } from '../SearchContext';
import { features } from '../../../config';

import {
  SHOW_ALL_NAME,
} from './constants';

import { isNull } from '../../../utils/common';
import { setRefinementAction } from './actions';

/**
 * Transforms items into an object with a key for each facet attribute
 * with a list of that facet attribute's active selection(s).
 */
export const useActiveRefinementsByAttribute = (items) => {
  const refinementsFromQueryParamsByAttribute = useMemo(
    () => {
      const refinements = {};
      items.forEach((facet) => {
        const { attribute } = facet;
        refinements[attribute] = facet.items;
      });
      return refinements;
    },
    [items],
  );

  return refinementsFromQueryParamsByAttribute;
};

/**
 * Transforms refinementsFromQueryParamsByAttribute into a flat array of objects,
 * each with an attribute key so we can still associate which attribute
 * a refinement is for.
 */
export const useActiveRefinementsAsFlatArray = (items) => {
  const refinementsFromQueryParamsByAttribute = useActiveRefinementsByAttribute(items);

  const refinementsFromQueryParamsAsFlatArray = useMemo(
    () => {
      const refinements = [];
      Object.entries(refinementsFromQueryParamsByAttribute).forEach(([key, value]) => {
        const updatedValue = value.map((item) => ({
          ...item,
          attribute: key,
        }));
        refinements.push(...updatedValue);
      });
      return refinements;
    },
    [refinementsFromQueryParamsByAttribute],
  );

  return refinementsFromQueryParamsAsFlatArray;
};

export const useNbHitsFromSearchResults = (searchResults) => {
  const nbHits = useMemo(
    () => {
      if (searchResults && !isNull(searchResults.nbHits)) {
        return searchResults && searchResults.nbHits;
      }
      return null;
    },
    [searchResults],
  );

  return nbHits;
};

export const getCatalogString = (catalogs) => {
  function catalogFilterReducer(result, catalog, index) {
    const isLastCatalog = index === catalogs.length - 1;
    let query = `${result}enterprise_catalog_uuids:${catalog}`;
    if (!isLastCatalog) {
      query += ' OR ';
    }
    return query;
  }

  return catalogs.reduce(catalogFilterReducer, '');
};

export const useDefaultSearchFilters = ({ enterpriseConfig, subscriptionPlan, offerCatalogs = [] }) => {
  // default to showing all catalogs
  const { refinementsFromQueryParams, dispatch } = useContext(SearchContext);

  useEffect(() => {
    // if there are no subscriptions or offers, we default to showing all catalogs
    if (!subscriptionPlan && offerCatalogs.length < 1) {
      dispatch(setRefinementAction(SHOW_ALL_NAME, 1));
    }
  }, [subscriptionPlan, offerCatalogs.length]);

  const filters = useMemo(
    () => {
      if (refinementsFromQueryParams[SHOW_ALL_NAME]) {
        // show all enterprise catalogs
        return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
      }
      // if there's a subscriptionPlan, filter results by the subscription catalog
      // and any catalogs for which the user has vouchers
      if (subscriptionPlan) {
        if (features.ENROLL_WITH_CODES && offerCatalogs.length > 0) {
          const catalogs = [subscriptionPlan.enterpriseCatalogUuid, ...offerCatalogs];
          return getCatalogString(catalogs);
        }
        return `enterprise_catalog_uuids:${subscriptionPlan.enterpriseCatalogUuid}`;
      }
      if (features.ENROLL_WITH_CODES && offerCatalogs.length > 0) {
        // shows catalogs for which a user has 100% vouchers
        return getCatalogString(offerCatalogs);
      }
      return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
    },
    [enterpriseConfig, subscriptionPlan, offerCatalogs, refinementsFromQueryParams[SHOW_ALL_NAME]],
  );

  return { filters };
};
