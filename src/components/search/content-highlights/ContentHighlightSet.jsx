import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import {
  Skeleton,
  CardCarousel,
  CardDeck,
  useMediaQuery,
  breakpoints,
} from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { AppContext } from '@edx/frontend-platform/react';

import { CARDGRID_COLUMN_SIZES } from '../constants';
import HighlightedContentCard from './HighlightedContentCard';

const ContentHighlightSet = ({ highlightSet }) => {
  const { enterpriseConfig: { uuid: enterpriseUUID } } = useContext(AppContext);
  const { title } = highlightSet;

  const highlightedContent = useMemo(() => highlightSet.highlightedContent.map(highlightedContentItem => (
    <HighlightedContentCard key={uuidv4()} highlightedContent={highlightedContentItem} />
  )), [highlightSet]);

  const isMobileWindowSize = useMediaQuery({
    query: `(max-width: ${breakpoints.medium.maxWidth}px)`,
  });

  return (
    <div data-testid="content-highlights-set">
      <CardCarousel
        ariaLabel={`${title} content carousel`}
        title={title}
        subtitle="Enroll in content selected for you by your organization."
        columnSizes={CARDGRID_COLUMN_SIZES}
        onScrollPrevious={() => {
          sendEnterpriseTrackEvent(
            enterpriseUUID,
            'edx.ui.enterprise.learner_portal.search.content_highlights.card_carousel.scrolled_to_previous',
          );
        }}
        onScrollNext={() => {
          sendEnterpriseTrackEvent(
            enterpriseUUID,
            'edx.ui.enterprise.learner_portal.search.content_highlights.card_carousel.scrolled_to_next',
          );
        }}
        CardCarouselControls={isMobileWindowSize ? () => null : undefined}
        canScrollHorizontal={isMobileWindowSize}
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

const ContentHighlightSetSkeleton = () => {
  const skeletonCards = useMemo(() => Array.from({ length: 4 }).map(() => (
    <HighlightedContentCard.Skeleton key={uuidv4()} />
  )), []);

  return (
    <>
      <h2 className="mb-3"><Skeleton /></h2>
      <CardDeck columnSizes={CARDGRID_COLUMN_SIZES}>
        {skeletonCards}
      </CardDeck>
    </>
  );
};

ContentHighlightSet.Skeleton = ContentHighlightSetSkeleton;

export default ContentHighlightSet;
