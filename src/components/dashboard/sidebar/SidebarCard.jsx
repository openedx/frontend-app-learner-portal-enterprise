import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';

import './styles/SidebarCard.scss';

const SidebarCard = ({
  title,
  children,
  cardClassNames,
  textClassNames,
  titleClassNames,
}) => (
  <Card className={cardClassNames}>
    <Card.Body>
      {title && <Card.Title className={titleClassNames}>{title}</Card.Title>}
      <Card.Text className={textClassNames}>
        {children}
      </Card.Text>
    </Card.Body>
  </Card>
);

SidebarCard.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  cardClassNames: PropTypes.string,
  textClassNames: PropTypes.string,
  titleClassNames: PropTypes.string,
};

SidebarCard.defaultProps = {
  title: null,
  cardClassNames: 'shadow',
  textClassNames: '',
  titleClassNames: '',
};

export default SidebarCard;
