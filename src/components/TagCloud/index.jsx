import React from 'react';
import PropTypes from 'prop-types';

import './styles/TagCloud.scss';

const TagCloud = ({ tags, onRemove }) => (
  <>
    <div style={{ width: '45%' }}>
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

  </>
);

TagCloud.propTypes = {
  onRemove: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      metadata: PropTypes.object.isRequired,
    }),
  ).isRequired,
};

export default TagCloud;
