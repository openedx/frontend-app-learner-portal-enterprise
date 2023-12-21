import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import PropTypes from 'prop-types';
import { Alert, Button, MailtoLink } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import { getContactEmail } from '../../../../utils/common';

const CourseAssignmentAlert = ({
  showAlert,
  onClose,
  variant,
}) => {
  const heading = variant === 'canceled' ? 'Course assignment canceled' : 'Deadline passed';
  const text = (variant === 'canceled'
    ? 'Your learning administrator canceled one or more course assignments below.'
    : 'Deadline to enroll into one or more courses below has passed.');

  const { enterpriseConfig } = useContext(AppContext);
  const adminEmail = getContactEmail(enterpriseConfig);

  return (
    <Alert
      variant="danger"
      show={showAlert}
      icon={Info}
      dismissible
      actions={[
        <Button as={MailtoLink} className="text-nowrap" to={adminEmail}>
          Contact administrator
        </Button>,
      ]}
      onClose={onClose}
    >
      <Alert.Heading>{heading}</Alert.Heading>
      <p>{text}</p>
    </Alert>
  );
};

CourseAssignmentAlert.propTypes = {
  onClose: PropTypes.func,
  variant: PropTypes.string,
  showAlert: PropTypes.bool,
};

CourseAssignmentAlert.defaultProps = {
  onClose: null,
  variant: null,
  showAlert: false,
};

export default CourseAssignmentAlert;
