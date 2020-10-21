import { useMemo, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import qs from 'query-string';
import { SearchContext } from '../SearchContext';

import {
  SEARCH_FACET_FILTERS,
  QUERY_PARAM_FOR_SEARCH_QUERY,
  QUERY_PARAM_FOR_PAGE,
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

      Object.entries(queryParams).forEach(([key, value]) => {
        if (key === QUERY_PARAM_FOR_SEARCH_QUERY) {
          refinements.q = value;
        }

        if (key === QUERY_PARAM_FOR_PAGE) {
          refinements.page = value;
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

export const getCatalogString = (offerCatalogs, initialString = '') => {
  const offerCatalogsCopy = [...offerCatalogs];
  const lastCatalog = offerCatalogsCopy.pop();
  return `${offerCatalogsCopy.reduce(
    (result, catalog) => `${result}enterprise_catalog_uuids:${catalog} OR `, initialString,
  )}enterprise_catalog_uuids:${lastCatalog}`;
};

export const useDefaultSearchFilters = ({ enterpriseConfig, subscriptionPlan, offerCatalogs = [] }) => {
  // default to showing all catalogs
  const { showAllCatalogs, setShowAllCatalogs } = useContext(SearchContext);

  useMemo(() => {
    // if there are no subscriptions or offers, we default to showing all catalogs
    if (!subscriptionPlan && offerCatalogs.length < 1) {
      setShowAllCatalogs(true);
    }
  }, [subscriptionPlan, offerCatalogs.length]);

  const filters = useMemo(
    () => {
      if (showAllCatalogs) {
        if (subscriptionPlan) {
          // show subscription catalog and all other enterprise catalogs
          return `enterprise_catalog_uuids:${subscriptionPlan.enterpriseCatalogUuid} OR enterprise_customer_uuids:${enterpriseConfig.uuid}`;
        }
        // show all enterprise catalogs
        return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
      }
      // if there's a subscriptionPlan, filter results by the subscription catalog
      // and any catalogs for which the user has vouchers
      if (subscriptionPlan) {
        if (offerCatalogs.length > 0) {
          return `enterprise_catalog_uuids:${subscriptionPlan.enterpriseCatalogUuid} ${getCatalogString(offerCatalogs, 'OR ')}`;
        }
        return `enterprise_catalog_uuids:${subscriptionPlan.enterpriseCatalogUuid}`;
      }
      // shows catalogs for which a user has 100% vouchers
      return getCatalogString(offerCatalogs);
    },
    [enterpriseConfig, subscriptionPlan, offerCatalogs, showAllCatalogs],
  );

  return { filters, showAllCatalogs, setShowAllCatalogs };
};
