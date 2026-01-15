import { useContext } from 'react';
import {
  ActionRow, AlertModal, Button, MailtoLink, useToggle,
} from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { defineMessages, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import dayjs from '../../utils/dayjs';

import { SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL, SUBSCRIPTION_DAYS_REMAINING_SEVERE } from '../../config/constants';

import { getContactEmail, i18nFormatTimestamp } from '../../utils/common';
import { useEnterpriseCustomer, useSubscriptions } from '../app/data';
import { EXPIRED_SUBSCRIPTION_MODAL_LOCALSTORAGE_KEY, EXPIRING_SUBSCRIPTION_MODAL_LOCALSTORAGE_KEY } from './data';

export const MODAL_DIALOG_CLASS_NAME = 'subscription-expiration';

const messages = defineMessages({
  expiredBodyText1: {
    id: 'learner.portal.subscription.expired.modal.body.text1',
    defaultMessage: "Your organization's access to your subscription has expired. You will only have audit access to the courses you were enrolled in with your subscription (courses from vouchers will still be fully accessible).",
    description: 'Main notification text in the expired modal',
  },
  expiredBodyText2: {
    id: 'learner.portal.subscription.expired.modal.body.text2',
    defaultMessage: 'You can also <link>download your completed certificates</link>.',
    description: 'Text about downloading certificates in the expired modal',
  },
  expiredBodyText3: {
    id: 'learner.portal.subscription.expired.modal.body.text3',
    defaultMessage: 'If you think this is an error or need help, {contactLink}.',
    description: 'Contact info text in the expired modal',
  },
  expiredTitle: {
    id: 'learner.portal.subscription.expired.modal.title',
    defaultMessage: 'Your subscription has expired',
    description: 'Title for the subscription expired modal',
  },
  okButton: {
    id: 'learner.portal.subscription.expiration.modal.ok.button',
    defaultMessage: 'OK',
    description: 'Text for the OK button',
  },
  contactManager: {
    id: 'learner.portal.subscription.expiration.modal.contact.manager',
    defaultMessage: 'contact your learning manager',
    description: 'Text for the contact manager link',
  },
  expiringBodyText1: {
    id: 'learner.portal.subscription.expiring.modal.body.text1',
    defaultMessage: "Your organization's access to your current subscription is expiring in {timeRemaining} After it expires you will only have audit access to your courses.",
    description: 'Main notification text in the expiring modal',
  },
  expiringBodyText2: {
    id: 'learner.portal.subscription.expiring.modal.body.text2',
    defaultMessage: 'If you are currently taking courses, plan your learning accordingly. You should also take this time to <link>download your completed certificates</link>.',
    description: 'Text about planning learning in the expiring modal',
  },
  expiringBodyText3: {
    id: 'learner.portal.subscription.expiring.modal.body.text3',
    defaultMessage: 'If you think this is an error or need help, {contactLink}.',
    description: 'Contact info text in the expiring modal',
  },
  expiringDate: {
    id: 'learner.portal.subscription.expiring.modal.date',
    defaultMessage: 'Access expires on {date}.',
    description: 'Text showing when the subscription expires',
  },
  expiringTitle: {
    id: 'learner.portal.subscription.expiring.modal.title',
    defaultMessage: 'Your subscription is expiring',
    description: 'Title for the subscription expiring modal',
  },
  expiredDate: {
    id: 'learner.portal.subscription.expired.modal.date',
    defaultMessage: 'Access expired on {date}.',
    description: 'Text showing when the subscription expired',
  },
});

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
    const contactText = intl.formatMessage(messages.contactManager);
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

  const certificateLink = (chunks) => (
    <a href={`${config.ACCOUNT_PROFILE_URL}/u/${username}`} className="font-weight-bold">
      {chunks}
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
        title={intl.formatMessage(messages.expiredTitle)}
        className={`${MODAL_DIALOG_CLASS_NAME} expired`}
        isOpen={isOpen}
        data-testid="expired-modal"
        footerNode={(
          <ActionRow>
            <Button variant="primary" onClick={handleSubscriptionExpiredModalDismissal} data-testid="subscription-expiration-button">
              {intl.formatMessage(messages.okButton)}
            </Button>
          </ActionRow>
        )}
        onClose={handleSubscriptionExpiredModalDismissal}
        isOverflowVisible={false}
        hasCloseButton
      >
        <p>
          <FormattedMessage {...messages.expiredBodyText1} />
        </p>
        <p>
          <FormattedMessage
            {...messages.expiredBodyText2}
            values={{ link: certificateLink }}
          />
        </p>
        <p>
          <FormattedMessage
            {...messages.expiredBodyText3}
            values={{ contactLink: renderContactText() }}
          />
        </p>
        <i>
          <FormattedMessage
            {...messages.expiredDate}
            values={{
              date: dayjs(expirationDate).format('MMM D, YYYY'),
            }}
          />
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
      title={intl.formatMessage(messages.expiringTitle)}
      className={MODAL_DIALOG_CLASS_NAME}
      // Mark that the user has seen this range's expiration modal when they close it
      isOpen={isOpen}
      data-testid="expiration-modal"
      footerNode={(
        <ActionRow>
          <Button variant="primary" onClick={handleSubscriptionExpiringModalDismissal} data-testid="subscription-expiration-button">
            {intl.formatMessage(messages.okButton)}
          </Button>
        </ActionRow>
      )}
      onClose={handleSubscriptionExpiringModalDismissal}
      isOverflowVisible={false}
      hasCloseButton
    >
      <p>
        <FormattedMessage
          {...messages.expiringBodyText1}
          values={{ timeRemaining: timeUntilExpiration() }}
        />
      </p>
      <p>
        <FormattedMessage
          {...messages.expiringBodyText2}
          values={{ link: certificateLink }}
        />
      </p>
      <p>
        <FormattedMessage
          {...messages.expiringBodyText3}
          values={{ contactLink: renderContactText() }}
        />
      </p>
      <i>
        <FormattedMessage
          {...messages.expiringDate}
          values={{
            date: i18nFormatTimestamp({ intl, timestamp: expirationDate }),
          }}
        />
      </i>
    </AlertModal>
  );
};

export default SubscriptionExpirationModal;
