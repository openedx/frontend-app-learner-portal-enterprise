import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import StatefulEnroll from '../../../stateful-enroll';
import { LEARNER_CREDIT_SUBSIDY_TYPE } from '../../data/constants';
import BasicNavigateToCourseware from './BasicNavigateToCourseware';
import { messages } from './data';

/**
 * Handles upgrading the user's enrollment from audit to paid (e.g., verified) mode for
 * certain supported subsidy types. If the redeemable subsidy type is not supported, falls
 * back to rendering a hyperlink to the courseware.
 */
const UpgradeAndNavigateToCourseware = ({
  userSubsidyApplicableToCourse,
  contentKey,
  courseRunUrl,
  onUpgradeClick,
  onUpgradeSuccess,
  onUpgradeError,
}) => {
  const intl = useIntl();

  // When subsidyType === 'learnerCredit', attempt to re-redeem the course.
  if (userSubsidyApplicableToCourse.subsidyType === LEARNER_CREDIT_SUBSIDY_TYPE) {
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
      />
    );
  }

  // fallback to navigating to courseware without upgrading. there's no supported upgrade path.
  return <BasicNavigateToCourseware courseRunUrl={courseRunUrl} />;
};

UpgradeAndNavigateToCourseware.propTypes = {
  contentKey: PropTypes.string.isRequired,
  courseRunUrl: PropTypes.string.isRequired,
  userSubsidyApplicableToCourse: PropTypes.shape({
    subsidyType: PropTypes.string.isRequired,
  }).isRequired,
  onUpgradeClick: PropTypes.func.isRequired,
  onUpgradeSuccess: PropTypes.func.isRequired,
  onUpgradeError: PropTypes.func.isRequired,
};

export default UpgradeAndNavigateToCourseware;
