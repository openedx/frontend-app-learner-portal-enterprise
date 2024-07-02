import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Badge, useToggle } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import CardHeader from '@openedx/paragon/src/Card/CardHeader';
import CardSection from '@openedx/paragon/src/Card/CardSection';
import { SUBSCRIPTION_DAYS_REMAINING_SEVERE } from '../../../config/constants';
import SubscriptionExpirationWarningModal from '../../program-progress/SubscriptionExpiringWarningModal';
import dayjs from '../../../utils/dayjs';
import {
  LICENSE_REQUESTED_BADGE_VARIANT,
  SUBSCRIPTION_ACTIVE_BADGE_VARIANT,
  SUBSCRIPTION_EXPIRED_BADGE_VARIANT,
  SUBSCRIPTION_WARNING_BADGE_VARIANT,
} from './data/constants';

const SubscriptionSummaryCard = ({
  subscriptionPlan, showExpirationNotifications, licenseRequest, courseEndDate, programProgressPage,
}) => {
  const [
    isSubscriptionExpiringWarningModalOpen,
    subscriptionExpiringWarningModalOpen,
    onSubscriptionExpiringWarningModalClose,
  ] = useToggle(false);
  const intl = useIntl();
  const badgeVariantAndLabel = useMemo(() => {
    if (subscriptionPlan) {
      if (!subscriptionPlan?.isCurrent) {
        // Subscription has expired program progress page agnostic
        return ({
          variant: SUBSCRIPTION_EXPIRED_BADGE_VARIANT,
          label: intl.formatMessage({
            id: 'enterprise.dashboard.sidebar.subscription.expired.badge.label',
            defaultMessage: 'Expired',
            description: 'Subscription expired badge label on the enterprise dashboard sidebar.',
          }),
        });
      }

      if (showExpirationNotifications
        && subscriptionPlan.daysUntilExpirationIncludingRenewals <= SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
        if (programProgressPage) {
          // Expiration is approaching program progress page
          return ({
            variant: SUBSCRIPTION_WARNING_BADGE_VARIANT,
            label: intl.formatMessage({
              id: 'enterprise.dashboard.sidebar.subscription.expiring.soon.badge.label',
              defaultMessage: 'Expiring Soon',
              description: 'Subscription expiring soon badge label on the enterprise dashboard sidebar.',
            }),
          });
        }
        // Expiration is approaching non program progress page
        return ({
          variant: SUBSCRIPTION_WARNING_BADGE_VARIANT,
          label: intl.formatMessage({
            id: 'enterprise.dashboard.sidebar.subscription.warning.badge.label',
            defaultMessage: 'Expiring',
            description: 'Subscription expiring warning badge label on the enterprise dashboard sidebar.',
          }),
        });
      }

      // Return active badge variant program progress page agnostic
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
  }, [subscriptionPlan, licenseRequest, showExpirationNotifications, intl, programProgressPage]);

  const subscriptionExpirationDate = useMemo(() => {
    if (!showExpirationNotifications) {
      return null;
    }
    if (!subscriptionPlan) {
      return (
        <CardSection>
          <span>
            <FormattedMessage
              id="enterprise.dashboard.sidebar.license.requested.notice"
              defaultMessage="Awaiting approval."
              description="License request awaiting approval notice on the enterprise dashboard sidebar."
            />
          </span>
        </CardSection>

      );
    }
    const subscriptionDate = dayjs(subscriptionPlan.expirationDate).format('MMMM Do, YYYY');
    let subscriptionDateLabel;
    if (subscriptionPlan.isCurrent) {
      subscriptionDateLabel = intl.formatMessage({
        id: 'enterprise.dashboard.sidebar.subscription.active.date.prefix.text',
        defaultMessage: 'Available until',
        description: 'Subscription active date prefix on the enterprise dashboard sidebar.',
      });
    } else {
      subscriptionDateLabel = intl.formatMessage({
        id: 'enterprise.dashboard.sidebar.subscription.expired.date.prefix',
        defaultMessage: 'Expired on',
        description: 'Subscription expired date prefix on the enterprise dashboard sidebar.',
      });
    }
    return (
      <CardSection>
        {subscriptionDateLabel}
        {' '}
        <span
          className="font-weight-bold"
        >
          {subscriptionDate}
        </span>
      </CardSection>
    );
  }, [intl, showExpirationNotifications, subscriptionPlan]);

  const programProgressSubscriptionExpirationWarningModal = useMemo(() => {
    if (!showExpirationNotifications && courseEndDate > subscriptionPlan.expirationDate) {
      return null;
    }
    return (
      <>
        <SubscriptionExpirationWarningModal
          isSubscriptionExpiringWarningModalOpen={isSubscriptionExpiringWarningModalOpen}
          onSubscriptionExpiringWarningModalClose={onSubscriptionExpiringWarningModalClose}
        />
        <WarningFilled data-testid="warning-icon" className="ml-2" onClick={() => { subscriptionExpiringWarningModalOpen(); }} />
      </>
    );
  }, [
    courseEndDate,
    isSubscriptionExpiringWarningModalOpen,
    onSubscriptionExpiringWarningModalClose,
    showExpirationNotifications,
    subscriptionExpiringWarningModalOpen,
    subscriptionPlan.expirationDate,
  ]);

  // Don't render the card summary if there is no subscription plan or license request or
  // if the disable expiration notifications on the customer agreement is enabled and
  // the applicable subscription plan is expired.
  if (!(subscriptionPlan || licenseRequest) || !(showExpirationNotifications || subscriptionPlan.isCurrent)) {
    return null;
  }

  if (programProgressPage) {
    return (
      <>
        <CardHeader
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
                {programProgressSubscriptionExpirationWarningModal}
              </div>
            </div>
          )}
        />
        {subscriptionExpirationDate}
      </>
    );
  }

  return (
    <>
      <CardHeader
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
      />
      {subscriptionExpirationDate}
    </>
  );
};

SubscriptionSummaryCard.propTypes = {
  subscriptionPlan: PropTypes.shape({
    daysUntilExpirationIncludingRenewals: PropTypes.number.isRequired,
    expirationDate: PropTypes.string.isRequired,
    isCurrent: PropTypes.bool.isRequired,
  }),
  showExpirationNotifications: PropTypes.bool,
  licenseRequest: PropTypes.shape({}),
  courseEndDate: PropTypes.string,
  programProgressPage: PropTypes.bool,
};

SubscriptionSummaryCard.defaultProps = {
  programProgressPage: false,
  courseEndDate: undefined,
  subscriptionPlan: undefined,
  showExpirationNotifications: true,
  licenseRequest: undefined,
};

export default SubscriptionSummaryCard;
