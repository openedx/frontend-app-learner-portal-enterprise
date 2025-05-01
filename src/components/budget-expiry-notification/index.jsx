import { useMemo } from 'react';
import {
  ActionRow,
  Alert, AlertModal,
  Button, MailtoLink,
  useToggle,
} from '@openedx/paragon';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import dayjs from 'dayjs';
import useExpiry from './data/hooks/useExpiry';
import { useEnterpriseCustomer, useHasAvailableSubsidiesOrRequests } from '../app/data';
import { EVENT_NAMES } from './data/constants';
import { getContactEmail } from '../../utils/common';

const BudgetExpiryNotification = () => {
  const [modalIsOpen, modalOpen, modalClose] = useToggle(false);
  const [alertIsOpen, alertOpen, alertClose] = useToggle(false);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { learnerCreditSummaryCardData } = useHasAvailableSubsidiesOrRequests();
  const budget = useMemo(() => ({
    end: learnerCreditSummaryCardData?.expirationDate,
    isNonExpiredBudget: dayjs(learnerCreditSummaryCardData?.expirationDate).isAfter(dayjs()),
  }), [learnerCreditSummaryCardData]);

  const {
    alert, modal, dismissModal, dismissAlert,
  } = useExpiry(
    enterpriseCustomer.uuid,
    budget,
    modalOpen,
    modalClose,
    alertOpen,
    alertClose,
  );

  const trackEventMetadata = useMemo(() => {
    if (modal === null && alert === null) { return {}; }
    return {
      modal,
      alert,
    };
  }, [modal, alert]);

  const contactEmail = getContactEmail(enterpriseCustomer);

  const AlertMessage = alert?.message;
  const ModalMessage = modal?.message;

  const alertActions = (!contactEmail) ? []
    : [
      <Button
        as={MailtoLink}
        to={contactEmail}
        onClick={() => sendEnterpriseTrackEvent(
          enterpriseCustomer.uuid,
          EVENT_NAMES.clickedToContactSupportAlert,
          trackEventMetadata,
        )}
        className="flex-shrink-0"
        data-testid="contact-administrator"
      >
        Contact administrator
      </Button>,
    ];

  return (
    <>
      {alert && (
        <Alert
          variant={alert.variant}
          show={alertIsOpen}
          actions={alertActions}
          dismissible={alert.dismissible}
          onClose={dismissAlert}
          data-testid="expiry-notification-alert"
          className="mb-4.5"
        >
          <Alert.Heading>
            {alert.title}
          </Alert.Heading>
          <AlertMessage />
        </Alert>
      )}

      {modal && (
        <AlertModal
          title={modal.title}
          size="md"
          isOpen={modalIsOpen}
          onClose={dismissModal}
          isOverflowVisible={false}
          footerNode={(
            <ActionRow>
              <Button variant="primary" onClick={dismissModal}>OK</Button>
            </ActionRow>
          )}
          isOverflowVisible={false}
        >
          <ModalMessage contactEmail={contactEmail} />
        </AlertModal>
      )}
    </>
  );
};

export default BudgetExpiryNotification;
