import PropTypes from 'prop-types';
import {
  ActionRow, Button, MailtoLink, StandardModal,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { SUBSCRIPTION_EXPIRING_MODAL_TITLE } from './data/constants';
import { useEnterpriseCustomer, useSubscriptions } from '../app/data';
import { i18nFormatTimestamp } from '../../utils/common';

// TODO: Internationalization of this component
const SubscriptionExpirationWarningModal = ({
  isSubscriptionExpiringWarningModalOpen,
  onSubscriptionExpiringWarningModalClose,
}) => {
  const intl = useIntl();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: { subscriptionPlan } } = useSubscriptions();
  const renderTitle = () => (
    <h3>{SUBSCRIPTION_EXPIRING_MODAL_TITLE}</h3>
  );
  const renderContactText = () => {
    const contactText = 'contact your learning manager';
    if (enterpriseCustomer.contactEmail) {
      return (
        <MailtoLink to={enterpriseCustomer.contactEmail} className="font-weight-bold">{contactText}</MailtoLink>
      );
    }
    return contactText;
  };

  const renderExpiredBody = () => (
    <>
      <p>
        You edX subscription access through [{enterpriseCustomer.name}] will expire before you are projected to
        complete all of the courses in the program (based off of course end dates). If you are not able to complete
        all of the courses in the program before your access expires, you will not be eligible to view or share your
        program record.
      </p>
      <p>
        If you plan to complete the program, please {renderContactText()} to ensure your subscription access is renewed.
      </p>
      <i>
        Access expires: {i18nFormatTimestamp({ intl, timestamp: subscriptionPlan.expirationDate })}.
      </i>
    </>
  );

  return (
    <StandardModal
      title={renderTitle()}
      isOpen={isSubscriptionExpiringWarningModalOpen}
      hasCloseButton={false}
      isOverflowVisible={false}
      onClose={onSubscriptionExpiringWarningModalClose}
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
