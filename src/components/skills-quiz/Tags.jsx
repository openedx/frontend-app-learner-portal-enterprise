import React, { useState, useEffect } from 'react';
import { connectAutoComplete } from 'react-instantsearch-dom';
import PropTypes from 'prop-types';

import TagsBoxContainer from './TagsBoxContainer';
import SuggestedTagsContainer from './SuggestedTagsContainer';

import './Tags.scss';

const Tags = (props) => {
  const {
    currentRefinement, onAddTag, onUpdate, hits,
  } = props;

  const [tags, setTags] = useState([]);
  const [hoveredTagIndex, setHoveredTagIndex] = useState(-1);

  useEffect(() => setHoveredTagIndex(-1), [currentRefinement]);
  useEffect(() => onUpdate(tags), [tags]);

  const addTag = hit => {
    let tag = hit;
    if (typeof onAddTag === 'function') {
      tag = { ...onAddTag(hit) };
    }

    setTags([...tags, tag]);
  };

  const removeTag = hitObjectID => {
    const updatedTags = [...tags];
    const indexToRemove = updatedTags.findIndex(tag => tag.objectID === hitObjectID);
    updatedTags.splice(indexToRemove, 1);

    setTags([updatedTags]);
  };

  const updateHoveredTagIndex = operation => {
    if (operation > 0 && hoveredTagIndex < hits.length - 1) {
      setHoveredTagIndex(hoveredTagIndex + operation);
    } else if (operation < 0 && hoveredTagIndex > 0) {
      setHoveredTagIndex(hoveredTagIndex + operation);
    }
  };

  return (
    <>
      <TagsBoxContainer
        {...props}
        tags={tags}
        hoveredTagIndex={hoveredTagIndex}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        onUpdateHoveredTag={updateHoveredTagIndex}
      />
      <SuggestedTagsContainer
        {...props}
        tags={tags}
        hoveredTagIndex={hoveredTagIndex}
        onAddTag={addTag}
      />
    </>
  );
};

Tags.propTypes = {
  currentRefinement: PropTypes.string.isRequired,
  selectedTagComponent: PropTypes.func.isRequired,
  suggestedTagComponent: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onAddTag: PropTypes.func.isRequired,
  hits: PropTypes.arrayOf(PropTypes.shape(PropTypes.any)).isRequired,
  translations: PropTypes.shape({
    placeholder: PropTypes.string,
    noResult: PropTypes.string,
  }).isRequired,
  limitTo: PropTypes.number.isRequired,
};

export default connectAutoComplete(Tags);
