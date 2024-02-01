import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import PropTypes from 'prop-types';
import { Alert, Button, MailtoLink } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { getContactEmail } from '../../../../utils/common';

const CourseAssignmentAlert = ({
  showAlert,
  onClose,
  variant,
}) => {
  const intl = useIntl();
  const heading = variant === 'canceled' ? (
    <FormattedMessage
      id="enterprise.dashboard.course.assignment.cancelled.alert.heading"
      defaultMessage="Course assignment canceled"
      description="Heading for the alert that appears when a course assignment is canceled."
    />
  ) : (
    <FormattedMessage
      id="enterprise.dashboard.course.assignment.deadline.passed.alert.heading"
      defaultMessage="Deadline passed"
      description="Heading for the alert that appears when a course assignment deadline has passed."
    />
  );

  const text = variant === 'canceled' ? (
    <FormattedMessage
      id="enterprise.dashboard.course.assignment.cancelled.alert.text"
      defaultMessage="Your learning administrator canceled one or more course assignments below."
      description="Text for the alert that appears when a course assignment is canceled."
    />
  ) : (
    <FormattedMessage
      id="enterprise.dashboard.course.assignment.deadline.passed.alert.text"
      defaultMessage="Deadline to enroll into one or more courses below has passed."
      description="Text for the alert that appears when a course assignment deadline has passed."
    />
  );

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
          <FormattedMessage
            id="enterprise.dashboard.course.assignment.alert.contact.admin.button"
            defaultMessage="Contact administrator"
            description="Conatact adminstrator button label for the course enrollemnt assignment alert"
          />
        </Button>,
      ]}
      onClose={onClose}
      closeLabel={intl.formatMessage({
        id: 'enterprise.dashboard.course.assignment.alert.dismiss.button',
        defaultMessage: 'Dismiss',
        description: 'Dismiss button label for the course assignment alert',
      })}
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
