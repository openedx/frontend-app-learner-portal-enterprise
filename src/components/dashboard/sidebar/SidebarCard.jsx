import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';

const SidebarCard = ({
  title,
  children,
  cardClassNames,
  titleClassNames,
}) => (
  <Card className={cardClassNames}>
    <Card.Body>
      {title && <Card.Header title={title} className={titleClassNames} />}
      {children}
    </Card.Body>
  </Card>
);

SidebarCard.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  cardClassNames: PropTypes.string,
  titleClassNames: PropTypes.string,
};

SidebarCard.defaultProps = {
  title: null,
  cardClassNames: 'shadow',
  titleClassNames: undefined,
};

export default SidebarCard;
