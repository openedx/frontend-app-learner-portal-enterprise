import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, Icon, Truncate } from '@openedx/paragon';
import { Archive } from '@openedx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import cardImageCapFallbackSrc from '@edx/brand/paragon/images/card-imagecap-fallback.png';

import { useHighlightedContentCardData } from './data';
import { COURSE_RUN_AVAILABILITY } from '../../course/data/constants';
import { useEnterpriseCustomer } from '../../app/data';

const HighlightedContentCard = ({
  highlightSetUUID,
  highlightedContent,
  isLoading,
  ...props
}) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  const {
    variant,
    title,
    cardImageUrl,
    authoringOrganizations,
    contentType,
    href,
    aggregationKey,
    courseRunStatuses,
  } = useHighlightedContentCardData({
    enterpriseSlug: enterpriseCustomer.slug,
    highlightedContent,
  });

  const archivedCourse = courseRunStatuses?.every(status => status === COURSE_RUN_AVAILABILITY.ARCHIVED);

  const handleContentCardClick = () => {
    if (!href) {
      // do nothing
      return;
    }
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.search.content_highlights.card_carousel.item.clicked',
      {
        highlightSetUUID,
        aggregationKey,
      },
    );
  };

  return (
    <Card
      as={Link}
      to={href}
      isClickable={!isLoading}
      isLoading={isLoading}
      variant={variant}
      onClick={handleContentCardClick}
      {...props}
    >
      <Card.ImageCap
        src={cardImageUrl || cardImageCapFallbackSrc}
        fallbackSrc={cardImageCapFallbackSrc}
        srcAlt=""
        logoSrc={authoringOrganizations?.logoImageUrl}
        logoAlt={`${authoringOrganizations?.content}'s logo`}
        imageLoadingType="lazy"
      />
      <Card.Header
        title={(
          <Truncate lines={3}>{title}</Truncate>
        )}
        subtitle={authoringOrganizations?.content && (
          <Truncate lines={2}>{authoringOrganizations.content}</Truncate>
        )}
      />
      <Card.Section />
      <Card.Footer textElement={contentType}>
        {archivedCourse && (
          <span className="d-flex x-small text-gray-400">
            <Icon className="mr-1" src={Archive} />Archived
          </span>
        )}
      </Card.Footer>
    </Card>
  );
};

const HighlightedContentCardSkeleton = props => <HighlightedContentCard isLoading {...props} />;

HighlightedContentCard.propTypes = {
  highlightSetUUID: PropTypes.string,
  highlightedContent: PropTypes.shape(),
  isLoading: PropTypes.bool,
};

HighlightedContentCard.defaultProps = {
  highlightSetUUID: undefined,
  highlightedContent: undefined,
  isLoading: false,
};

HighlightedContentCard.Skeleton = HighlightedContentCardSkeleton;

export default HighlightedContentCard;
