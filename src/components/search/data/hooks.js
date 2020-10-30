import {
  useMemo, useState, useContext, useEffect,
} from 'react';
import { useLocation } from 'react-router-dom';
import qs from 'query-string';
import { SearchContext } from '../SearchContext';
import { features } from '../../../config';

import {
  SEARCH_FACET_FILTERS,
  QUERY_PARAM_FOR_SEARCH_QUERY,
  QUERY_PARAM_FOR_PAGE,
  QUERY_PARAM_FOR_FEATURE_FLAGS,
  FREE_ALL_ATTRIBUTE,
} from './constants';

import { isNull } from '../../../utils/common';

export const useRefinementsFromQueryParams = () => {
  const { search } = useLocation();
  const [appliedRefinements, setAppliedRefinements] = useState({});

  const queryParams = useMemo(
    () => qs.parse(search),
    [search],
  );

  useMemo(
    () => {
      const refinements = {};
      const activeFacetAttributes = SEARCH_FACET_FILTERS.map(filter => filter.attribute);
      const queriesToKeep = [QUERY_PARAM_FOR_PAGE, QUERY_PARAM_FOR_FEATURE_FLAGS, FREE_ALL_ATTRIBUTE];

      Object.entries(queryParams).forEach(([key, value]) => {
        if (key === QUERY_PARAM_FOR_SEARCH_QUERY) {
          refinements.q = value;
        }

        if (queriesToKeep.includes(key)) {
          refinements[key] = value;
        }

        if (activeFacetAttributes.includes(key)) {
          const valueAsArray = value.includes(',') ? value.split(',') : [value];
          refinements[key] = valueAsArray;
        }
      });

      setAppliedRefinements(refinements);
    },
    [queryParams],
  );

  return appliedRefinements;
};

/**
 * Transforms items into an object with a key for each facet attribute
 * with a list of that facet attribute's active selection(s).
 */
export const useActiveRefinementsByAttribute = (items) => {
  const activeRefinementsByAttribute = useMemo(
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

  return activeRefinementsByAttribute;
};

/**
 * Transforms activeRefinementsByAttribute into a flat array of objects,
 * each with an attribute key so we can still associate which attribute
 * a refinement is for.
 */
export const useActiveRefinementsAsFlatArray = (items) => {
  const activeRefinementsByAttribute = useActiveRefinementsByAttribute(items);

  const activeRefinementsAsFlatArray = useMemo(
    () => {
      const refinements = [];
      Object.entries(activeRefinementsByAttribute).forEach(([key, value]) => {
        const updatedValue = value.map((item) => ({
          ...item,
          attribute: key,
        }));
        refinements.push(...updatedValue);
      });
      return refinements;
    },
    [activeRefinementsByAttribute],
  );

  return activeRefinementsAsFlatArray;
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
  const { showAllCatalogs, setShowAllCatalogs } = useContext(SearchContext);

  useEffect(() => {
    // if there are no subscriptions or offers, we default to showing all catalogs
    if (!subscriptionPlan && offerCatalogs.length < 1) {
      setShowAllCatalogs(1);
    }
  }, [subscriptionPlan, offerCatalogs.length]);

  const filters = useMemo(
    () => {
      const customerCatalogFilter = `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
      if (showAllCatalogs) {
        // show all enterprise catalogs
        if (!subscriptionPlan) {
          return customerCatalogFilter;
        }
        return `enterprise_catalog_uuids:${subscriptionPlan.enterpriseCatalogUuid} OR ${customerCatalogFilter}`;
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
      return customerCatalogFilter;
    },
    [enterpriseConfig, subscriptionPlan, offerCatalogs, showAllCatalogs],
  );

  return { filters, showAllCatalogs, setShowAllCatalogs };
};
