import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

const TagCloud = ({ tags, onRemove }) => (
  <div className="skills-tag">
    {tags.map(tag => (
      <Chip
        key={tag.title}
        variant="light"
        iconAfter={Close}
        onIconAfterClick={() => onRemove(tag.metadata)}
        data-testid={tag.title}
      >
        {tag.title}
      </Chip>
    ))}
  </div>
);

TagCloud.propTypes = {
  onRemove: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      metadata: PropTypes.shape().isRequired,
    }),
  ).isRequired,
};

export default TagCloud;
