import PropTypes from 'prop-types';
import { Alert, Button, MailtoLink } from '@openedx/paragon';
import { Info, Warning } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { getContactEmail } from '../../../../utils/common';
import { ASSIGNMENT_TYPES, useEnterpriseCustomer } from '../../../app/data';

const alertMessagingByVariant = {
  [ASSIGNMENT_TYPES.CANCELED]: {
    heading: (
      <FormattedMessage
        id="enterprise.dashboard.course.assignment.canceled.alert.heading"
        defaultMessage="Course assignment canceled"
        description="Heading for the alert that appears when a course assignment is canceled."
      />
    ),
    text: (
      <FormattedMessage
        id="enterprise.dashboard.course.assignment.canceled.alert.text"
        defaultMessage="Your learning administrator canceled one or more course assignments below."
        description="Text for the alert that appears when a course assignment is canceled."
      />
    ),
    variant: 'danger',
    hasContactAdministrator: true,
    isDismissable: true,
    icon: Info,
  },
  [ASSIGNMENT_TYPES.EXPIRED]: {
    heading: (
      <FormattedMessage
        id="enterprise.dashboard.course.assignment.deadline.passed.alert.heading"
        defaultMessage="Deadline passed"
        description="Heading for the alert that appears when a course assignment deadline has passed."
      />
    ),
    text: (
      <FormattedMessage
        id="enterprise.dashboard.course.assignment.deadline.passed.alert.text"
        defaultMessage="Deadline to enroll into one or more courses below has passed."
        description="Text for the alert that appears when a course assignment deadline has passed."
      />
    ),
    variant: 'danger',
    hasContactAdministrator: true,
    isDismissable: true,
    icon: Info,
  },
  [ASSIGNMENT_TYPES.EXPIRING]: {
    heading: (
      <FormattedMessage
        id="enterprise.dashboard.course.assignment.expiring.alert.heading"
        defaultMessage="Enrollment deadlines approaching"
        description="Heading for the alert that appears when a course assignment is expiring soon."
      />
    ),
    text: (
      <FormattedMessage
        id="enterprise.dashboard.course.assignment.expiring.alert.text"
        defaultMessage="One or more of your assigned courses is approaching their deadline to enroll. Please enroll before the course is removed."
        description="Text for the alert that appears when a course assignment is expiring soon."
      />
    ),
    variant: 'warning',
    hasContactAdministrator: false,
    isDismissable: true,
    icon: Warning,
  },
};

const CourseAssignmentAlert = ({
  showAlert,
  onClose,
  variant,
  isAcknowledgingAssignments,
}) => {
  const intl = useIntl();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const adminEmail = getContactEmail(enterpriseCustomer);
  const alertMessaging = alertMessagingByVariant[variant];
  if (!alertMessaging) {
    return null;
  }

  const alertActions = alertMessaging.hasContactAdministrator ? [
    <Button as={MailtoLink} className="text-nowrap" to={adminEmail}>
      <FormattedMessage
        id="enterprise.dashboard.course.assignment.alert.contact.admin.button"
        defaultMessage="Contact administrator"
        description="Contact adminstrator button label for the course enrollemnt assignment alert"
      />
    </Button>,
  ] : [];

  return (
    <Alert
      variant={alertMessaging.variant}
      show={showAlert}
      icon={alertMessaging.icon}
      dismissible={alertMessaging.isDismissable}
      actions={alertActions}
      onClose={onClose}
      closeLabel={isAcknowledgingAssignments
        ? intl.formatMessage({
          id: 'enterprise.dashboard.course.assignment.alert.dismissing.button',
          defaultMessage: 'Dismissing...',
          description: 'Dismiss button label for while the course assignments alert when assignments are actively being acknowledged',
        })
        : intl.formatMessage({
          id: 'enterprise.dashboard.course.assignment.alert.dismiss.button',
          defaultMessage: 'Dismiss',
          description: 'Dismiss button label for the course assignment alert',
        })}
    >
      <Alert.Heading>{alertMessaging.heading}</Alert.Heading>
      <p>{alertMessaging.text}</p>
    </Alert>
  );
};

CourseAssignmentAlert.propTypes = {
  onClose: PropTypes.func,
  variant: PropTypes.oneOf([ASSIGNMENT_TYPES.CANCELED, ASSIGNMENT_TYPES.EXPIRED, ASSIGNMENT_TYPES.EXPIRING]),
  showAlert: PropTypes.bool,
  isAcknowledgingAssignments: PropTypes.bool,
};

CourseAssignmentAlert.defaultProps = {
  onClose: null,
  variant: null,
  showAlert: false,
  isAcknowledgingAssignments: false,
};

export default CourseAssignmentAlert;
