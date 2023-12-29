import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';

// Common UI components for enrollment to avoid duplication, consistent styling etc.
// Each enroll component can use the EnrollButtonCta to render the enroll behavior

const EnrollButtonWrapper = ({
  as: Component,
  children,
  ...props
}) => (
  <Component {...props}>
    {children}
  </Component>
);

EnrollButtonWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  as: PropTypes.elementType,
};

EnrollButtonWrapper.defaultProps = {
  as: Button,
};

const EnrollButtonCta = ({ enrollLabel: EnrollLabel, ...props }) => (
  <EnrollButtonWrapper {...props}>
    {EnrollLabel}
  </EnrollButtonWrapper>
);

EnrollButtonCta.propTypes = { enrollLabel: PropTypes.node.isRequired };

export { EnrollButtonCta };
