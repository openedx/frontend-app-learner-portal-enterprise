import {
  useToggle, AlertModal, Button, ActionRow,
} from '@openedx/paragon';
import DOMPurify from 'dompurify';
import { useSubscriptions } from '../app/data';

const ExpiredSubscriptionModal = () => {
  const { data: { customerAgreement, subscriptionLicense } } = useSubscriptions();
  const [isOpen] = useToggle(true);
  const displaySubscriptionExpirationModal = customerAgreement?.hasCustomLicenseExpirationMessaging
      && !subscriptionLicense?.subscriptionPlan.isCurrent;
  if (!displaySubscriptionExpirationModal) {
    return null;
  }
  return (
    <AlertModal
      title={<h3 className="mb-2">{customerAgreement.modalHeaderText}</h3>}
      isOpen={isOpen}
      isBlocking
      footerNode={(
        <ActionRow>
          <Button href={customerAgreement.urlForButtonInModal}>
            {customerAgreement.buttonLabelInModal}
          </Button>
        </ActionRow>
      )}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(
          customerAgreement.expiredSubscriptionModalMessaging,
          { USE_PROFILES: { html: true } },
        ),
      }}
      />
    </AlertModal>
  );
};

export default ExpiredSubscriptionModal;
