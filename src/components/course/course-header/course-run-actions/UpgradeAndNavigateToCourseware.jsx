import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import StatefulEnroll from '../../../stateful-enroll';
import { LEARNER_CREDIT_SUBSIDY_TYPE } from '../../data/constants';
import BasicNavigateToCourseware from './BasicNavigateToCourseware';
import { messages } from './data';

/**
 * TODO
 * @param {*} param0
 * @returns
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
  // TODO: verify this assumption is correct for EMET APIs
  if (userSubsidyApplicableToCourse.subsidyType !== LEARNER_CREDIT_SUBSIDY_TYPE) {
    return (
      <StatefulEnroll
        contentKey={contentKey}
        onClick={onUpgradeClick}
        onSuccess={onUpgradeSuccess}
        onError={onUpgradeError}
        labels={{
          default: 'View course',
          pending: 'Upgrading...',
          complete: 'Upgraded',
        }}
      >
        {intl.formatMessage(messages.viewCourse)}
      </StatefulEnroll>
    );
  }

  // fallback to navigating to courseware without upgrading. there's no supported upgrade path.
  return <BasicNavigateToCourseware courseRunUrl={courseRunUrl} />;
};

UpgradeAndNavigateToCourseware.propTypes = {
  contentKey: PropTypes.string.isRequired,
  courseRunUrl: PropTypes.string.isRequired,
  userSubsidyApplicableToCourse: PropTypes.shape().isRequired, // TODO: add shape object
  onUpgradeClick: PropTypes.func.isRequired,
  onUpgradeSuccess: PropTypes.func.isRequired,
  onUpgradeError: PropTypes.func.isRequired,
};

export default UpgradeAndNavigateToCourseware;
