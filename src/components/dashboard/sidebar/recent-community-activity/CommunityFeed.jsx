import React, { useCallback, useContext } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Button, Hyperlink } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';

import { RecentCommunityActivityContext } from './RecentCommunityActivityProvider';
import SidebarActivityBlock from './SidebarActivityBlock';

export const VERB_JOINED = 'joined the';
export const VERB_ENROLLED = 'enrolled in';
export const VERB_COMPLETED = 'earned a certificate in';

const CommunityFeed = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { state: communityState } = useContext(RecentCommunityActivityContext);
  const { items } = communityState;
  const hasFeedItems = !!items?.length > 0;

  const renderDisplayName = useCallback(
    (item) => {
      if (item.actor.firstName && item.actor.lastName) {
        return `${item.actor.firstName} ${item.actor.lastName}`;
      }
      return item.actor.username;
    },
    [],
  );

  if (!hasFeedItems) {
    return <p>There is no recent community activity.</p>;
  }

  return (
    <ul className="list-unstyled">
      {items.map((item, idx) => (
        <SidebarActivityBlock
          key={`${item.timestamp} ${item.actor.username}`}
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
    </ul>
  );
};

export default CommunityFeed;
