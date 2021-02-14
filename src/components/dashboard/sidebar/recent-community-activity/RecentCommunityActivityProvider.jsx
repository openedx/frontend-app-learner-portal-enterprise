import React, {
  useContext, useMemo, useEffect, useReducer,
} from 'react';
import PropTypes from 'prop-types';
import { Toast } from '@edx/paragon';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import {
  fetchRecentCommunityActivityFeed,
  fetchEnterpriseLearnerCommunityStatus,
} from './data/service';

export const RecentCommunityActivityContext = React.createContext();

export const JOINING_COMMUNITY = 'JOINING_COMMUNITY';
export const JOINING_COMMUNITY_ERROR = 'JOINING_COMMUNITY_ERROR';
export const COMMUNITY_JOINED = 'COMMUNITY_JOINED';
export const LEAVING_COMMUNITY = 'LEAVING_COMMUNITY';
export const LEAVING_COMMUNITY_ERROR = 'LEAVING_COMMUNITY_ERROR';
export const COMMUNITY_LEFT = 'COMMUNITY_LEFT';
export const SET_IS_LOADING_COMMUNITY_STATUS = 'SET_IS_LOADING_COMMUNITY_STATUS';
export const SET_IS_COMMUNITY_OPT_IN = 'SET_IS_COMMUNITY_OPT_IN';
export const SET_IS_LOADING_RECENT_ACTIVITY = 'SET_IS_LOADING_RECENT_ACTIVITY';
export const SET_FETCH_ERROR = 'SET_FETCH_ERROR';
export const SET_COMMUNITY_ACTIVITY = 'SET_COMMUNITY_ACTIVITY';
export const HIDE_COMMUNITY_OPT_IN_TOAST = 'HIDE_COMMUNITY_OPT_IN_TOAST';
export const HIDE_COMMUNITY_OPT_OUT_TOAST = 'HIDE_COMMUNITY_OPT_OUT_TOAST';

function reducer(state, action) {
  switch (action.type) {
    case SET_IS_LOADING_COMMUNITY_STATUS:
      return {
        ...state,
        isLoadingCommunityStatus: action.payload,
      };
    case SET_IS_COMMUNITY_OPT_IN:
        return {
          ...state,
          isLoadingCommunityStatus: false,
          isCommunityOptIn: action.payload,
        };
    case JOINING_COMMUNITY:
      return {
        ...state,
        isCommunityOptInLoading: true,
      };
    case JOINING_COMMUNITY_ERROR:
        return {
          ...state,
          isCommunityOptInLoading: false,
        };
    case COMMUNITY_JOINED:
      sendTrackEvent('edx.enterprise.learner_portal.community.joined');
      return {
        ...state,
        isCommunityOptInLoading: false,
        isCommunityOptIn: action.payload,
        shouldShowCommunityOptInToast: action.payload,
      };
    case LEAVING_COMMUNITY:
      return {
        ...state,
        isCommunityOptOutLoading: true,
      };
    case LEAVING_COMMUNITY_ERROR:
        return {
          ...state,
          isCommunityOptOutLoading: false,
        };
    case COMMUNITY_LEFT:
      sendTrackEvent('edx.enterprise.learner_portal.community.left');
      return {
        ...state,
        isCommunityOptIn: false,
        isCommunityOptOutLoading: false,
        shouldShowCommunityOptOutToast: true,
        isLoadingRecentActivity: false,
        items: null,
        fetchError: null,
      };
    case SET_IS_LOADING_RECENT_ACTIVITY:
      return {
        ...state,
        isLoadingRecentActivity: action.payload,
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
    case HIDE_COMMUNITY_OPT_IN_TOAST:
      return {
        ...state,
        shouldShowCommunityOptInToast: false,
      };
    case HIDE_COMMUNITY_OPT_OUT_TOAST:
        return {
          ...state,
          shouldShowCommunityOptOutToast: false,
        };
    default:
      logError(`RecentCommunityActivityProvider received an action with an unknown type: ${action.type}`);
  }
  return state;
}

const initialState = {
  isLoadingCommunityStatus: false,
  isCommunityOptIn: false,
  isCommunityOptInLoading: false,
  isCommunityOptOutLoading: false,
  shouldShowCommunityOptInToast: false,
  shouldShowCommunityOptOutToast: false,
  items: null,
  isLoadingRecentActivity: false,
  fetchError: null,
};

const RecentCommunityActivityProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { authenticatedUser, enterpriseConfig } = useContext(AppContext);

  useEffect(
    () => {
      if (state.isCommunityOptIn) {
        return;
      }
      dispatch({ type: SET_IS_LOADING_COMMUNITY_STATUS, payload: true });
      const { username } = authenticatedUser;
      fetchEnterpriseLearnerCommunityStatus({ username, enterprise_customer: enterpriseConfig.uuid })
        .then((isCommunityMember) => {
          dispatch({ type: SET_IS_COMMUNITY_OPT_IN, payload: isCommunityMember });
        })
        .catch((error) => {
          dispatch({ type: SET_FETCH_ERROR, payload: error });
        })
        .finally(() => {
          dispatch({ type: SET_IS_LOADING_COMMUNITY_STATUS, payload: false });
        });
    },
    [state.isCommunityOptIn, authenticatedUser?.username],
  );

  useEffect(
    () => {
      if (!state.isCommunityOptIn) {
        return;
      }
      dispatch({ type: SET_IS_LOADING_RECENT_ACTIVITY, payload: true });
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
          dispatch({ type: SET_IS_LOADING_RECENT_ACTIVITY, payload: false });
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
      {state.shouldShowCommunityOptInToast && (
        <Toast
          onClose={() => dispatch({ type: HIDE_COMMUNITY_OPT_IN_TOAST })}
          delay={8000}
          show
        >
          You joined your organization&apos;s learning community. You may now
          view recent activity from your peers.
        </Toast>
      )}
      {state.shouldShowCommunityOptOutToast && (
        <Toast
          onClose={() => dispatch({ type: HIDE_COMMUNITY_OPT_OUT_TOAST })}
          delay={8000}
          show
        >
          You left your organization&apos;s learning community. Your own learning activity
          will no longer be shared with your peers.
        </Toast>
      )}
    </RecentCommunityActivityContext.Provider>
  );
};

RecentCommunityActivityProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RecentCommunityActivityProvider;
