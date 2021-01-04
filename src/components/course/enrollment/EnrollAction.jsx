import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

import { enrollButtonTypes } from '../data/constants';

const {
  ENROLL_DISABLED,
} = enrollButtonTypes;

/**
 *
 * @param {object} args Arguments.
 * @param {string} args.enrollmentType type of enrollment
 * @param {React.Component} args.enrollLabel label component to use.
 */
const EnrollAction = ({
  enrollmentType,
  enrollLabel: EnrollLabel,
}) => {
  const EnrollButtonWrapper = ({
    as: Component,
    children,
    ...props
  }) => (
    <div className="enroll-wrapper" style={{ width: 270 }}>
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

  const EnrollButtonCta = props => (
    <EnrollButtonWrapper {...props}>
      <EnrollLabel />
    </EnrollButtonWrapper>
  );

  const enrollBtnDisabled = (
    <EnrollButtonCta
      as="div"
      className="btn btn-light btn-block disabled"
    />
  );

  switch (enrollmentType) {
      case ENROLL_DISABLED:
          return enrollBtnDisabled;
      default:
  }

  return <EnrollButtonCta />;
};

EnrollAction.propTypes = {
  enrollmentType: PropTypes.string.isRequired,
  enrollLabel: PropTypes.shape.isRequired,
};

export default EnrollAction;
