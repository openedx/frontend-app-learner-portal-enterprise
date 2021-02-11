import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';

const SidebarCard = ({
  title,
  children,
  cardClassNames,
  titleProps,
}) => (
  <Card className={cardClassNames}>
    <Card.Body>
      {title && <Card.Title {...titleProps}>{title}</Card.Title>}
      {children}
    </Card.Body>
  </Card>
);

SidebarCard.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  cardClassNames: PropTypes.string,
  titleProps: PropTypes.shape(),
};

SidebarCard.defaultProps = {
  title: null,
  cardClassNames: 'shadow',
  titleProps: undefined,
};

export default SidebarCard;
