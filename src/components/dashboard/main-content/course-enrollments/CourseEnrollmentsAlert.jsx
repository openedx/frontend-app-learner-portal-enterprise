import React from 'react';
import { Alert } from '@openedx/paragon';
import { WarningFilled, CheckCircle } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

const iconByVariant = {
  success: CheckCircle,
  danger: WarningFilled,
};

const CourseEnrollmentsAlert = ({
  children,
  variant,
  onClose,
}) => {
  const icon = iconByVariant[variant];

  return (
    <Alert
      className="align-items-center"
      variant={variant}
      icon={icon}
      dismissible={!!onClose}
      onClose={onClose}
    >
      {children}
    </Alert>
  );
};

CourseEnrollmentsAlert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

CourseEnrollmentsAlert.defaultProps = {
  onClose: null,
};

export default CourseEnrollmentsAlert;
