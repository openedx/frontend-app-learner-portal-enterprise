import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@openedx/paragon';
import dayjs from 'dayjs';
import { FormattedDate, FormattedMessage } from '@edx/frontend-platform/i18n';
import SidebarCard from './SidebarCard';
import { LEARNER_CREDIT_ACTIVE_BADGE_VARIANT } from './data/constants';

const LearnerCreditSummaryCard = ({
  className,
  expirationDate,
  assignmentOnlyLearner,
}) => (
  <SidebarCard
    title={
      (
        <div className="d-flex align-items-center justify-content-between">
          <h3 className="m-0">
            <FormattedMessage
              id="enterprise.dashboard.sidebar.learner.credit.card.title"
              defaultMessage="Learner Credit"
              description="Title for the learner credit summary card on the enterprise dashboard sidebar."
            />
          </h3>
          <Badge
            variant={LEARNER_CREDIT_ACTIVE_BADGE_VARIANT}
            className="ml-2"
            data-testid="learner-credit-status-badge"
          >
            <FormattedMessage
              id="enterprise.dashboard.sidebar.learner.credit.card.badge.active"
              defaultMessage="Active"
              description="Label for the active badge on the learner credit summary card on the enterprise dashboard sidebar."
            />
          </Badge>
        </div>
      )
    }
    cardClassNames={className}
  >
    <p data-testid="learner-credit-summary-text">
      {assignmentOnlyLearner ? (
        <FormattedMessage
          id="enterprise.dashboard.sidebar.learner.credit.card.assignment.only.description"
          defaultMessage="Your organization will assign courses to learners. Please contact your administrator if you are interested in taking a course."
          description="Description for the learner credit summary card on the enterprise dashboard sidebar when learner has assignment."
        />
      ) : (
        <FormattedMessage
          id="enterprise.dashboard.sidebar.learner.credit.card.description"
          defaultMessage="Apply your organization's learner credit balance to enroll into courses with no out of pocket cost."
          description="Description for the learner credit summary card on the enterprise dashboard sidebar when learner has no assignment."
        />
      )}
    </p>

    {expirationDate && (
      <p className="mb-0" data-testid="learner-credit-summary-end-date-text">
        <FormattedMessage
          id="enterprise.dashboard.sidebar.learner.credit.card.subsidy.expiration.date"
          defaultMessage="Available until {subsidyExpiryDate}"
          description="Subsidy expiration date for the learner credit summary card on the enterprise dashboard sidebar."
          values={{
            subsidyExpiryDate: (
              <b>
                <FormattedDate
                  value={dayjs(expirationDate).format('MMM D, YYYY')}
                  year="numeric"
                  month="short"
                  day="numeric"
                />
              </b>
            ),
          }}
        />
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
