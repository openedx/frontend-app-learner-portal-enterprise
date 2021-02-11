import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Avatar, Button, Container, Row, Col, Input, Hyperlink, MailtoLink,
} from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import Skeleton from 'react-loading-skeleton';

import { SidebarBlock } from '../layout';
import ActivityBlock from './ActivityBlock';

import { fetchCommunityActivityFeed } from './data/service';

export const NEED_HELP_BLOCK_TITLE = 'Need help?';
export const EMAIL_MESSAGE = 'contact your organization\'s edX administrator';

export default function Community() {
  const { authenticatedUser, enterpriseConfig } = useContext(AppContext);
  const { contactEmail } = enterpriseConfig || {};

  const [feedItems, setFeedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState();

  const PAGE_TITLE = `My Community - ${enterpriseConfig.name}`;

  useEffect(
    () => {
      fetchCommunityActivityFeed()
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

  const renderContactHelpText = () => {
    const message = EMAIL_MESSAGE;
    if (contactEmail) {
      return (
        <MailtoLink to={contactEmail}>
          {message}
        </MailtoLink>
      );
    }
    return message;
  };

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Container className="py-5" fluid>
        <Row>
          <Col xs={12} lg={7}>
            <h2 className="mb-2">My Community</h2>
            <hr />
            {/* Create a Post */}
            <div>
              <div className="d-flex align-items-start">
                <Avatar
                  className="mr-2"
                  src={authenticatedUser?.profileImage?.hasImage ? authenticatedUser.profileImage.medium : undefined}
                  alt={authenticatedUser?.username}
                />
                <Input
                  type="textarea"
                  placeholder="What would you like to share?"
                  className="mb-2"
                />
              </div>
              <div className="d-flex justify-content-end">
                {/* TODO: use StatefulButton */}
                <Button
                  onClick={() => {}}
                >
                  Share
                </Button>
              </div>
            </div>

            {/* Activity Feed */}
            {(fetchError || (!isLoading && feedItems?.length === 0)) && (
              <p>Nothing was found... (or an error occurred)</p>
            )}
            <div className="mt-4">
              <ul className="list-unstyled">
                {isLoading ? <Skeleton count={5} /> : feedItems.map((item, idx) => (
                  <ActivityBlock
                    className={classNames({ 'mt-3': idx !== 0 })}
                    timestamp={item.timestamp}
                    timesince={item.timesince}
                  >
                    <Hyperlink
                      href={`${getConfig().LMS_BASE_URL}/u/${item.actor.username}`}
                      className="font-weight-bold"
                      target="_blank"
                    >
                      {(item.actor.firstName && item.actor.lastName) ? (
                        <>
                          {item.actor.firstName} {item.actor.lastName}
                        </>
                      ) : item.actor.username}
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
                  </ActivityBlock>
                ))}
              </ul>
            </div>
          </Col>
          <Col xs={12} lg={{ span: 4, offset: 1 }}>
            <SidebarBlock
              title={NEED_HELP_BLOCK_TITLE}
              titleProps={{ as: 'h3' }}
              className="mb-5"
            >
              <p>
                For technical support, visit the{' '}
                <Hyperlink href="https://support.edx.org/hc/en-us" target="_blank">
                  edX Help Center
                </Hyperlink>.
              </p>
              <p>
                To request more benefits or specific courses, {renderContactHelpText()}.
              </p>
            </SidebarBlock>
          </Col>
        </Row>
      </Container>
    </>
  );
}
