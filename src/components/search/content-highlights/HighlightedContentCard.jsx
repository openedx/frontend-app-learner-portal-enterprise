import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Card, Icon, Truncate } from '@edx/paragon';
import { Archive } from '@edx/paragon/icons';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import cardImageCapFallbackSrc from '@edx/brand/paragon/images/card-imagecap-fallback.png';

import { useHighlightedContentCardData } from './data';
import { COURSE_RUN_AVAILABILITY } from '../../course/data/constants';

const HighlightedContentCard = ({
  highlightSetUUID,
  highlightedContent,
  isLoading,
  ...props
}) => {
  const {
    enterpriseConfig: {
      slug: enterpriseSlug,
      uuid: enterpriseUUID,
    },
  } = useContext(AppContext);
  const navigate = useNavigate();

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
    enterpriseSlug,
    highlightedContent,
  });

  const archivedCourse = courseRunStatuses?.every(status => (
    status === COURSE_RUN_AVAILABILITY.ARCHIVED || status === COURSE_RUN_AVAILABILITY.UNPUBLISHED
  ));

  const handleContentCardClick = () => {
    if (!href) {
      // do nothing
      return;
    }
    navigate(href);
    sendEnterpriseTrackEvent(
      enterpriseUUID,
      'edx.ui.enterprise.learner_portal.search.content_highlights.card_carousel.item.clicked',
      {
        highlightSetUUID,
        aggregationKey,
      },
    );
  };

  return (
    <Card
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
      />
      <Card.Header
        title={(
          <Truncate maxLine={3}>{title}</Truncate>
        )}
        subtitle={authoringOrganizations?.content && (
          <Truncate maxLine={2}>{authoringOrganizations.content}</Truncate>
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
