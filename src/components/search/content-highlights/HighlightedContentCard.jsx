import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import LinesEllipsis from 'react-lines-ellipsis';
import { useHistory } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Card } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import cardImageCapFallbackSrc from '@edx/brand/paragon/images/card-imagecap-fallback.png';

import { useHighlightedContentCardData } from './data';

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
  const history = useHistory();

  const {
    variant,
    title,
    cardImageUrl,
    authoringOrganizations,
    contentType,
    href,
    aggregationKey,
  } = useHighlightedContentCardData({
    enterpriseSlug,
    highlightedContent,
  });

  const handleContentCardClick = () => {
    if (!href) {
      // do nothing
      return;
    }
    history.push(href);
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
        src={cardImageUrl}
        fallbackSrc={cardImageCapFallbackSrc}
        srcAlt=""
        logoSrc={authoringOrganizations?.logoImageUrl}
        logoAlt={`${authoringOrganizations?.content}'s logo`}
      />
      <Card.Header
        title={(
          <LinesEllipsis
            text={title}
            maxLine={3}
            trimWhitespace
          />
        )}
        subtitle={authoringOrganizations?.content && (
          <LinesEllipsis
            text={authoringOrganizations.content}
            maxLine={2}
            trimWhitespace
          />
        )}
      />
      <Card.Section />
      <Card.Footer textElement={contentType} />
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
