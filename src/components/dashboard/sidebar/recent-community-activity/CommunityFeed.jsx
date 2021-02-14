import React, { useCallback, useContext } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import {
  Button, Hyperlink, Icon, OverlayTrigger, Popover, StatefulButton,
} from '@edx/paragon';
import { MoreVert } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';

import {
  RecentCommunityActivityContext,
  JOINING_COMMUNITY,
  JOINING_COMMUNITY_ERROR,
  COMMUNITY_JOINED,
  LEAVING_COMMUNITY,
  LEAVING_COMMUNITY_ERROR,
  COMMUNITY_LEFT,
} from './RecentCommunityActivityProvider';
import SidebarActivityBlock from './SidebarActivityBlock';
import {
  joinEnterpriseCustomerCommunity,
  leaveEnterpriseCustomerCommunity,
} from './data/service';

export const VERB_JOINED = 'joined the';
export const VERB_ENROLLED = 'enrolled in';
export const VERB_COMPLETED = 'earned a certificate in';

const CommunityFeed = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const {
    state: communityState, dispatch,
  } = useContext(RecentCommunityActivityContext);

  const {
    isCommunityOptIn,
    isCommunityOptInLoading,
    isCommunityOptOutLoading,
    items,
    isLoadingCommunityStatus,
    isLoadingRecentActivity,
    fetchError,
  } = communityState;

  const joinCommunity = () => {
    dispatch({ type: JOINING_COMMUNITY });
    joinEnterpriseCustomerCommunity({ enterprise_customer: enterpriseConfig?.uuid })
      .then((isCommunityMember) => {
        dispatch({ type: COMMUNITY_JOINED, payload: isCommunityMember });
      })
      .catch((error) => {
        logError(error);
        dispatch({ type: JOINING_COMMUNITY_ERROR, payload: error });
      });
  };

  const leaveCommunity = () => {
    dispatch({ type: LEAVING_COMMUNITY });
    leaveEnterpriseCustomerCommunity({ enterprise_customer: enterpriseConfig?.uuid })
      .then((isCommunityMember) => {
        dispatch({ type: COMMUNITY_LEFT, payload: isCommunityMember });
      })
      .catch((error) => {
        logError(error);
        dispatch({ type: LEAVING_COMMUNITY_ERROR, payload: error });
      });
  };

  const renderDisplayName = useCallback(
    (item) => {
      if (item.actor.firstName && item.actor.lastName) {
        return `${item.actor.firstName} ${item.actor.lastName}`;
      }
      return item.actor.username;
    },
    [],
  );

  if (isLoadingCommunityStatus) {
    return <Skeleton count={5} />;
  }

  if (fetchError) {
    // todo: provide an option to retry?
    return (
      <p>An error occurred retrieving recent community activity.</p>
    );
  }

  if (!isCommunityOptIn) {
    const statefulProps = {
      labels: {
        default: 'Join community',
        pending: 'Joining community',
      },
      state: isCommunityOptInLoading ? 'pending' : 'default',
    };
    return (
      <>
        <p className="small">
          You may join your organization&apos;s learning community to view recent activity
          across all learners, such as course enrollments and completions. Your own learning
          activity will be shared with your peers.
        </p>
        <StatefulButton
          {...statefulProps}
          variant="outline-primary"
          onClick={joinCommunity}
          block
        />
      </>
    );
  }

  if (!isLoadingRecentActivity && items?.length === 0) {
    return (
      <p>There is no recent community activity.</p>
    );
  }

  const statefulProps = {
    labels: {
      default: 'Leave community',
      pending: 'Leaving community',
    },
    state: isCommunityOptOutLoading ? 'pending' : 'default',
  };
  return (
    <>
      {!isLoadingRecentActivity && items?.length > 0 && (
        <OverlayTrigger
          trigger="click"
          placement="bottom"
          overlay={(
            <Popover id="community-options-popover">
              <Popover.Content>
                <p>No longer wish to share your own learning activity with your peers?</p>
                <StatefulButton
                  {...statefulProps}
                  variant="outline-danger"
                  size="sm"
                  onClick={leaveCommunity}
                  block
                />
              </Popover.Content>
            </Popover>
          )}
        >
          <Button
            variant="teriary"
            className="mt-n2"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
            }}
            size="sm"
          >
            <Icon src={MoreVert} screenReaderText="Community options" />
          </Button>
        </OverlayTrigger>
      )}
      <ul className="list-unstyled">
        {isLoadingRecentActivity ? <Skeleton count={5} /> : (
          <>
            {items?.map((item, idx) => (
              <SidebarActivityBlock
                key={item.timestamp}
                className={classNames({ 'mt-3': idx !== 0 })}
                timestamp={item.timestamp}
              >
                <Hyperlink
                  href={`${getConfig().LMS_BASE_URL}/u/${item.actor.username}`}
                  className="font-weight-bold"
                  target="_blank"
                  // TODO: add analytics tracking to this component
                  // Depends on https://github.com/edx/paragon/pull/620
                >
                  {renderDisplayName(item)}
                </Hyperlink>
                {' '}
                {item.verb}
                {' '}
                {item.verb === VERB_JOINED && `${item.target.name} community`}
                {[VERB_ENROLLED, VERB_COMPLETED].includes(item.verb) && (
                  <>
                    <Link
                      to={`/${enterpriseConfig.slug}/course/${item.actionObject.courseKey}`}
                      // TODO: add analytics click tracking on community feed course links
                      // onClick={() => sendTrackEvent('edx.enterprise.learner_portal.community.course_link_clicked', {
                      //   course_key: item.actionObject.courseKey,
                      // })}
                    >
                      {item.actionObject.displayName}
                    </Link>
                    {' '}
                    from {item.actionObject.org}
                  </>
                )}
              </SidebarActivityBlock>
            ))}
          </>
        )}
      </ul>
    </>
  );
};

export default CommunityFeed;
