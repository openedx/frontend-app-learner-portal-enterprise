import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const TagsBoxContainer = ({
  refine, tags, hits, onUpdateHoveredTag, limitedTo, hoveredTagIndex, onAddTag, onRemoveTag, noResultComponent,
  currentRefinement, selectedTagComponent: SelectedTagComponent, translations,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [inputDisabled, setInputDisabled] = useState(false);

  const inputRef = useRef('');

  useEffect(() => refine(inputValue), [inputValue]);
  // useEffect(() => hits.length === 1 && onUpdateHoveredTag(1), [hits]);
  useEffect(() => {
    setInputDisabled(typeof limitedTo !== 'undefined' && tags.length === limitedTo);
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [tags]);

  const onInputValueChange = e => {
    setInputValue(e.target.value);
  };

  const catchSpecialKeys = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onUpdateHoveredTag(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onUpdateHoveredTag(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();

      if (hits.length && hoveredTagIndex !== -1) {
        onAddTag(hits[hoveredTagIndex]);
      }

      if (!hits.length && typeof noResultComponent !== 'undefined') {
        onAddTag(inputValue);
      }
    } else if (e.key === 'Backspace' && inputValue.trim() === '' && tags.length > 0) {
      onRemoveTag(tags[tags.length - 1].objectID);
    }
  };

  return (
    <div
      onClick={() => inputRef && inputRef.current.focus()}
      className={`ais-TagsBox ${currentRefinement !== '' ? 'opened' : ''}`}
    >
      <ul className="ais-TagsBox-tags">
        {tags.map(tag => (
          <li key={tag.objectID} className="ais-TagsBox-tag" onClick={() => onRemoveTag(tag.objectID)}>
            <SelectedTagComponent hit={tag} />
            <span className="ais-TagsBox-removeTag">✕</span>
          </li>
        ))}

        <li className="ais-TagsBox-inputTag">
          <input
            type="text"
            ref={inputRef}
            value={inputValue}
            disabled={inputDisabled}
            onKeyDown={catchSpecialKeys}
            onChange={onInputValueChange}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            placeholder={translations && (translations.placeholder ? translations.placeholder : '')}
            spellCheck="false"
          />
        </li>
      </ul>
    </div>
  );
};

TagsBoxContainer.propTypes = {
  tags: PropTypes.array.isRequired,
  currentRefinement: PropTypes.string.isRequired,
  hits: PropTypes.arrayOf(PropTypes.shape(PropTypes.any)).isRequired,
  limitedTo: PropTypes.number.isRequired,
  hoveredTagIndex: PropTypes.number.isRequired,
  refine: PropTypes.func.isRequired,
  onUpdateHoveredTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
  onAddTag: PropTypes.func.isRequired,
  selectedTagComponent: PropTypes.func.isRequired,
  noResultComponent: PropTypes.func.isRequired,
  translations: PropTypes.shape({
    placeholder: PropTypes.string,
    noResult: PropTypes.string,
  }).isRequired,
};

export default TagsBoxContainer;
