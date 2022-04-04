import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';

const SidebarCard = ({
  title,
  children,
  cardClassNames,
  titleClassNames,
  cardBodyClassNames,
}) => (
  <Card className={cardClassNames}>
    <Card.Body className={cardBodyClassNames}>
      {title && <Card.Title className={titleClassNames}>{title}</Card.Title>}
      {children}
    </Card.Body>
  </Card>
);

SidebarCard.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  cardClassNames: PropTypes.string,
  titleClassNames: PropTypes.string,
  cardBodyClassNames: PropTypes.string,
};

SidebarCard.defaultProps = {
  title: null,
  cardClassNames: 'shadow',
  titleClassNames: undefined,
  cardBodyClassNames: undefined,
};

export default SidebarCard;
