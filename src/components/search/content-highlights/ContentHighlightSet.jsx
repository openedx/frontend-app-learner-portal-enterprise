import React, { useRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import {
  Skeleton, CardDeck, IconButton, Icon, Stack, useWindowSize, CARD_DECK_ITEM_CLASS_NAME,
} from '@edx/paragon';
import { ArrowBack, ArrowForward } from '@edx/paragon/icons';

import { CARDGRID_COLUMN_SIZES } from '../constants';
import HighlightedContentCard from './HighlightedContentCard';

const ContentHighlightSet = ({ highlightSet }) => {
  const overflowRef = useRef(null);
  const { width: windowWidth } = useWindowSize();
  const [singleChildElementWidth, setSingleChildElementWidth] = useState(0);
  const [isLeftDisabled, setIsLeftDisabled] = useState(false);
  const [isRightDisabled, setIsRightDisabled] = useState(false);

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

  React.useLayoutEffect(() => {
    if (overflowRef.current) {
      overflowRef.current.style.scrollBehavior = 'smooth';
      const firstChild = [...overflowRef.current.children].filter(
        child => child.classList.contains(CARD_DECK_ITEM_CLASS_NAME),
      )[0];
      if (firstChild) {
        const firstChildWidth = firstChild.getBoundingClientRect().width;
        setSingleChildElementWidth(firstChildWidth);
      }
    }
  }, [windowWidth]);

  function scrollLeft() {
    if (overflowRef.current) {
      overflowRef.current.scrollLeft -= singleChildElementWidth;
    }
  }

  function scrollRight() {
    if (overflowRef.current) {
      overflowRef.current.scrollLeft += singleChildElementWidth;
    }
  }

  const handleScroll = ({ isScrolledToStart, isScrolledToEnd }) => {
    setIsLeftDisabled(isScrolledToStart);
    setIsRightDisabled(isScrolledToEnd);
  };

  return (
    <div data-testid="content-highlights-set">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h2 className="mb-2">{title}</h2>
          <p className="small mb-0">Enroll in content selected for you by your organization.</p>
        </div>
        <div>
          <Stack direction="horizontal" gap={1}>
            <IconButton
              disabled={isLeftDisabled}
              src={ArrowBack}
              iconAs={Icon}
              alt="Left"
              size="md"
              onClick={() => { scrollLeft(); }}
            />
            <IconButton
              disabled={isRightDisabled}
              src={ArrowForward}
              iconAs={Icon}
              alt="Right"
              size="md"
              onClick={() => { scrollRight(); }}
            />
          </Stack>
        </div>
      </div>
      <CardDeck
        ref={overflowRef}
        columnSizes={CARDGRID_COLUMN_SIZES}
        hasInteractiveChildren
        canScrollHorizontal={false}
        onScroll={handleScroll}
      >
        {highlightedContent}
      </CardDeck>
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
