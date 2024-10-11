import {
  StandardModal, useToggle,
} from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { useSubscriptions } from '../app/data';

const ExpiredSubscriptionModal = () => {
  const { data: { customerAgreement } } = useSubscriptions();
  const [isOpen, ,close] = useToggle(true);
  if (!customerAgreement?.hasCustomLicenseExpirationMessaging) {
    return null;
  }
  return (
    <StandardModal
      isOpen={isOpen}
      className="d-flex justify-content-center align-items-center text-wrap text-right "
      hasCloseButton
      onClose={close}
    >
      <p className="text-center">
        {customerAgreement?.expiredSubscriptionModalMessaging}
        <Link className="text-decoration-none" to={customerAgreement?.urlForExpiredModal}> {customerAgreement?.hyperLinkTextForExpiredModal}</Link>
      </p>
    </StandardModal>
  );
};

export default ExpiredSubscriptionModal;
