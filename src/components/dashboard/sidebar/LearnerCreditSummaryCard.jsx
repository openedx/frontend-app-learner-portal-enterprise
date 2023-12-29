import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@openedx/paragon';
import dayjs from 'dayjs';
import {
  LEARNER_CREDIT_ACTIVE_BADGE_LABEL,
  LEARNER_CREDIT_ACTIVE_BADGE_VARIANT,
  LEARNER_CREDIT_ASSIGNMENT_ONLY_SUMMARY,
  LEARNER_CREDIT_CARD_SUMMARY,
  LEARNER_CREDIT_SUMMARY_CARD_TITLE,
} from './data/constants';
import SidebarCard from './SidebarCard';

const LearnerCreditSummaryCard = ({
  className, expirationDate, assignmentOnlyLearner,
}) => (
  <SidebarCard
    title={
      (
        <div className="d-flex align-items-center justify-content-between">
          <h3 className="m-0">{LEARNER_CREDIT_SUMMARY_CARD_TITLE}</h3>
          <Badge
            variant={LEARNER_CREDIT_ACTIVE_BADGE_VARIANT}
            className="ml-2"
            data-testid="learner-credit-status-badge"
          >
            {LEARNER_CREDIT_ACTIVE_BADGE_LABEL}
          </Badge>
        </div>
      )
    }
    cardClassNames={className}
  >
    <p data-testid="learner-credit-summary-text">
      { assignmentOnlyLearner ? LEARNER_CREDIT_ASSIGNMENT_ONLY_SUMMARY : LEARNER_CREDIT_CARD_SUMMARY }
    </p>

    {expirationDate && (
      <p data-testid="learner-credit-summary-end-date-text">
        Available until <b>{dayjs(expirationDate).format('MMM D, YYYY')}</b>
      </p>
    )}
  </SidebarCard>
);

LearnerCreditSummaryCard.propTypes = {
  expirationDate: PropTypes.string.isRequired,
  className: PropTypes.string,
  assignmentOnlyLearner: PropTypes.bool.isRequired,
};

LearnerCreditSummaryCard.defaultProps = {
  className: undefined,
};

export default LearnerCreditSummaryCard;
