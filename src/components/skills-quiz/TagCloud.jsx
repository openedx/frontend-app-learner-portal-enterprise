import React from 'react';
import PropTypes from 'prop-types';

import { Card } from '@edx/paragon';

const TagCloud = ({ tags, onRemove }) => {
  return (
    <>
      <Card style={{ width: '45%' }}>
        <Card.Body>
          <Card.Text>
            <ul className="item">
              {
                tags.map(
                  tag => (
                    <li className="list-item">
                      <span className="black">{tag.title}</span>
                      <span className="remove" title="Remove this skill from the list." onClick={() => onRemove(tag.metadata)}>x</span>
                    </li>
                  ),
                )
              }
            </ul>
          </Card.Text>
        </Card.Body>
      </Card>

    </>
  );
};

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
