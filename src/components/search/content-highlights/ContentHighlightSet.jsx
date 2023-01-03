import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { Skeleton, CardCarousel, CardDeck } from '@edx/paragon';

import { CARDGRID_COLUMN_SIZES } from '../constants';
import HighlightedContentCard from './HighlightedContentCard';

const ContentHighlightSet = ({ highlightSet }) => {
  const { title } = highlightSet;

  const highlightedContent = useMemo(() => {
    const content = [
      ...highlightSet.highlightedContent,
      ...highlightSet.highlightedContent,
      ...highlightSet.highlightedContent,
    ].map(highlightedContentItem => (
      <HighlightedContentCard key={uuidv4()} highlightedContent={highlightedContentItem} />
    ));
    return content;
  }, [highlightSet]);

  return (
    <div data-testid="content-highlights-set">
      <CardCarousel
        title={title}
        subtitle="Enroll in content selected for you by your organization."
        columnSizes={CARDGRID_COLUMN_SIZES}
        hasInteractiveChildren
      >
        {highlightedContent}
      </CardCarousel>
    </div>
  );
};

ContentHighlightSet.propTypes = {
  highlightSet: PropTypes.shape({
    title: PropTypes.string.isRequired,
    highlightedContent: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      contentType: PropTypes.oneOf(['course', 'program', 'learnerpathway']),
      cardImageUrl: PropTypes.string.isRequired,
      authoringOrganizations: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        logoImageUrl: PropTypes.string,
      })).isRequired,
    })).isRequired,
  }).isRequired,
};

const ContentHighlightSetSkeleton = () => (
  <>
    <h2 className="mb-3"><Skeleton /></h2>
    <CardDeck columnSizes={CARDGRID_COLUMN_SIZES}>
      {Array.from({ length: 4 }).map(() => <HighlightedContentCard.Skeleton key={uuidv4()} />)}
    </CardDeck>
  </>
);

ContentHighlightSet.Skeleton = ContentHighlightSetSkeleton;

export default ContentHighlightSet;
