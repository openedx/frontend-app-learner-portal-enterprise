import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Card, Stack } from '@openedx/paragon';
import { defineMessages, FormattedMessage } from '@edx/frontend-platform/i18n';
import useSubscriptionSummaryCard from './data/hooks/useSubscriptionSummaryCard';

const messages = defineMessages({
  subsidyExpiredOnDate: {
    id: 'enterprise.dashboard.sidebar.subscription.expired.date.prefix',
    defaultMessage: 'Expired on {subsidyExpiryDate}',
    description: 'Subscription expired date prefix on the enterprise dashboard sidebar.',
  },
  subsidyAvailableUntilDate: {
    id: 'enterprise.dashboard.sidebar.subscription.active.date.prefix.text',
    defaultMessage: 'Available until {subsidyExpiryDate}',
    description: 'Subscription active date prefix on the enterprise dashboard sidebar.',
  },
  expiredBadge: {
    id: 'enterprise.dashboard.sidebar.subscription.expired.badge.label',
    defaultMessage: 'Expired',
    description: 'Subscription expired badge label on the enterprise dashboard sidebar.',
  },
  expiringSoonBadge: {
    id: 'enterprise.dashboard.sidebar.subscription.expiring.soon.badge.label',
    defaultMessage: 'Expiring Soon',
    description: 'Subscription expiring soon badge label on the enterprise dashboard sidebar.',
  },
  expiringBadge: {
    id: 'enterprise.dashboard.sidebar.subscription.warning.badge.label',
    defaultMessage: 'Expiring',
    description: 'Subscription expiring warning badge label on the enterprise dashboard sidebar.',
  },
  activeBadge: {
    id: 'enterprise.dashboard.sidebar.subscription.active.badge.label',
    defaultMessage: 'Active',
    description: 'Subscription active badge label on the enterprise dashboard sidebar.',
  },
  licenseRequestBadge: {
    id: 'enterprise.dashboard.sidebar.license.requested.badge.label',
    defaultMessage: 'Requested',
    description: 'License requested badge label on the enterprise dashboard sidebar.',
  },
});

const SubscriptionSummaryCard = ({
  courseEndDate, programProgressPage,
}) => {
  const {
    programProgressSubscriptionExpirationWarningModal,
    badgeVariantAndLabel,
    subscriptionExpirationDate,
    showSubscriptionSummaryCard,
  } = useSubscriptionSummaryCard({
    messages,
    programProgressPage,
    courseEndDate,
  });

  // Don't render the card summary if there is no subscription plan or license request or
  // if the disable expiration notifications on the customer agreement is enabled and
  // the applicable subscription plan is expired.
  if (!showSubscriptionSummaryCard) {
    return null;
  }

  if (programProgressPage) {
    return (
      <>
        <Card.Header
          title={(
            <Stack direction="horizontal" className="align-items-start justify-content-between">
              <h3 className="m-0">
                <FormattedMessage
                  id="enterprise.dashboard.sidebar.subscription.summary.card.title.text1"
                  defaultMessage="Subscription Status"
                  description="Subscription status title on the enterprise dashboard sidebar."
                />
              </h3>
              <span>
                <Badge
                  variant={badgeVariantAndLabel.variant}
                  data-testid="subscription-status-badge"
                >
                  {badgeVariantAndLabel.label}
                </Badge>
                {programProgressSubscriptionExpirationWarningModal}
              </span>
            </Stack>
          )}
        />
        {subscriptionExpirationDate}
      </>
    );
  }

  return (
    <>
      <Card.Header
        title={(
          <Stack direction="horizontal" className="align-items-start justify-content-between">
            <h3 className="m-0">
              <FormattedMessage
                id="enterprise.dashboard.sidebar.subscription.summary.card.title.text2"
                defaultMessage="Subscription Status"
                description="Subscription status summary card title on the enterprise dashboard sidebar."
              />
            </h3>
            <Badge
              variant={badgeVariantAndLabel.variant}
              data-testid="subscription-status-badge"
            >
              {badgeVariantAndLabel.label}
            </Badge>
          </Stack>
        )}
      />
      {subscriptionExpirationDate}
    </>
  );
};

SubscriptionSummaryCard.propTypes = {
  courseEndDate: PropTypes.string,
  programProgressPage: PropTypes.bool,
};

SubscriptionSummaryCard.defaultProps = {
  programProgressPage: false,
  courseEndDate: undefined,
};

export default SubscriptionSummaryCard;
