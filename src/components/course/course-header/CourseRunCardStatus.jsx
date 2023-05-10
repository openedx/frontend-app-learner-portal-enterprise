import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';
import { Lock } from '@edx/paragon/icons';

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
 *
 * @returns Card.Status component with appropriate message and actions.
 */
const CourseRunCardStatus = ({ missingUserSubsidyReason, isUserEnrolled }) => {
  const missingUserSubsidyReasonType = missingUserSubsidyReason?.reason;
  const missingUserSubsidyReasonUserMessage = missingUserSubsidyReason?.userMessage;
  const missingUserSubsidyReasonActions = missingUserSubsidyReason?.actions;

  const hasValidReason = !!(missingUserSubsidyReasonType && missingUserSubsidyReasonUserMessage);
  if (isUserEnrolled || !hasValidReason) {
    return null;
  }

  return (
    <Card.Status
      // TODO: this `className` shouldn't be needed, since the d-flex was removed in
      // the paragon code. just not coming through here for some reason... remove once
      // https://github.com/openedx/paragon/pull/2272 merges and Paragon is upgraded.
      className="d-block"
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
};

CourseRunCardStatus.defaultProps = {
  isUserEnrolled: false,
  missingUserSubsidyReason: undefined,
};

export default CourseRunCardStatus;
