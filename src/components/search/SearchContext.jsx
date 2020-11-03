import React, {
  createContext, useReducer, useMemo, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';
import qs from 'query-string';
import {
  SEARCH_FACET_FILTERS,
  QUERY_PARAM_FOR_SEARCH_QUERY,
  QUERY_PARAM_FOR_PAGE,
} from './data/constants';
import { refinementsReducer, defaultState } from './data/reducer';
import { setMultipleKeysAction } from './data/actions';
import { updateRefinementsFromQueryParams } from './data/utils';

export const SearchContext = createContext();

const SearchData = ({ children }) => {
  const [activeRefinements, dispatch] = useReducer(refinementsReducer, defaultState);

  const { search } = useLocation();
  const history = useHistory();

  const queryParams = useMemo(
    () => qs.parse(search),
    [search],
  );

  useMemo(
    () => {
      const activeFacetAttributes = SEARCH_FACET_FILTERS.map(filter => filter.attribute);
      const keysToSet = {};
      Object.entries(queryParams).forEach(([key, value]) => {
        if (key === QUERY_PARAM_FOR_SEARCH_QUERY) {
          keysToSet.q = value;
        }

        if (key === QUERY_PARAM_FOR_PAGE) {
          keysToSet.page = value;
        }

        if (activeFacetAttributes.includes(key)) {
          const valueAsArray = value.includes(',') ? value.split(',') : [value];
          keysToSet[key] = valueAsArray;
        }
      });
      dispatch(setMultipleKeysAction(keysToSet));
    },
    [queryParams],
  );

  useEffect(() => {
    const refinementsWithJoinedLists = updateRefinementsFromQueryParams(activeRefinements);

    history.push({ search: qs.stringify(refinementsWithJoinedLists) });
  }, [activeRefinements]);

  const value = {
    activeRefinements,
    refinementsDispatch: dispatch,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

SearchData.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SearchData;
