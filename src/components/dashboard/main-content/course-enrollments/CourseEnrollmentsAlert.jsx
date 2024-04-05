import { Alert } from '@openedx/paragon';
import { WarningFilled, CheckCircle } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
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
  const intl = useIntl();

  return (
    <Alert
      className="align-items-center"
      variant={variant}
      icon={icon}
      dismissible={!!onClose}
      onClose={onClose}
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
  onClose: PropTypes.func,
};

CourseEnrollmentsAlert.defaultProps = {
  onClose: null,
};

export default CourseEnrollmentsAlert;
