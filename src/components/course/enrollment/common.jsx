/* eslint-disable import/prefer-default-export */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

// Common UI components for enrollment to avoid duplication, consistent styling etc.
// Each enroll component can use the EnrollButtonCta to render the enroll behavior

const EnrollButtonWrapper = ({
  as: Component,
  children,
  ...props
}) => (
  <div className="enroll-wrapper">
    <Component {...props}>
      {children}
    </Component>
  </div>
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
