import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import StatefulEnroll from '../../../stateful-enroll';
import { messages } from './data';
import { EVENT_NAMES } from '../../data';

/**
 * Handles upgrading the user's enrollment from audit to paid (e.g., verified) mode for
 * certain supported subsidy types. If the redeemable subsidy type is not supported, falls
 * back to rendering a hyperlink to the courseware.
 */
const UpgradeAndNavigateToCourseware = ({
  contentKey,
  onUpgradeClick,
  onUpgradeSuccess,
  onUpgradeError,
}) => {
  const intl = useIntl();
  return (
    <StatefulEnroll
      labels={{
        default: intl.formatMessage(messages.viewCourse),
        pending: intl.formatMessage(messages.upgrading),
        complete: intl.formatMessage(messages.upgraded),
      }}
      contentKey={contentKey}
      onClick={onUpgradeClick}
      onSuccess={onUpgradeSuccess}
      onError={onUpgradeError}
      options={{
        trackSearchConversionEventName: EVENT_NAMES.sucessfulUpgradeEnrollment,
      }}
    />
  );
};

UpgradeAndNavigateToCourseware.propTypes = {
  contentKey: PropTypes.string.isRequired,
  onUpgradeClick: PropTypes.func.isRequired,
  onUpgradeSuccess: PropTypes.func.isRequired,
  onUpgradeError: PropTypes.func.isRequired,
};

export default UpgradeAndNavigateToCourseware;
