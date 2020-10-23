import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@edx/paragon';
import moment from 'moment';
import { SUBSCRIPTION_DAYS_REMAINING_SEVERE } from '../../../config/constants';
import SidebarCard from './SidebarCard';

const SubscriptionSummaryCard = ({ subscriptionPlan }) => {
  const renderCardTitle = (statusBadgeVariant, statusBadgeLabel) => (
    <div>
      <p>Subscription Status</p>
      <Badge variant={statusBadgeVariant}>
        {statusBadgeLabel}
      </Badge>
    </div>
  );

  const renderCardBody = (expirationInfoPrefix, expirationDate) => (
    <p>
      {expirationInfoPrefix} <b>{moment(expirationDate).format('MMMM Do YYYY')}</b>
    </p>
  );

  // Only render subscription card if subscription is found
  if (subscriptionPlan) {
    // Determine Subscription Status as it relates to expiration
    const { daysUntilExpiration, expirationDate } = subscriptionPlan;
    let statusBadgeLabel = '';
    let statusBadgeVariant = '';
    if (daysUntilExpiration <= SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
      // Expiration is approaching
      statusBadgeLabel = 'Expiring';
      statusBadgeVariant = 'warning';
    } else if (daysUntilExpiration <= 0) {
      // Subscription has expired
      statusBadgeLabel = 'Expired';
      statusBadgeVariant = 'danger';
    } else {
      // Active Subscription
      statusBadgeLabel = 'Active';
      statusBadgeVariant = 'success';
    }
    const expirationInfoPrefix = daysUntilExpiration > 0 ? 'Available until ' : 'Expired on ';
    return (
      <SidebarCard title={renderCardTitle(statusBadgeVariant, statusBadgeLabel)}>
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
};

export default SubscriptionSummaryCard;
