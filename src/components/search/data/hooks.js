import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import qs from 'query-string';

import { SEARCH_FACET_FILTERS, QUERY_PARAM_FOR_SEARCH_QUERY } from './constants';

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
