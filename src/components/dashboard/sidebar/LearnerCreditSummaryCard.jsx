import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@openedx/paragon';
import dayjs from 'dayjs';
import {
  defineMessages, FormattedDate, FormattedMessage, useIntl,
} from '@edx/frontend-platform/i18n';
import CardHeader from '@openedx/paragon/src/Card/CardHeader';
import CardSection from '@openedx/paragon/src/Card/CardSection';
import { useEnterpriseCustomer } from '../../app/data';
import { BUDGET_STATUSES } from '../data/constants';

const badgeStatusMessages = defineMessages({
  active: {
    id: 'enterprise.dashboard.sidebar.learner.credit.card.badge.active',
    defaultMessage: 'Active',
    description: 'Label for the active badge on the learner credit summary card on the enterprise dashboard sidebar.',
  },
  expired: {
    id: 'enterprise.dashboard.sidebar.learner.credit.card.badge.expired',
    defaultMessage: 'Expired',
    description: 'Label for the expired badge on the learner credit summary card on the enterprise dashboard sidebar.',
  },
  expiring: {
    id: 'enterprise.dashboard.sidebar.learner.credit.card.badge.expiring',
    defaultMessage: 'Expiring',
    description: 'Label for the expiring badge on the learner credit summary card on the enterprise dashboard sidebar.',
  },
  scheduled: {
    id: 'enterprise.dashboard.sidebar.learner.credit.card.badge.scheduled',
    defaultMessage: 'Scheduled',
    description: 'Label for the scheduled badge on the learner credit summary card on the enterprise dashboard sidebar.',
  },
  retired: {
    id: 'enterprise.dashboard.sidebar.learner.credit.card.badge.retired',
    defaultMessage: 'Retired',
    description: 'Label for the active retired on the learner credit summary card on the enterprise dashboard sidebar.',
  },
});

/**
 * If the disableExpiryMessagingForLearnerCredit configuration is true, we do not show the expiration badge variant,
 * otherwise, display all other badge variants
 * @param disableExpiryMessagingForLearnerCredit
 * @param status
 * @param badgeVariant
 * @param intl
 * @returns {React.JSX.Element|null}
 */
const getRenderedBadge = ({
  disableExpiryMessagingForLearnerCredit,
  status,
  badgeVariant,
  intl,
}) => {
  let renderedBadge;

  // If the disable learner credit expiration messaging is enabled, default to an active badge
  if (status === BUDGET_STATUSES.expiring && disableExpiryMessagingForLearnerCredit) {
    renderedBadge = {
      badgeVariant: 'success',
      badgeLabel: BUDGET_STATUSES.active,
    };
  } else {
    renderedBadge = {
      badgeVariant,
      badgeLabel: status,
    };
  }

  return (
    <Badge
      variant={renderedBadge.badgeVariant}
      className="ml-2"
      data-testid="learner-credit-status-badge"
    >
      {intl.formatMessage(badgeStatusMessages[renderedBadge.badgeLabel.toLowerCase()])}
    </Badge>
  );
};

const LearnerCreditSummaryCard = ({
  expirationDate,
  statusMetadata,
  assignmentOnlyLearner,
}) => {
  const intl = useIntl();
  const { status, badgeVariant } = statusMetadata;
  const { data: { disableExpiryMessagingForLearnerCredit } } = useEnterpriseCustomer();
  const formattedExpirationDate = dayjs(expirationDate).format('MMM D, YYYY');
  const isBudgetExpired = dayjs(expirationDate).isBefore(dayjs()) && status === BUDGET_STATUSES.expired;

  const cardBadge = useMemo(() => getRenderedBadge({
    disableExpiryMessagingForLearnerCredit,
    status,
    badgeVariant,
    intl,
  }), [badgeVariant, disableExpiryMessagingForLearnerCredit, intl, status]);

  // Validates that the flag to disable expiry messaging is enabled, whether the learner credit expiration is
  // truly expired by a date calculation and the status is set to expired
  if (disableExpiryMessagingForLearnerCredit && isBudgetExpired) {
    return null;
  }

  return (
    <>
      <CardHeader
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
              {cardBadge}
            </div>
          )
        }
      />
      <CardSection>
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

        {(expirationDate && !disableExpiryMessagingForLearnerCredit) && (
          <p className="mb-0" data-testid="learner-credit-summary-end-date-text">
            <FormattedMessage
              id="enterprise.dashboard.sidebar.learner.credit.card.subsidy.expiration.date"
              defaultMessage="Available until {subsidyExpiryDate}"
              description="Subsidy expiration date for the learner credit summary card on the enterprise dashboard sidebar."
              values={{
                subsidyExpiryDate: (
                  <b>
                    <FormattedDate
                      value={formattedExpirationDate}
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
      </CardSection>
    </>
  );
};

LearnerCreditSummaryCard.propTypes = {
  expirationDate: PropTypes.string.isRequired,
  statusMetadata: PropTypes.shape({
    status: PropTypes.string.isRequired,
    badgeVariant: PropTypes.string.isRequired,
    term: PropTypes.string,
    date: PropTypes.string,
  }).isRequired,
  assignmentOnlyLearner: PropTypes.bool.isRequired,
};

export default LearnerCreditSummaryCard;
