import React, { useMemo, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import { fetchRecentCommunityActivityFeed } from './data/service';

export const RecentCommunityActivityContext = React.createContext();

export const JOIN_COMMUNITY = 'JOIN_COMMUNITY';
export const LEAVE_COMMUNITY = 'LEAVE_COMMUNITY';
export const SET_IS_LOADING = 'SET_IS_LOADING';
export const SET_FETCH_ERROR = 'SET_FETCH_ERROR';
export const SET_COMMUNITY_ACTIVITY = 'SET_COMMUNITY_ACTIVITY';

function reducer(state, action) {
  switch (action.type) {
    case JOIN_COMMUNITY:
      return {
        ...state,
        isCommunityOptIn: true,
      };
    case LEAVE_COMMUNITY:
      return {
        ...state,
        isCommunityOptIn: false,
        isLoading: false,
        items: null,
        fetchError: null,
      };
    case SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case SET_FETCH_ERROR:
      return {
        ...state,
        fetchError: action.payload,
      };
    case SET_COMMUNITY_ACTIVITY:
      return {
        ...state,
        items: action.payload,
      };
    default:
      logError(`RecentCommunityActivityProvider received an action with an unknown type: ${action.type}`);
  }
  return state;
}

const initialState = {
  isCommunityOptIn: false,
  items: null,
  isLoading: false,
  fetchError: null,
};

const RecentCommunityActivityProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(
    () => {
      if (!state.isCommunityOptIn) {
        return;
      }
      dispatch({ type: SET_IS_LOADING, payload: true });
      fetchRecentCommunityActivityFeed()
        .then((response) => {
          const data = camelCaseObject(response.data);
          const mostRecentFeedItems = data.slice(0, 5);
          dispatch({ type: SET_COMMUNITY_ACTIVITY, payload: mostRecentFeedItems });
        })
        .catch((error) => {
          dispatch({ type: SET_FETCH_ERROR, payload: error });
        })
        .finally(() => {
          dispatch({ type: SET_IS_LOADING, payload: false });
        });
    },
    [state.isCommunityOptIn],
  );

  const contextValue = useMemo(
    () => ({ state, dispatch }),
    [state, dispatch],
  );

  return (
    <RecentCommunityActivityContext.Provider value={contextValue}>
      {children}
    </RecentCommunityActivityContext.Provider>
  );
};

RecentCommunityActivityProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RecentCommunityActivityProvider;
