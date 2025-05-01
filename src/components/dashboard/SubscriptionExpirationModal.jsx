import { useContext } from 'react';
import {
  ActionRow, AlertModal, Button, MailtoLink, useToggle,
} from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { useIntl } from '@edx/frontend-platform/i18n';
import dayjs from '../../utils/dayjs';

import { SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL, SUBSCRIPTION_DAYS_REMAINING_SEVERE } from '../../config/constants';

import { getContactEmail, i18nFormatTimestamp } from '../../utils/common';
import { useEnterpriseCustomer, useSubscriptions } from '../app/data';
import { EXPIRED_SUBSCRIPTION_MODAL_LOCALSTORAGE_KEY, EXPIRING_SUBSCRIPTION_MODAL_LOCALSTORAGE_KEY } from './data';

export const MODAL_DIALOG_CLASS_NAME = 'subscription-expiration';
export const SUBSCRIPTION_EXPIRED_MODAL_TITLE = 'Your subscription has expired';
export const SUBSCRIPTION_EXPIRING_MODAL_TITLE = 'Your subscription is expiring';

// TODO: Still requires internationalization refactor
const SubscriptionExpirationModal = () => {
  const {
    config,
    authenticatedUser: { username },
  } = useContext(AppContext);

  const intl = useIntl();
  const { data: subscriptions } = useSubscriptions();
  const { subscriptionPlan, subscriptionLicense } = subscriptions;
  const seenExpiredSubscriptionModal = !!global.localStorage.getItem(
    EXPIRED_SUBSCRIPTION_MODAL_LOCALSTORAGE_KEY(subscriptionLicense),
  );
  const [isOpen, , close] = useToggle(!seenExpiredSubscriptionModal);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const {
    daysUntilExpirationIncludingRenewals,
    expirationDate,
    uuid: subscriptionPlanId,
    isCurrent,
  } = subscriptionPlan;

  const renderContactText = () => {
    const contactText = 'contact your learning manager';
    const email = getContactEmail(enterpriseCustomer);
    if (email) {
      return (
        <MailtoLink to={email} className="font-weight-bold">
          {contactText}
        </MailtoLink>
      );
    }
    return contactText;
  };

  const renderCertificateText = () => (
    <a href={`${config.ACCOUNT_PROFILE_URL}/u/${username}`} className="font-weight-bold">
      download your completed certificates
    </a>
  );

  const timeUntilExpiration = () => {
    const expiryDate = dayjs(expirationDate);
    const hoursTillExpiration = expiryDate.diff(dayjs(), 'hour');
    const minutesTillExpiration = expiryDate.diff(dayjs(), 'minute');
    const pluralText = (textToPlural, pluralBenchmark) => (pluralBenchmark > 1 ? `${textToPlural}s.` : `${textToPlural}.`);
    if (hoursTillExpiration >= 24) {
      return (
        <span>
          <span className="font-weight-bold">{` ${daysUntilExpirationIncludingRenewals} `}</span>
          {pluralText('day', daysUntilExpirationIncludingRenewals)}
        </span>
      );
    }
    if (hoursTillExpiration > 0) {
      return (
        <span>
          <span className="font-weight-bold">{` ${hoursTillExpiration} `}</span>
          {pluralText('hour', hoursTillExpiration)}
        </span>
      );
    }
    return (
      <span>
        <span className="font-weight-bold">{` ${minutesTillExpiration} `}</span>
        {pluralText('minute', minutesTillExpiration)}
      </span>
    );
  };

  const handleSubscriptionExpiredModalDismissal = () => {
    close();
    global.localStorage.setItem(EXPIRED_SUBSCRIPTION_MODAL_LOCALSTORAGE_KEY(subscriptionLicense), 'true');
  };
  // If the subscription has already expired, we show a different un-dismissible modal
  if (!isCurrent) {
    if (seenExpiredSubscriptionModal) {
      return null;
    }
    return (
      <AlertModal
        title={SUBSCRIPTION_EXPIRED_MODAL_TITLE}
        className={`${MODAL_DIALOG_CLASS_NAME} expired`}
        isOpen={isOpen}
        data-testid="expired-modal"
        footerNode={(
          <ActionRow>
            <Button variant="primary" onClick={handleSubscriptionExpiredModalDismissal} data-testid="subscription-expiration-button">OK</Button>
          </ActionRow>
        )}
        onClose={handleSubscriptionExpiredModalDismissal}
        isOverflowVisible={false}
        hasCloseButton
      >
        <p>
          Your organization&#39;s access to your subscription has expired. You will only have audit
          access to the courses you were enrolled in with your subscription (courses from vouchers
          will still be fully accessible).
        </p>
        <p>
          You can also {renderCertificateText()}.
        </p>
        <p>
          If you think this is an error or need help, {renderContactText()}.
        </p>
        <i>
          Access expired on {dayjs(expirationDate).format('MMM D, YYYY')}.
        </i>
      </AlertModal>
    );
  }

  if (daysUntilExpirationIncludingRenewals > SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
    return null;
  }

  const subscriptionExpirationThresholds = [
    SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
    SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  ];

  const subscriptionExpirationThreshold = subscriptionExpirationThresholds.find(
    threshold => threshold >= daysUntilExpirationIncludingRenewals,
  );

  const expirationModalLocalStorageName = EXPIRING_SUBSCRIPTION_MODAL_LOCALSTORAGE_KEY({
    threshold: subscriptionExpirationThreshold,
    uuid: subscriptionPlanId,
  });
  const seenCurrentExpirationModal = !!global.localStorage.getItem(expirationModalLocalStorageName);
  // If they have already seen the expiration modal for their current expiration range (as
  // determined by the cookie), don't show them anything
  if (seenCurrentExpirationModal) {
    return null;
  }

  const handleSubscriptionExpiringModalDismissal = () => {
    close();
    global.localStorage.setItem(expirationModalLocalStorageName, 'true');
  };

  return (
    <AlertModal
      title={SUBSCRIPTION_EXPIRING_MODAL_TITLE}
      className={MODAL_DIALOG_CLASS_NAME}
      // Mark that the user has seen this range's expiration modal when they close it
      isOpen={isOpen}
      data-testid="expiration-modal"
      footerNode={(
        <ActionRow>
          <Button variant="primary" onClick={handleSubscriptionExpiringModalDismissal} data-testid="subscription-expiration-button">OK</Button>
        </ActionRow>
      )}
      onClose={handleSubscriptionExpiringModalDismissal}
      isOverflowVisible={false}
      hasCloseButton
    >
      <p>
        Your organization&#39;s access to your current subscription is expiring in
        {timeUntilExpiration()} After it expires you will only have audit access to your courses.
      </p>
      <p>
        If you are currently taking courses, plan your learning accordingly. You should also take
        this time to {renderCertificateText()}.
      </p>
      <p>
        If you think this is an error or need help, {renderContactText()}.
      </p>
      <i>
        Access expires on {i18nFormatTimestamp({ intl, timestamp: expirationDate })}.
      </i>
    </AlertModal>
  );
};

export default SubscriptionExpirationModal;
