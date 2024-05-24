import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Badge, useToggle } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { SUBSCRIPTION_DAYS_REMAINING_SEVERE } from '../../../config/constants';
import SidebarCard from './SidebarCard';
import SubscriptionExpirationWarningModal from '../../program-progress/SubscriptionExpiringWarningModal';
import dayjs from '../../../utils/dayjs';
import {
  LICENSE_REQUESTED_BADGE_VARIANT,
  SUBSCRIPTION_ACTIVE_BADGE_VARIANT,
  SUBSCRIPTION_EXPIRED_BADGE_VARIANT,
  SUBSCRIPTION_WARNING_BADGE_VARIANT,
} from './data/constants';

const SubscriptionSummaryCard = ({
  subscriptionPlan, licenseRequest, className, courseEndDate, programProgressPage,
}) => {
  const [
    isSubscriptionExpiringWarningModalOpen,
    subscriptionExpiringWarningModalOpen,
    onSubscriptionExpiringWarningModalClose,
  ] = useToggle(false);
  const intl = useIntl();
  const badgeVariantAndLabel = useMemo(() => {
    if (subscriptionPlan) {
      if (!subscriptionPlan.isCurrent) {
        // Subscription has expired
        return ({
          variant: SUBSCRIPTION_EXPIRED_BADGE_VARIANT,
          label: intl.formatMessage({
            id: 'enterprise.dashboard.sidebar.subscription.expired.badge.label',
            defaultMessage: 'Expired',
            description: 'Subscription expired badge label on the enterprise dashboard sidebar.',
          }),
        });
      }
      if (programProgressPage
        && subscriptionPlan.daysUntilExpirationIncludingRenewals <= SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
        // Expiration is approaching
        return ({
          variant: SUBSCRIPTION_WARNING_BADGE_VARIANT,
          label: intl.formatMessage({
            id: 'enterprise.dashboard.sidebar.subscription.expiring.soon.badge.label',
            defaultMessage: 'Expiring Soon',
            description: 'Subscription expiring soon badge label on the enterprise dashboard sidebar.',
          }),
        });
      }
      if (!programProgressPage
        && subscriptionPlan.daysUntilExpirationIncludingRenewals <= SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
        // Expiration is approaching
        return ({
          variant: SUBSCRIPTION_WARNING_BADGE_VARIANT,
          label: intl.formatMessage({
            id: 'enterprise.dashboard.sidebar.subscription.warning.badge.label',
            defaultMessage: 'Expiring',
            description: 'Subscription expiring warning badge label on the enterprise dashboard sidebar.',
          }),
        });
      }

      return ({
        variant: SUBSCRIPTION_ACTIVE_BADGE_VARIANT,
        label: intl.formatMessage({
          id: 'enterprise.dashboard.sidebar.subscription.active.badge.label',
          defaultMessage: 'Active',
          description: 'Subscription active badge label on the enterprise dashboard sidebar.',
        }),
      });
    }

    if (licenseRequest) {
      return ({
        variant: LICENSE_REQUESTED_BADGE_VARIANT,
        label: intl.formatMessage({
          id: 'enterprise.dashboard.sidebar.license.requested.badge.label',
          defaultMessage: 'Requested',
          description: 'License requested badge label on the enterprise dashboard sidebar.',
        }),
      });
    }

    return null;
  }, [subscriptionPlan, licenseRequest, intl, programProgressPage]);

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
              <h3>
                <FormattedMessage
                  id="enterprise.dashboard.sidebar.subscription.summary.card.title.text1"
                  defaultMessage="Subscription Status"
                  description="Subscription status title on the enterprise dashboard sidebar."
                />
              </h3>
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
                {subscriptionPlan.isCurrent
                  ? intl.formatMessage({
                    id: 'enterprise.dashboard.sidebar.subscription.active.date.prefix',
                    defaultMessage: 'Available until',
                    description: 'Subscription available date prefix on the enterprise dashboard sidebar.',
                  }) : intl.formatMessage({
                    id: 'enterprise.dashboard.sidebar.subscription.expired.date.prefix',
                    defaultMessage: 'Expired on',
                    description: 'Subscription expired date prefix on the enterprise dashboard sidebar.',
                  })}
                {' '}<span className="font-weight-bold">{dayjs(subscriptionPlan.expirationDate).format('MMMM Do, YYYY')}</span>
              </>
            ) : (
              <span>
                <FormattedMessage
                  id="enterprise.dashboard.sidebar.license.requested.notice"
                  defaultMessage="Awaiting approval."
                  description="License request awaiting approval notice on the enterprise dashboard sidebar."
                />
              </span>
            )
          }
        </SidebarCard>
      </>
    );
  }

  return (
    <SidebarCard
      title={(
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <FormattedMessage
              id="enterprise.dashboard.sidebar.subscription.summary.card.title.text2"
              defaultMessage="Subscription Status"
              description="Subscription status summary card title on the enterprise dashboard sidebar."
            />
          </div>
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
            {subscriptionPlan.isCurrent
              ? intl.formatMessage({
                id: 'enterprise.dashboard.sidebar.subscription.active.date.prefix.text',
                defaultMessage: 'Available until',
                description: 'Subscription active date prefix on the enterprise dashboard sidebar.',
              }) : intl.formatMessage({
                id: 'enterprise.dashboard.sidebar.subscription.expired.date.prefix',
                defaultMessage: 'Expired on',
                description: 'Subscription expired date prefix on the enterprise dashboard sidebar.',
              })}
            {' '}<span className="font-weight-bold">{dayjs(subscriptionPlan.expirationDate).format('MMMM Do, YYYY')}</span>
          </>
        ) : (
          <span>
            <FormattedMessage
              id="enterprise.dashboard.sidebar.license.requested.notice"
              defaultMessage="Awaiting approval."
              description="License request awaiting approval notice on the enterprise dashboard sidebar."
            />
          </span>
        )
      }
    </SidebarCard>
  );
};

SubscriptionSummaryCard.propTypes = {
  subscriptionPlan: PropTypes.shape({
    daysUntilExpirationIncludingRenewals: PropTypes.number.isRequired,
    expirationDate: PropTypes.string.isRequired,
    isCurrent: PropTypes.bool.isRequired,
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
