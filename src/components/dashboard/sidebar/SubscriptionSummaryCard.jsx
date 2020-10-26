import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@edx/paragon';
import moment from 'moment';
import { SUBSCRIPTION_DAYS_REMAINING_SEVERE, SUBSCRIPTION_EXPIRED } from '../../../config/constants';
import SidebarCard from './SidebarCard';

const SubscriptionSummaryCard = ({ subscriptionPlan, className }) => {
  const renderCardTitle = (statusBadgeVariant, statusBadgeLabel) => (
    <div>
      Subscription Status
      {' '}
      <Badge variant={statusBadgeVariant}>
        {statusBadgeLabel}
      </Badge>
    </div>
  );

  const renderCardBody = (expirationInfoPrefix, expirationDate) => (
    <>
      {expirationInfoPrefix} <b>{moment(expirationDate).format('MMMM Do YYYY')}</b>
    </>
  );

  // Only render subscription card if subscription is found
  if (subscriptionPlan) {
    // Determine Subscription Status as it relates to expiration
    const { daysUntilExpiration, expirationDate } = subscriptionPlan;
    // Active Subscription
    let statusBadgeLabel = 'Active';
    let statusBadgeVariant = 'success';
    if (daysUntilExpiration <= SUBSCRIPTION_EXPIRED) {
      // Subscription has expired
      statusBadgeLabel = 'Expired';
      statusBadgeVariant = 'danger';
    } else if (daysUntilExpiration <= SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
      // Expiration is approaching
      statusBadgeLabel = 'Expiring';
      statusBadgeVariant = 'warning';
    }
    const expirationInfoPrefix = daysUntilExpiration > 0 ? 'Available until ' : 'Expired on ';
    return (
      <SidebarCard
        title={renderCardTitle(statusBadgeVariant, statusBadgeLabel)}
        cardClassNames={className}
      >
        {renderCardBody(expirationInfoPrefix, expirationDate)}
      </SidebarCard>
    );
  }
  return null;
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
