import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, Icon } from '@openedx/paragon';
import { AddCircle, RemoveCircle } from '@openedx/paragon/icons';

const PreviewExpand = ({
  className,
  children,
  cta,
  heading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className={classNames('preview-expand-component', className)}>
      {heading}
      <div className={classNames('preview-expand-body', 'mb-3', { expanded: isExpanded })}>
        {children}
      </div>
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="preview-expand-cta px-1"
        variant="link"
        id={cta.id}
      >
        <Icon
          src={isExpanded ? RemoveCircle : AddCircle}
          className="mr-2 collapsible-icon"
        />
        {isExpanded ? cta.labelToMinimize : cta.labelToExpand}
      </Button>
    </div>
  );
};

PreviewExpand.propTypes = {
  children: PropTypes.element.isRequired,
  heading: PropTypes.element.isRequired,
  cta: PropTypes.shape({
    id: PropTypes.string.isRequired,
    labelToExpand: PropTypes.string.isRequired,
    labelToMinimize: PropTypes.string.isRequired,
  }).isRequired,
  className: PropTypes.string,
};

PreviewExpand.defaultProps = {
  className: null,
};

export default PreviewExpand;
