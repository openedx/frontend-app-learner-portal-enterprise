import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import React from 'react';
import { Card, useToggle } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import { useBrowseAndRequest, useSubscriptions } from '../../../../app/data';
import {
  LICENSE_REQUESTED_BADGE_VARIANT,
  SUBSCRIPTION_ACTIVE_BADGE_VARIANT,
  SUBSCRIPTION_EXPIRED_BADGE_VARIANT,
  SUBSCRIPTION_WARNING_BADGE_VARIANT,
} from '../constants';
import { SUBSCRIPTION_DAYS_REMAINING_SEVERE } from '../../../../../config/constants';
import { il8nFormatTimestamp } from '../../../../../utils/common';
import SubscriptionExpirationWarningModal from '../../../../program-progress/SubscriptionExpiringWarningModal';

const getBadgeVariantAndLabel = ({
  intl, subscriptions, messages, programProgressPage, licenseRequest,
}) => {
  if (subscriptions?.subscriptionPlan) {
    const { subscriptionPlan, showExpirationNotifications } = subscriptions;
    if (!subscriptionPlan.isCurrent) {
      // Subscription has expired program progress page agnostic
      return ({
        variant: SUBSCRIPTION_EXPIRED_BADGE_VARIANT,
        label: intl.formatMessage(messages.expiredBadge),
      });
    }

    if (showExpirationNotifications
          && subscriptionPlan.daysUntilExpirationIncludingRenewals <= SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
      if (programProgressPage) {
        // Expiration is approaching program progress page
        return ({
          variant: SUBSCRIPTION_WARNING_BADGE_VARIANT,
          label: intl.formatMessage(messages.expiringSoonBadge),
        });
      }
      // Expiration is approaching non program progress page
      return ({
        variant: SUBSCRIPTION_WARNING_BADGE_VARIANT,
        label: intl.formatMessage(messages.expiringBadge),
      });
    }

    // Return active badge variant program progress page agnostic
    return ({
      variant: SUBSCRIPTION_ACTIVE_BADGE_VARIANT,
      label: intl.formatMessage(messages.activeBadge),
    });
  }

  if (licenseRequest) {
    return ({
      variant: LICENSE_REQUESTED_BADGE_VARIANT,
      label: intl.formatMessage(messages.licenseRequestBadge),
    });
  }

  return null;
};

const getSubscriptionExpirationDate = ({ intl, subscriptions, messages }) => {
  if (!subscriptions?.subscriptionPlan) {
    return (
      <Card.Section>
        <span>
          <FormattedMessage
            id="enterprise.dashboard.sidebar.license.requested.notice"
            defaultMessage="Awaiting approval."
            description="License request awaiting approval notice on the enterprise dashboard sidebar."
          />
        </span>
      </Card.Section>
    );
  }
  const { subscriptionPlan, showExpirationNotifications } = subscriptions;
  if (!showExpirationNotifications) {
    return null;
  }

  const formattedDate = il8nFormatTimestamp({
    intl,
    timestamp: subscriptionPlan.expirationDate,
  });

  return (
    <Card.Section>
      <p className="mb-0" data-testid="subscription-summary-end-date-text">
        {subscriptionPlan.isCurrent
          ? intl.formatMessage(messages.subsidyAvailableUntilDate, {
            subsidyExpiryDate: (
              <b>{formattedDate}</b>
            ),
          })
          : intl.formatMessage(messages.subsidyExpiredOnDate, {
            subsidyExpiryDate: (
              <b>{formattedDate}</b>
            ),
          })}
      </p>
    </Card.Section>
  );
};

const getProgramProgressSubscriptionExpirationWarningModal = ({
  subscriptions,
  isSubscriptionExpiringWarningModalOpen,
  subscriptionExpiringWarningModalOpen,
  onSubscriptionExpiringWarningModalClose,
  courseEndDate,
}) => {
  const { subscriptionPlan, showExpirationNotifications } = subscriptions;
  if (!showExpirationNotifications && !(courseEndDate > subscriptionPlan?.expirationDate)) {
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
};

export default function useSubscriptionSummaryCard({ messages, programProgressPage, courseEndDate }) {
  const [
    isSubscriptionExpiringWarningModalOpen,
    subscriptionExpiringWarningModalOpen,
    onSubscriptionExpiringWarningModalClose,
  ] = useToggle(false);
  const { data: subscriptions } = useSubscriptions();
  const { data: { requests } } = useBrowseAndRequest();
  const licenseRequest = requests.subscriptionLicenses[0];
  const intl = useIntl();

  if (!subscriptions.showExpirationNotifications && !subscriptions?.subscriptionPlan?.isCurrent) {
    return {
      badgeVariantAndLabel: null,
      subscriptionExpirationDate: null,
      programProgressSubscriptionExpirationWarningModal: null,
      showSubscriptionSummaryCard: false,
    };
  }

  const badgeVariantAndLabel = getBadgeVariantAndLabel({
    intl,
    subscriptions,
    messages,
    licenseRequest,
    programProgressPage,
  });
  const subscriptionExpirationDate = getSubscriptionExpirationDate({
    intl,
    subscriptions,
    messages,
  });

  const programProgressSubscriptionExpirationWarningModal = getProgramProgressSubscriptionExpirationWarningModal({
    subscriptions,
    isSubscriptionExpiringWarningModalOpen,
    subscriptionExpiringWarningModalOpen,
    onSubscriptionExpiringWarningModalClose,
    courseEndDate,
  });

  return {
    badgeVariantAndLabel,
    subscriptionExpirationDate,
    programProgressSubscriptionExpirationWarningModal,
    showSubscriptionSummaryCard: true,
  };
}
