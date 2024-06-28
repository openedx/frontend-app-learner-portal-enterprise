import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';

const SidebarCard = ({
  title,
  children,
  cardClassNames,
  cardSectionClassNames,
}) => (
  <Card className={cardClassNames}>
    {title && <Card.Header title={title} />}
    {children && (
      <Card.Section
        className={cardSectionClassNames}
      >
        {children}
      </Card.Section>
    )}
  </Card>
);

SidebarCard.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
  cardClassNames: PropTypes.string,
  cardSectionClassNames: PropTypes.string,
};

SidebarCard.defaultProps = {
  title: null,
  children: null,
  cardClassNames: 'shadow',
  cardSectionClassNames: undefined,
};

export default SidebarCard;
