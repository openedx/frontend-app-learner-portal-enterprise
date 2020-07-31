import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CollapsibleIcon = props => (
  <FontAwesomeIcon
    className="color-brand-primary mr-2"
    icon={props.icon}
    size="2x"
  />
);

CollapsibleIcon.propTypes = {
  icon: PropTypes.shape({
    iconName: PropTypes.string.isRequired,
  }).isRequired,
};

export default CollapsibleIcon;
