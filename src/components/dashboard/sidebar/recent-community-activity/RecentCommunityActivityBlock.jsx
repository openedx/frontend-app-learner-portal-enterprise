import React, { useCallback, useContext, useState } from 'react';
import {
  OverlayTrigger, Popover, StatefulButton, IconButton,
} from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { logError } from '@edx/frontend-platform/logging';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import Skeleton from 'react-loading-skeleton';

import CommunityFeed from './CommunityFeed';

import {
  RecentCommunityActivityContext,
  JOINING_COMMUNITY,
  JOINING_COMMUNITY_ERROR,
  COMMUNITY_JOINED,
  LEAVING_COMMUNITY,
  LEAVING_COMMUNITY_ERROR,
  COMMUNITY_LEFT,
} from './RecentCommunityActivityProvider';
import {
  joinEnterpriseCustomerCommunity,
  leaveEnterpriseCustomerCommunity,
} from './data/service';

const RecentCommunityActivityBlock = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const {
    state: communityState,
    dispatch,
  } = useContext(RecentCommunityActivityContext);
  const [shouldShowCommunityOptionsPopover, setShouldShowCommunityOptionsPopover] = useState(false);

  const {
    isCommunityOptIn,
    isCommunityOptInLoading,
    isCommunityOptOutLoading,
    isLoadingCommunityStatus,
    isLoadingRecentActivity,
  } = communityState;

  const joinCommunity = useCallback(
    () => {
      dispatch({ type: JOINING_COMMUNITY });
      joinEnterpriseCustomerCommunity({ enterprise_customer: enterpriseConfig?.uuid })
        .then((isCommunityMember) => {
          sendTrackEvent('edx.enterprise.learner_portal.community.joined');
          dispatch({ type: COMMUNITY_JOINED, payload: isCommunityMember });
        })
        .catch((error) => {
          logError(error);
          dispatch({ type: JOINING_COMMUNITY_ERROR, payload: error });
        });
    },
    [dispatch, enterpriseConfig?.uuid, logError],
  );

  const leaveCommunity = useCallback(
    () => {
      dispatch({ type: LEAVING_COMMUNITY });
      leaveEnterpriseCustomerCommunity({ enterprise_customer: enterpriseConfig?.uuid })
        .then((isCommunityMember) => {
          sendTrackEvent('edx.enterprise.learner_portal.community.left');
          dispatch({ type: COMMUNITY_LEFT, payload: isCommunityMember });
        })
        .catch((error) => {
          logError(error);
          dispatch({ type: LEAVING_COMMUNITY_ERROR, payload: error });
        })
        .finally(() => {
          setShouldShowCommunityOptionsPopover(false);
        });
    },
    [dispatch, enterpriseConfig?.uuid, logError],
  );

  const joinCommunityStatefulProps = {
    labels: {
      default: 'Join community',
      pending: 'Joining community',
    },
    state: isCommunityOptInLoading ? 'pending' : 'default',
  };

  const leaveCommunityStatefulProps = {
    labels: {
      default: 'Leave community',
      pending: 'Leaving community',
    },
    state: isCommunityOptOutLoading ? 'pending' : 'default',
  };

  return (
    <div className="mb-5">
      <div className="d-flex justify-content-between align-items-start">
        <h4>Recent community activity</h4>
        {isCommunityOptIn && (
          <div className="d-flex align-items-center mt-n1">
            {/**
             * TODO: fix needed here or in Paragon (preferred) to put focus or allow tab navigation into
             * the popover content area. As a keyboard-only user (a11y), it seems there's no way to move
             * the focus target to the "Leave community" button, preventing me from leaving the community.
             */}
            <OverlayTrigger
              trigger="click"
              placement="bottom"
              onToggle={() => setShouldShowCommunityOptionsPopover(prevState => !prevState)}
              show={shouldShowCommunityOptionsPopover}
              overlay={(
                <Popover id="community-options-popover">
                  <Popover.Content>
                    <p>
                      To stop sharing learning activity with your peers, you may leave
                      your organization&apos;s learning community. You may re-join later.
                    </p>
                    <StatefulButton
                      {...leaveCommunityStatefulProps}
                      variant="outline-danger"
                      size="sm"
                      onClick={leaveCommunity}
                      block
                    />
                  </Popover.Content>
                </Popover>
              )}
            >
              <IconButton
                icon={faEllipsisV}
                alt="Community options"
                variant="dark"
                // ``onClick`` is a no-op as the click event will be handled by OverlayTrigger, but
                // is a required prop for ``IconButton``.
                onClick={() => {}}
              />
            </OverlayTrigger>
          </div>
        )}
      </div>
      <div>
        {(isLoadingCommunityStatus || isLoadingRecentActivity) ? (
          <Skeleton count={5} />
        ) : (
          <>
            {isCommunityOptIn ? (
              <CommunityFeed />
            ) : (
              <>
                <p className="small">
                  You may join your organization&apos;s learning community to view recent activity
                  across all learners, such as course enrollments and completions. Your own learning
                  activity will be shared with your peers.
                </p>
                <StatefulButton
                  {...joinCommunityStatefulProps}
                  variant="outline-primary"
                  onClick={joinCommunity}
                  block
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecentCommunityActivityBlock;
