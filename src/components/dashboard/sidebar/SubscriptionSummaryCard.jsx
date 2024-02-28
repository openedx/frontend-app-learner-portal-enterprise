import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Badge, useToggle } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import { SUBSCRIPTION_DAYS_REMAINING_SEVERE, SUBSCRIPTION_EXPIRED } from '../../../config/constants';
import SidebarCard from './SidebarCard';
import {
  LICENSE_REQUESTED_BADGE_LABEL,
  LICENSE_REQUESTED_BADGE_VARIANT,
  LICENSE_REQUESTED_NOTICE,
  SUBSCRIPTION_ACTIVE_BADGE_LABEL,
  SUBSCRIPTION_ACTIVE_BADGE_VARIANT,
  SUBSCRIPTION_ACTIVE_DATE_PREFIX,
  SUBSCRIPTION_EXPIRED_BADGE_LABEL,
  SUBSCRIPTION_EXPIRED_BADGE_VARIANT,
  SUBSCRIPTION_EXPIRED_DATE_PREFIX,
  SUBSCRIPTION_SUMMARY_CARD_TITLE,
  SUBSCRIPTION_WARNING_BADGE_LABEL,
  SUBSCRIPTION_EXPIRING_SOON_BADGE_LABEL,
  SUBSCRIPTION_WARNING_BADGE_VARIANT,
} from './data/constants';
import SubscriptionExpirationWarningModal from '../../program-progress/SubscriptionExpiringWarningModal';
import dayjs from '../../../utils/dayjs';

const SubscriptionSummaryCard = ({
  subscriptionPlan, licenseRequest, className, courseEndDate, programProgressPage,
}) => {
  const [
    isSubscriptionExpiringWarningModalOpen,
    subscriptionExpiringWarningModalOpen,
    onSubscriptionExpiringWarningModalClose,
  ] = useToggle(false);

  const badgeVariantAndLabel = useMemo(() => {
    if (subscriptionPlan) {
      if (subscriptionPlan.daysUntilExpiration <= SUBSCRIPTION_EXPIRED) {
        // Subscription has expired
        return ({
          variant: SUBSCRIPTION_EXPIRED_BADGE_VARIANT,
          label: SUBSCRIPTION_EXPIRED_BADGE_LABEL,
        });
      }
      if (programProgressPage && subscriptionPlan.daysUntilExpiration <= SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
        // Expiration is approaching
        return ({
          variant: SUBSCRIPTION_WARNING_BADGE_VARIANT,
          label: SUBSCRIPTION_EXPIRING_SOON_BADGE_LABEL,
        });
      }
      if (!programProgressPage && subscriptionPlan.daysUntilExpiration <= SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
        // Expiration is approaching
        return ({
          variant: SUBSCRIPTION_WARNING_BADGE_VARIANT,
          label: SUBSCRIPTION_WARNING_BADGE_LABEL,
        });
      }

      return ({
        variant: SUBSCRIPTION_ACTIVE_BADGE_VARIANT,
        label: SUBSCRIPTION_ACTIVE_BADGE_LABEL,
      });
    }

    if (licenseRequest) {
      return ({
        variant: LICENSE_REQUESTED_BADGE_VARIANT,
        label: LICENSE_REQUESTED_BADGE_LABEL,
      });
    }

    return null;
  }, [subscriptionPlan, licenseRequest, programProgressPage]);

  if (!(subscriptionPlan || licenseRequest)) {
    return null;
  }

  if (programProgressPage) {
    return (
      <>
        {subscriptionPlan && (
          <SubscriptionExpirationWarningModal
            isSubscriptionExpiringWarningModalOpen={isSubscriptionExpiringWarningModalOpen}
            onSubscriptionExpiringWarningModalClose={onSubscriptionExpiringWarningModalClose}
          />
        )}
        <SidebarCard
          title={(
            <div className="d-flex align-items-start justify-content-between">
              <h3>{SUBSCRIPTION_SUMMARY_CARD_TITLE}</h3>
              <div>
                <Badge
                  variant={badgeVariantAndLabel.variant}
                  className="ml-2"
                  data-testid="subscription-status-badge"
                >
                  {badgeVariantAndLabel.label}
                </Badge>
                {(subscriptionPlan && courseEndDate > subscriptionPlan.expirationDate) && <WarningFilled data-testid="warning-icon" className="ml-2" onClick={() => { subscriptionExpiringWarningModalOpen(); }} />}
              </div>
            </div>
          )}
          cardClassNames={className}
        >
          {
            subscriptionPlan ? (
              <>
                {subscriptionPlan.daysUntilExpiration > SUBSCRIPTION_EXPIRED
                  ? SUBSCRIPTION_ACTIVE_DATE_PREFIX : SUBSCRIPTION_EXPIRED_DATE_PREFIX}
                {' '}<span className="font-weight-bold">{dayjs(subscriptionPlan.expirationDate).format('MMMM Do, YYYY')}</span>
              </>
            ) : <span>{LICENSE_REQUESTED_NOTICE}</span>
          }
        </SidebarCard>
      </>
    );
  }

  return (
    <SidebarCard
      title={(
        <div className="d-flex align-items-start justify-content-between">
          <div>{SUBSCRIPTION_SUMMARY_CARD_TITLE}</div>
          <div>
            <Badge
              variant={badgeVariantAndLabel.variant}
              className="ml-2"
              data-testid="subscription-status-badge"
            >
              {badgeVariantAndLabel.label}
            </Badge>
          </div>
        </div>
      )}
      cardClassNames={className}
    >
      {
        subscriptionPlan ? (
          <>
            {subscriptionPlan.daysUntilExpiration > SUBSCRIPTION_EXPIRED
              ? SUBSCRIPTION_ACTIVE_DATE_PREFIX : SUBSCRIPTION_EXPIRED_DATE_PREFIX}
            {' '}<span className="font-weight-bold">{dayjs(subscriptionPlan.expirationDate).format('MMMM Do, YYYY')}</span>
          </>
        ) : <span>{LICENSE_REQUESTED_NOTICE}</span>
      }
    </SidebarCard>
  );
};

SubscriptionSummaryCard.propTypes = {
  subscriptionPlan: PropTypes.shape({
    daysUntilExpiration: PropTypes.number.isRequired,
    expirationDate: PropTypes.string.isRequired,
  }),
  licenseRequest: PropTypes.shape({}),
  className: PropTypes.string,
  courseEndDate: PropTypes.string,
  programProgressPage: PropTypes.bool,
};

SubscriptionSummaryCard.defaultProps = {
  className: undefined,
  programProgressPage: false,
  courseEndDate: undefined,
  subscriptionPlan: undefined,
  licenseRequest: undefined,
};

export default SubscriptionSummaryCard;
