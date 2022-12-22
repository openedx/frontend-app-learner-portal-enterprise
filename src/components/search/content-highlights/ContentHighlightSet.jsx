import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { CardGrid, Skeleton } from '@edx/paragon';

import { CARDGRID_COLUMN_SIZES } from '../constants';
import HighlightedContentCard from './HighlightedContentCard';

const ContentHighlightSet = ({ highlightSet }) => {
  const {
    title,
    highlightedContent,
  } = highlightSet;

  return (
    <div data-testid="content-highlights-set">
      <h2 className="mb-3">{title}</h2>
      <CardGrid columnSizes={CARDGRID_COLUMN_SIZES}>
        {[...highlightedContent, ...highlightedContent, ...highlightedContent, ...highlightedContent].map(contentItem => (
          <HighlightedContentCard key={uuidv4()} highlightedContent={contentItem} />
        ))}
      </CardGrid>
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

ContentHighlightSet.Skeleton = function () {
  return (
    <>
      <h2 className="mb-3"><Skeleton /></h2>
      <CardGrid columnSizes={CARDGRID_COLUMN_SIZES}>
        {Array.from({ length: 4 }).map(() => <HighlightedContentCard.Skeleton key={uuidv4()} />)}
      </CardGrid>
    </>
  );
};

export default ContentHighlightSet;
