import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

// Common UI components for enrollment to avoid duplication, consistent styling etc.
// Each enroll component can use the EnrollButtonCta to render the enroll behavior

function EnrollButtonWrapper({
  as: Component,
  children,
  ...props
}) {
  return (
    <div>
      <Component {...props}>
        {children}
      </Component>
    </div>
  );
}

EnrollButtonWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  as: PropTypes.elementType,
};

EnrollButtonWrapper.defaultProps = {
  as: Button,
};

function EnrollButtonCta({ enrollLabel: EnrollLabel, ...props }) {
  return (
    <EnrollButtonWrapper {...props}>
      {EnrollLabel}
    </EnrollButtonWrapper>
  );
}

EnrollButtonCta.propTypes = { enrollLabel: PropTypes.node.isRequired };

export { EnrollButtonCta };
