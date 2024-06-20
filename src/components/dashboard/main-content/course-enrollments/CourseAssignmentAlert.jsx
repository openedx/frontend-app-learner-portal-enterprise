import PropTypes from 'prop-types';
import { Alert, Button, MailtoLink } from '@openedx/paragon';
import { Info } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { getContactEmail } from '../../../../utils/common';
import { ASSIGNMENT_TYPES } from '../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { useEnterpriseCustomer } from '../../../app/data';

const CourseAssignmentAlert = ({
  showAlert,
  onClose,
  variant,
  isAcknowledgingAssignments,
}) => {
  const intl = useIntl();
  const heading = variant === ASSIGNMENT_TYPES.CANCELED ? (
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

  const text = variant === ASSIGNMENT_TYPES.CANCELED ? (
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

  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const adminEmail = getContactEmail(enterpriseCustomer);

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
      <Alert.Heading>{heading}</Alert.Heading>
      <p>{text}</p>
    </Alert>
  );
};

CourseAssignmentAlert.propTypes = {
  onClose: PropTypes.func,
  variant: PropTypes.oneOf([ASSIGNMENT_TYPES.CANCELED, ASSIGNMENT_TYPES.EXPIRED]),
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
