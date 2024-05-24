import React, { useContext } from 'react';
import { MailtoLink, Modal } from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import dayjs from '../../utils/dayjs';

import { SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL, SUBSCRIPTION_DAYS_REMAINING_SEVERE } from '../../config/constants';

import { getContactEmail } from '../../utils/common';
import { useEnterpriseCustomer, useSubscriptions } from '../app/data';
import { EXPIRED_SUBSCRIPTION_MODAL_LOCALSTORAGE_KEY, EXPIRING_SUBSCRIPTION_MODAL_LOCALSTORAGE_KEY } from './data';

export const MODAL_DIALOG_CLASS_NAME = 'subscription-expiration';
export const SUBSCRIPTION_EXPIRED_MODAL_TITLE = 'Your subscription has expired';
export const SUBSCRIPTION_EXPIRING_MODAL_TITLE = 'Your subscription is expiring';

const SubscriptionExpirationModal = () => {
  const {
    config,
    authenticatedUser: { username },
  } = useContext(AppContext);

  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  const { data: subscriptions } = useSubscriptions();
  const { subscriptionPlan, subscriptionLicense } = subscriptions;
  const {
    daysUntilExpirationIncludingRenewals,
    expirationDate,
    uuid: subscriptionPlanId,
    isCurrent,
  } = subscriptionPlan;

  const renderTitle = () => {
    if (isCurrent) {
      return (
        <small className="font-weight-bold">{SUBSCRIPTION_EXPIRING_MODAL_TITLE}</small>
      );
    }
    return (
      <small className="font-weight-bold">{SUBSCRIPTION_EXPIRED_MODAL_TITLE}</small>
    );
  };

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
    <a href={`${config.LMS_BASE_URL}/u/${username}`} className="font-weight-bold">
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

  const renderBody = () => (
    <>
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
        Access expires on {dayjs(expirationDate).format('MMMM Do, YYYY')}.
      </i>
    </>
  );

  const renderExpiredBody = () => (
    <>
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
        Access expired on {dayjs(expirationDate).format('MMMM Do, YYYY')}.
      </i>
    </>
  );

  const seenExpiredSubscriptionModal = !!global.localStorage.getItem(
    EXPIRED_SUBSCRIPTION_MODAL_LOCALSTORAGE_KEY(subscriptionLicense),
  );
  // If the subscription has already expired, we show a different un-dismissible modal
  if (!isCurrent) {
    if (seenExpiredSubscriptionModal) {
      return null;
    }
    return (
      <Modal
        dialogClassName={`${MODAL_DIALOG_CLASS_NAME} expired`}
        renderHeaderCloseButton={false}
        title={renderTitle()}
        body={renderExpiredBody()}
        closeText="OK"
        onClose={() => {
          global.localStorage.setItem(EXPIRED_SUBSCRIPTION_MODAL_LOCALSTORAGE_KEY(subscriptionLicense), 'true');
        }}
        open
        data-testid="expired-modal"
      />
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

  return (
    <Modal
      dialogClassName={MODAL_DIALOG_CLASS_NAME}
      renderHeaderCloseButton={false}
      title={renderTitle()}
      body={renderBody()}
      closeText="OK"
      // Mark that the user has seen this range's expiration modal when they close it
      onClose={() => {
        global.localStorage.setItem(expirationModalLocalStorageName, 'true');
      }}
      open
      data-testid="expiration-modal"
    />
  );
};

export default SubscriptionExpirationModal;
