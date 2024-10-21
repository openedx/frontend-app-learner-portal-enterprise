import {
  useToggle, AlertModal, Button, ActionRow,
} from '@openedx/paragon';
import { useSubscriptions } from '../app/data';

const ExpiredSubscriptionModal = () => {
  const { data: { customerAgreement } } = useSubscriptions();
  const [isOpen] = useToggle(true);
  if (!customerAgreement?.hasCustomLicenseExpirationMessaging) {
    return null;
  }
  const onClickHandler = () => {
    let url = customerAgreement?.urlForButtonInModal;

    if (url) {
      // Check if the URL starts with 'http://' or 'https://'
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Prepend 'https://' if the URL is missing the protocol
        url = `https://${url}`;
      }

      // Navigate to the full URL
      window.open(url, '_blank'); // Opening in a new tab
    }
  };
  return (
    <AlertModal
      title={customerAgreement?.modalHeaderText}
      isOpen={isOpen}
      isBlocking
      footerNode={(
        <ActionRow>
          <Button
            onClick={onClickHandler}
          >
            {customerAgreement?.buttonLabelInModal}
          </Button>
        </ActionRow>
      )}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: customerAgreement?.expiredSubscriptionModalMessaging }} />
    </AlertModal>
  );
};

export default ExpiredSubscriptionModal;
