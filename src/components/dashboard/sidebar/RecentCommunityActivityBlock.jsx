import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { Hyperlink } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { AppContext } from '@edx/frontend-platform/react';

import { SidebarBlock } from '../../layout';
import SidebarActivityBlock from './SidebarActivityBlock';

import { fetchRecentCommunityActivityFeed } from './data/service';

const RecentCommunityActivityBlock = () => {
  const { enterpriseConfig } = useContext(AppContext);

  const [feedItems, setFeedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState();

  useEffect(
    () => {
      fetchRecentCommunityActivityFeed()
        .then((response) => {
          const data = camelCaseObject(response.data);
          const mostRecentFeedItems = data.slice(0, 5);
          setFeedItems(mostRecentFeedItems);
        })
        .catch((error) => {
          setFetchError(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [],
  );

  if (fetchError || (!isLoading && feedItems?.length === 0)) {
    // if an error occurred or we have no feed activity, don't show this block in the UI
    return null;
  }

  return (
    <SidebarBlock
      title="Recent community activity"
      titleProps={{ as: 'h3' }}
      className="mb-5"
    >
      <ul className="list-unstyled">
        {isLoading ? <Skeleton count={5} /> : (
          <>
            {feedItems.map((item, idx) => (
              <SidebarActivityBlock
                key={item}
                className={classNames({ 'mt-3': idx !== 0 })}
                timestamp={item.timestamp}
                timesince={item.timesince}
              >
                <Hyperlink
                  href={`${getConfig().LMS_BASE_URL}/u/${item.actor.username}`}
                  className="font-weight-bold"
                  target="_blank"
                >
                  {/* TODO: use "First Last" name if available (more human); otherwise use username */}
                  {(item.actor.firstName && item.actor.lastName) ? (
                    <>
                      {item.actor.firstName} {item.actor.firstName}
                    </>
                  ) : item.actor.username}
                </Hyperlink>
                {' '}
                {item.verb}
                {' '}
                {item.verb === 'joined' && item.target.name}
                {item.verb === 'enrolled in' && (
                  <>
                    <Link to={`/${enterpriseConfig.slug}/course/${item.actionObject.courseKey}`}>
                      {item.actionObject.displayName}
                    </Link>
                    {' '}
                    from {item.actionObject.org}
                  </>
                )}
                {/* TODO: item.verb === 'earned a certificate in' */}
              </SidebarActivityBlock>
            ))}
          </>
        )}
      </ul>
      <Link to="/test-enterprise/community">
        View all community activity →
      </Link>
    </SidebarBlock>
  );
};

export default RecentCommunityActivityBlock;
