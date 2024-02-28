import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@openedx/paragon';
import { Lock } from '@openedx/paragon/icons';

import { DISABLED_ENROLL_REASON_TYPES } from '../data/constants';

/**
 * Display under these situations:
 *  1. Enterprise has an offer that doesn't have enough funds remaining to cover
 *     the cost of the course.
 *  2. Enterprise has an offer but the learner has exceeded their per-learner spend limit.
 *  3. Enterprise has an offer but the learner has exceeded their per-learner enrollment limit.
 *  4. Enterprise/learner has no subsidy available whatsoever (no license, no code, no offer).
 *
 * Does not display if there is no valid user message for the reason, or if the user is already enrolled.
 *
 * @param {object} args
 * @param {object} args.missingUserSubsidyReason An object containing a reason slug and user
 * @param {object} args.isUserEnrolled Whether the learner is already enrolled in the course run.
 *   message for why there is no redeemable subsidy for the course.
 * @param {boolean} args.userCanRequestSubsidyForCourse Whether the user can request a subsidy for the course.
 *
 * @returns Card.Status component with appropriate message and actions.
 */
const CourseRunCardStatus = ({
  missingUserSubsidyReason,
  isUserEnrolled,
  userCanRequestSubsidyForCourse,
}) => {
  const missingUserSubsidyReasonType = missingUserSubsidyReason?.reason;
  const missingUserSubsidyReasonUserMessage = missingUserSubsidyReason?.userMessage;
  const missingUserSubsidyReasonActions = missingUserSubsidyReason?.actions;

  const hasValidReason = !!(missingUserSubsidyReasonType && missingUserSubsidyReasonUserMessage);
  if (isUserEnrolled || !hasValidReason || userCanRequestSubsidyForCourse) {
    return null;
  }

  return (
    <Card.Status
      variant="primary"
      icon={Lock}
      actions={missingUserSubsidyReasonActions}
    >
      <p className="font-weight-bold">
        {missingUserSubsidyReasonUserMessage}
      </p>
    </Card.Status>
  );
};

CourseRunCardStatus.propTypes = {
  isUserEnrolled: PropTypes.bool,
  missingUserSubsidyReason: PropTypes.shape({
    reason: PropTypes.oneOf(Object.values(DISABLED_ENROLL_REASON_TYPES)),
    userMessage: PropTypes.string,
    actions: PropTypes.node,
  }),
  userCanRequestSubsidyForCourse: PropTypes.bool,
};

CourseRunCardStatus.defaultProps = {
  isUserEnrolled: false,
  missingUserSubsidyReason: undefined,
  userCanRequestSubsidyForCourse: false,
};

export default CourseRunCardStatus;
