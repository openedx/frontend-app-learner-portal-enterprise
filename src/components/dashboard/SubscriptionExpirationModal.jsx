import React, { useContext } from 'react';
import Cookies from 'universal-cookie';
import { Modal, MailtoLink } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import moment from 'moment';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_EXPIRED,
  SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX,
} from '../../config/constants';

export const MODAL_DIALOG_CLASS_NAME = 'subscription-expiration';

const SubscriptionExpirationModal = () => {
  const {
    subscriptionPlan: {
      daysUntilExpiration,
      expirationDate,
    },
    enterpriseConfig: {
      contactEmail,
    },
  } = useContext(AppContext);

  const renderTitle = () => {
    if (daysUntilExpiration > SUBSCRIPTION_EXPIRED) {
      return (
        <small><b>Your Subscription is Expiring</b></small>
      );
    }
    return (
      <small><b>Your Subscription has Expired</b></small>
    );
  };

  const renderContactText = () => {
    const contactText = 'contact your learning manager';
    if (contactEmail) {
      return (
        <MailtoLink to={contactEmail}><b>{contactText}</b></MailtoLink>
      );
    }
    return contactText;
  };

  const renderCertificateText = () => {
    const { username } = getAuthenticatedUser();
    return (
      <>
        <a href={`${process.env.LMS_BASE_URL}/u/${username}`}>
          <b>download your completed certificates</b>
        </a>
      </>
    );
  };

  const renderBody = () => (
    <>
      <p>
        Your company&#39;s access to your edX learning portal is expiring in
        <b>{` ${daysUntilExpiration} `}</b>
        days. After it expires you will only have audit access to your courses.
      </p>
      <p>
        If you are currently taking courses, plan your learning accordingly. You should also take
        this time to {renderCertificateText()}.
      </p>
      <p>
        If you think this is an error or need help, {renderContactText()}.
      </p>
      <i>
        Access expires on {moment(expirationDate).format('MMMM Do YYYY')}
      </i>
    </>
  );

  const renderExpiredBody = () => (
    <>
      <p>
        You company&#39;s access to your edX learning portal has expired. you will only have audit
        access to the courses you were enrolled in with your subscription (courses from codes will
        still be fully accessible).
      </p>
      <p>
        You can also {renderCertificateText()}.
      </p>
      <p>
        If you think this is an error or need help, {renderContactText()}.
      </p>
      <i>
        Access expired on {moment(expirationDate).format('MMMM Do YYYY')}
      </i>
    </>
  );

  // If the subscription has already expired, we show a different un-dismissible modal
  const subscriptionExpired = daysUntilExpiration <= SUBSCRIPTION_EXPIRED;
  if (subscriptionExpired) {
    return (
      <Modal
        dialogClassName={`${MODAL_DIALOG_CLASS_NAME} expired`}
        renderHeaderCloseButton={false}
        title={renderTitle()}
        body={renderExpiredBody()}
        closeText="OK"
        onClose={() => {}}
        open
      />
    );
  }

  if (daysUntilExpiration > SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
    return null;
  }

  const seenCurrentExpirationModalCookieName = `${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}${SUBSCRIPTION_DAYS_REMAINING_SEVERE}`;
  const cookies = new Cookies();
  const seenCurrentExpirationModal = cookies.get(seenCurrentExpirationModalCookieName);
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
        cookies.set(
          seenCurrentExpirationModalCookieName,
          true,
          // Cookies without the `sameSite` attribute are rejected if they are missing the `secure`
          // attribute. See
          // https//developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
          { sameSite: 'strict' },
        );
      }}
      open
    />
  );
};

export default SubscriptionExpirationModal;
