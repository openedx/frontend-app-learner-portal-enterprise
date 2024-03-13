import { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import {
  breakpoints,
  CardCarousel,
  CardDeck,
  Skeleton,
  useMediaQuery,
} from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { CARDGRID_COLUMN_SIZES } from '../constants';
import HighlightedContentCard from './HighlightedContentCard';
import { COURSE_RUN_AVAILABILITY } from '../../course/data/constants';
import { useEnterpriseCustomer } from '../../app/data';

function useHighlightedContent(highlightedContent) {
  const archivedContent = useRef([]);
  const activeContent = useRef([]);

  highlightedContent.forEach(({ courseRunStatuses }, index) => {
    if (courseRunStatuses?.every((status) => status === COURSE_RUN_AVAILABILITY.ARCHIVED)) {
      archivedContent.current.push(highlightedContent[index]);
    } else {
      activeContent.current.push(highlightedContent[index]);
    }
  });

  return {
    activeContent: activeContent.current,
    archivedContent: archivedContent.current,
  };
}

const ContentHighlightSet = ({
  title,
  highlightedContent,
  uuid: highlightSetUUID,
}) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const {
    activeContent,
    archivedContent,
  } = useHighlightedContent(highlightedContent);

  const activeHighlightedContent = useMemo(() => activeContent.map(highlightedContentItem => (
    <HighlightedContentCard
      key={uuidv4()}
      highlightedContent={highlightedContentItem}
      highlightSetUUID={highlightSetUUID}
    />
  )), [highlightSetUUID, activeContent]);

  const archivedHighlightedContent = useMemo(() => archivedContent.map(highlightedContentItem => (
    <HighlightedContentCard
      key={uuidv4()}
      highlightedContent={highlightedContentItem}
      highlightSetUUID={highlightSetUUID}
    />
  )), [highlightSetUUID, archivedContent]);

  const isMobileWindowSize = useMediaQuery({
    query: `(max-width: ${breakpoints.medium.maxWidth}px)`,
  });

  useEffect(() => {
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.search.content_highlights.card_carousel.viewed',
      { highlightSetUUID },
    );
  }, [enterpriseCustomer.uuid, highlightSetUUID]);

  return (
    <div data-testid="content-highlights-set">
      <CardCarousel
        ariaLabel={`${title} content carousel`}
        title={title}
        columnSizes={CARDGRID_COLUMN_SIZES}
        onScrollPrevious={() => {
          sendEnterpriseTrackEvent(
            enterpriseCustomer.uuid,
            'edx.ui.enterprise.learner_portal.search.content_highlights.card_carousel.scrolled_to_previous',
            { highlightSetUUID },
          );
        }}
        onScrollNext={() => {
          sendEnterpriseTrackEvent(
            enterpriseCustomer.uuid,
            'edx.ui.enterprise.learner_portal.search.content_highlights.card_carousel.scrolled_to_next',
            { highlightSetUUID },
          );
        }}
        // enable horizontal scroll and hide controls for mobile per requirements
        CardCarouselControls={isMobileWindowSize ? () => null : undefined}
        canScrollHorizontal={isMobileWindowSize}
        hasInteractiveChildren
      >
        {activeHighlightedContent}
        {archivedHighlightedContent}
      </CardCarousel>
    </div>
  );
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

ContentHighlightSet.propTypes = {
  uuid: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  highlightedContent: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    contentType: PropTypes.oneOf(['course', 'program', 'learnerpathway']),
    cardImageUrl: PropTypes.string.isRequired,
    authoringOrganizations: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      logoImageUrl: PropTypes.string,
    })).isRequired,
    courseRunStatuses: PropTypes.arrayOf(PropTypes.string),
  })).isRequired,
};

ContentHighlightSet.Skeleton = ContentHighlightSetSkeleton;

export default ContentHighlightSet;
