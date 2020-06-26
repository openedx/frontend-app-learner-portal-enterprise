import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import qs from 'query-string';

import { SEARCH_FACET_FILTERS, QUERY_PARAM_FOR_SEARCH_QUERY } from './constants';

// eslint-disable-next-line import/prefer-default-export
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
