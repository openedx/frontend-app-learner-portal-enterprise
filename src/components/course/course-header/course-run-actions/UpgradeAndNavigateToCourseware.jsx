import React from 'react';
import PropTypes from 'prop-types';
import { useIntl, defineMessages } from '@edx/frontend-platform/i18n';

import StatefulEnroll from '../../../stateful-enroll';
import { LEARNER_CREDIT_SUBSIDY_TYPE } from '../../data/constants';
import BasicNavigateToCourseware from './BasicNavigateToCourseware';

const messages = defineMessages({
  viewCourse: {
    id: 'useCourseRunCardAction.viewCourse',
    defaultMessage: 'View course',
    description: 'Label for button when learner is already enrolled.',
  },
});

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const UpgradeAndNavigateToCourseware = ({
  userSubsidyApplicableToCourse,
  contentKey,
  courseRunUrl,
}) => {
  const intl = useIntl();

  // When subsidyType === 'learnerCredit', attempt to re-redeem the course.
  // TODO: verify this assumption is correct for EMET APIs.
  if (userSubsidyApplicableToCourse.subsidyType === LEARNER_CREDIT_SUBSIDY_TYPE) {
    return (
      <StatefulEnroll contentKey={contentKey}>
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
  // TODO: add shape object
  userSubsidyApplicableToCourse: PropTypes.shape().isRequired,
};

export default UpgradeAndNavigateToCourseware;
