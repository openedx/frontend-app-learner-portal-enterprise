import React from 'react';
import PropTypes from 'prop-types';
import { Button, Alert } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

const CourseAssignmentAlert = ({
  onClose,
  variant,
}) => {
  const heading = variant === 'cancelled' ? 'Course assignment cancelled' : 'Deadline passed';
  const text = (variant === 'cancelled'
    ? 'Your learning administrator cancelled one or more course assignments below.'
    : 'Deadline to enroll into one or more courses below has passed.');
  return (
    <Alert
      variant="danger"
      icon={Info}
      dismissible
      actions={[
        <Button className="text-nowrap">Contact administrator</Button>,
      ]}
      onClose={onClose}
    >
      <Alert.Heading>{heading}</Alert.Heading>
      <p> {text} </p>
    </Alert>
  );
};

CourseAssignmentAlert.propTypes = {
  onClose: PropTypes.func,
  variant: PropTypes.string,
};

CourseAssignmentAlert.defaultProps = {
  onClose: null,
  variant: null,
};

export default CourseAssignmentAlert;
