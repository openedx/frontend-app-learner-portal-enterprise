import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SuggestedTagsContainer = ({
  currentRefinement, tags, hoveredTagIndex, hits, onAddTag,
  suggestedTagComponent: SuggestedTagComponent,
  noResultComponent: NoResultComponent,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const resultsRefs = { };

  useEffect(() => setIsOpened(currentRefinement.trim() !== ''), [currentRefinement]);
  useEffect(() => setIsOpened(false), [tags]);
  useEffect(() => {
    if (typeof resultsRefs[hoveredTagIndex] !== 'undefined') {
      resultsRefs[hoveredTagIndex].scrollIntoView(false);
    }
  }, [hoveredTagIndex]);

  if (!isOpened) {
    return false;
  }

  return (
    <div className="ais-SuggestedTagsBox">
      <ul className="ais-SuggestedTagsBox-list">
        {hits.map((hit, hitIdx) => (
          <li
            key={hit.objectID}
            ref={instance => { resultsRefs[hitIdx] = instance; }}
            className={`ais-SuggestedTagsBox-tag ${hoveredTagIndex === hitIdx ? 'hovered' : ''}`}
            onClick={() => onAddTag(hit)}
          >
            <SuggestedTagComponent hit={hit} />
          </li>
        ))}

        {!hits.length && typeof NoResultComponent !== 'undefined'
          && (
            <li
              className="ais-SuggestedTagsBox-tag hovered"
              onClick={() => onAddTag(currentRefinement)}
            >
              <NoResultComponent query={currentRefinement} />
            </li>
          )}
      </ul>
    </div>
  );
};

SuggestedTagsContainer.propTypes = {
  currentRefinement: PropTypes.string.isRequired,
  tags: PropTypes.array.isRequired,
  hits: PropTypes.arrayOf(PropTypes.shape(PropTypes.any)).isRequired,
  onAddTag: PropTypes.func.isRequired,
  hoveredTagIndex: PropTypes.number.isRequired,
  suggestedTagComponent: PropTypes.func.isRequired,
  noResultComponent: PropTypes.func.isRequired,
};

export default SuggestedTagsContainer;
