import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';

import './styles/SidebarCard.scss';

const SidebarCard = ({
  title,
  children,
  textClassNames,
  titleClassNames,
}) => (
  <Card className="shadow">
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
  textClassNames: PropTypes.string,
  titleClassNames: PropTypes.string,
};

SidebarCard.defaultProps = {
  title: null,
  textClassNames: '',
  titleClassNames: '',
};

export default SidebarCard;
