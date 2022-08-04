import React from 'react';
import PropTypes from 'prop-types';

import './styles/TagCloud.scss';

function TagCloud({ tags, onRemove }) {
  return (
    <div className="skills-tag">
      <ul className="item">
        {
          tags.map(
            tag => (
              <li className="list-item" key={tag.title}>
                <span className="black">{tag.title}</span>
                <button data-testid={tag.title} type="button" className="remove" onClick={() => onRemove(tag.metadata)}>x</button>
              </li>
            ),
          )
        }
      </ul>
    </div>
  );
}

TagCloud.propTypes = {
  onRemove: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      metadata: PropTypes.shape({}).isRequired,
    }),
  ).isRequired,
};

export default TagCloud;
