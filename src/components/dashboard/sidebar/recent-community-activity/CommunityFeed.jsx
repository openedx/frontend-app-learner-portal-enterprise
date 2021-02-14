import React, { useCallback, useContext } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import {
  Button, Hyperlink, Icon, OverlayTrigger, Popover,
} from '@edx/paragon';
import { MoreVert } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';

import {
  RecentCommunityActivityContext,
  JOIN_COMMUNITY,
  LEAVE_COMMUNITY,
} from './RecentCommunityActivityProvider';
import SidebarActivityBlock from './SidebarActivityBlock';

const CommunityFeed = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const {
    state: communityState, dispatch,
  } = useContext(RecentCommunityActivityContext);
  const {
    isCommunityOptIn,
    items,
    isLoading,
    fetchError,
  } = communityState;

  const renderDisplayName = useCallback(
    (item) => {
      if (item.actor.firstName && item.actor.lastName) {
        return (
          <>{item.actor.firstName} {item.actor.lastName}</>
        );
      }
      return item.actor.username;
    },
    [],
  );

  if (isCommunityOptIn && fetchError) {
    return (
      <p>An error occurred retrieving recent community activity.</p>
    );
  }

  if (isCommunityOptIn && (!isLoading && items?.length === 0)) {
    return (
      <p>There is no recent community activity.</p>
    );
  }

  return (
    <>
      {isCommunityOptIn ? (
        <>
          {!isLoading && (
            <OverlayTrigger
              trigger="click"
              placement="bottom"
              overlay={(
                <Popover id="community-options-popover">
                  <Popover.Content>
                    <p>No longer wish to share your own learning activity with your peers?</p>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => dispatch({ type: LEAVE_COMMUNITY })}
                      block
                    >
                      Leave community
                    </Button>
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
            {isLoading ? <Skeleton count={5} /> : (
              <>
                {items?.map((item, idx) => (
                  <SidebarActivityBlock
                    key={item.timestamp}
                    className={classNames({ 'mt-3': idx !== 0 })}
                    timestamp={item.timestamp}
                    timesince={item.timesince}
                  >
                    <Hyperlink
                      href={`${getConfig().LMS_BASE_URL}/u/${item.actor.username}`}
                      className="font-weight-bold"
                      target="_blank"
                    >
                      {renderDisplayName(item)}
                    </Hyperlink>
                    {' '}
                    {item.verb}
                    {' '}
                    {item.verb === 'joined' && item.target.name}
                    {(item.verb === 'enrolled in' || item.verb === 'earned a certificate in') && (
                      <>
                        <Link to={`/${enterpriseConfig.slug}/course/${item.actionObject.courseKey}`}>
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
      ) : (
        <>
          <p className="small">
            You may join your organization&apos;s learning community to view recent activity
            across all learners, such as course enrollments and completions. Your own learning
            activity will be visible to other learners.
          </p>
          <Button
            variant="outline-primary"
            onClick={() => dispatch({ type: JOIN_COMMUNITY })}
            block
          >
            Join community
          </Button>
        </>
      )}
    </>
  );
};

export default CommunityFeed;
