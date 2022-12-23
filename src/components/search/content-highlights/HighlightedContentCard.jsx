import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';
import Truncate from 'react-truncate';

import { useHighlightedContentCardData } from './data';

const HighlightedContentCard = ({
  highlightedContent,
  isLoading,
  ...props
}) => {
  const {
    variant,
    title,
    cardImageUrl,
    authoringOrganizations,
    contentType,
  } = useHighlightedContentCardData(highlightedContent);

  return (
    <Card
      isClickable={!isLoading}
      isLoading={isLoading}
      variant={variant}
      {...props}
    >
      <Card.ImageCap
        src={cardImageUrl}
        srcAlt=""
        logoSrc={authoringOrganizations?.logoImageUrl}
        logoAlt={`${authoringOrganizations?.content}'s logo`}
      />
      <Card.Header
        title={(
          <Truncate lines={3} trimWhitespace>
            {title}
          </Truncate>
        )}
        subtitle={authoringOrganizations?.content && (
          <Truncate lines={2} trimWhitespace>
            {authoringOrganizations.content}
          </Truncate>
        )}
      />
      <Card.Section />
      <Card.Footer textElement={contentType} />
    </Card>
  );
};

HighlightedContentCard.propTypes = {
  highlightedContent: PropTypes.shape(),
  isLoading: PropTypes.bool,
};

HighlightedContentCard.defaultProps = {
  highlightedContent: null,
  isLoading: false,
};

HighlightedContentCard.Skeleton = function HighlightedContentCardSkeleton(props) {
  return <HighlightedContentCard isLoading {...props} />;
};

export default HighlightedContentCard;
