import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@edx/paragon';
import moment from 'moment';
import { SUBSCRIPTION_DAYS_REMAINING_SEVERE, SUBSCRIPTION_EXPIRED } from '../../../config/constants';
import SidebarCard from './SidebarCard';
import {
  SUBSCRIPTION_ACTIVE_BADGE_LABEL,
  SUBSCRIPTION_ACTIVE_BADGE_VARIANT,
  SUBSCRIPTION_ACTIVE_DATE_PREFIX,
  SUBSCRIPTION_EXPIRED_BADGE_LABEL,
  SUBSCRIPTION_EXPIRED_BADGE_VARIANT,
  SUBSCRIPTION_EXPIRED_DATE_PREFIX,
  SUBSCRIPTION_SUMMARY_CARD_TITLE,
  SUBSCRIPTION_WARNING_BADGE_LABEL,
  SUBSCRIPTION_WARNING_BADGE_VARIANT,
} from './data/constants';

const SubscriptionSummaryCard = ({ subscriptionPlan, className }) => {
  const { daysUntilExpiration, expirationDate } = subscriptionPlan;
  const renderCardTitle = () => {
    // Active Subscription
    let statusBadgeLabel = SUBSCRIPTION_ACTIVE_BADGE_LABEL;
    let statusBadgeVariant = SUBSCRIPTION_ACTIVE_BADGE_VARIANT;
    if (daysUntilExpiration <= SUBSCRIPTION_EXPIRED) {
      // Subscription has expired
      statusBadgeLabel = SUBSCRIPTION_EXPIRED_BADGE_LABEL;
      statusBadgeVariant = SUBSCRIPTION_EXPIRED_BADGE_VARIANT;
    } else if (daysUntilExpiration <= SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
      // Expiration is approaching
      statusBadgeLabel = SUBSCRIPTION_WARNING_BADGE_LABEL;
      statusBadgeVariant = SUBSCRIPTION_WARNING_BADGE_VARIANT;
    }
    return (
      <div className="d-flex">
        <div>{SUBSCRIPTION_SUMMARY_CARD_TITLE}</div>
        <div>
          <Badge
            variant={statusBadgeVariant}
            className="ml-2"
            data-testid="subscription-status-badge"
          >
            {statusBadgeLabel}
          </Badge>
        </div>
      </div>
    );
  };

  const renderCardBody = () => (
    <>
      {daysUntilExpiration > SUBSCRIPTION_EXPIRED ? SUBSCRIPTION_ACTIVE_DATE_PREFIX : SUBSCRIPTION_EXPIRED_DATE_PREFIX}
      {' '}<span className="font-weight-bold">{moment(expirationDate).format('MMMM Do, YYYY')}</span>
    </>
  );

  return (
    <SidebarCard
      title={renderCardTitle()}
      cardClassNames={className}
    >
      {renderCardBody()}
    </SidebarCard>
  );
};

SubscriptionSummaryCard.propTypes = {
  subscriptionPlan: PropTypes.shape({
    daysUntilExpiration: PropTypes.number.isRequired,
    expirationDate: PropTypes.string.isRequired,
  }).isRequired,
  className: PropTypes.string,
};

SubscriptionSummaryCard.defaultProps = {
  className: undefined,
};

export default SubscriptionSummaryCard;
