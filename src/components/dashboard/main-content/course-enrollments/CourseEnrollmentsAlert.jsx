import { Alert, useToggle } from '@openedx/paragon';
import { CheckCircle, WarningFilled } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

const iconByVariant = {
  success: CheckCircle,
  danger: WarningFilled,
};

const CourseEnrollmentsAlert = ({
  children,
  variant,
  show,
  onClose,
}) => {
  const icon = iconByVariant[variant];
  const intl = useIntl();
  const [displayAlert, ,close] = useToggle(!!show);
  console.log(show);
  const handleCourseEnrollmentsAlertClose = (e) => {
    e.preventDefault();
    onClose();
    close();
  };

  return (
    <Alert
      className="align-items-center"
      variant={variant}
      show={displayAlert}
      icon={icon}
      dismissible
      onClose={handleCourseEnrollmentsAlertClose}
      closeLabel={intl.formatMessage({
        id: 'enterprise.dashboard.course.enrollment.alert.dismiss.button',
        defaultMessage: 'Dismiss',
        description: 'Dismiss button label for the course enrollment alert',
      })}
    >
      {children}
    </Alert>
  );
};

CourseEnrollmentsAlert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

CourseEnrollmentsAlert.defaultProps = {
  onClose: null,
};

export default CourseEnrollmentsAlert;
