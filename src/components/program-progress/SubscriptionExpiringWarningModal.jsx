import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button, MailtoLink, StandardModal,
} from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import dayjs from '../../utils/dayjs';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { SUBSCRIPTION_EXPIRING_MODAL_TITLE } from './data/constants';

const SubscriptionExpirationWarningModal = ({
  isSubscriptionExpiringWarningModalOpen,
  onSubscriptionExpiringWarningModalClose,
}) => {
  const {
    enterpriseConfig: { name, contactEmail },
  } = useContext(AppContext);

  const { subscriptionPlan: { expirationDate } } = useContext(UserSubsidyContext);
  if (isSubscriptionExpiringWarningModalOpen === false) { return null; }
  const renderTitle = () => (
    <h3>{SUBSCRIPTION_EXPIRING_MODAL_TITLE}</h3>
  );
  const renderContactText = () => {
    const contactText = 'contact your learning manager';
    if (contactEmail) {
      return (
        <MailtoLink to={contactEmail} className="font-weight-bold">{contactText}</MailtoLink>
      );
    }
    return contactText;
  };

  const renderExpiredBody = () => (
    <>
      <p>
        You edX subscription access through [{name}] will expire before you are projected to complete all of the
        courses in the program (based off of course end dates). If you are not able to complete all of the courses in
        the program before your access expires, you will not be eligible to view or share your program record.
      </p>
      <p>
        If you plan to complete the program, please {renderContactText()} to ensure your subscription access is renewed.
      </p>
      <i>
        Access expires: {dayjs(expirationDate).format('MMMM Do, YYYY')}.
      </i>
    </>
  );

  return (
    <StandardModal
      title={renderTitle()}
      isOpen={isSubscriptionExpiringWarningModalOpen}
      onClose={onSubscriptionExpiringWarningModalClose}
      hasCloseButton={false}
      footerNode={(
        <ActionRow>
          <Button onClick={onSubscriptionExpiringWarningModalClose}>OK</Button>
        </ActionRow>
      )}
    >
      {renderExpiredBody()}
    </StandardModal>
  );
};
SubscriptionExpirationWarningModal.propTypes = {
  isSubscriptionExpiringWarningModalOpen: PropTypes.bool.isRequired,
  onSubscriptionExpiringWarningModalClose: PropTypes.func.isRequired,
};
export default SubscriptionExpirationWarningModal;
