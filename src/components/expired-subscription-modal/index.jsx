import {
  useToggle, AlertModal, Button, ActionRow,
} from '@openedx/paragon';
import DOMPurify from 'dompurify';
import { useSubscriptions } from '../app/data';

const ExpiredSubscriptionModal = () => {
  const { data: { customerAgreement, subscriptionLicense, subscriptionPlan } } = useSubscriptions();
  const [isOpen] = useToggle(true);
  const displaySubscriptionExpirationModal = (
    customerAgreement?.hasCustomLicenseExpirationMessagingV2
    && subscriptionLicense && !subscriptionPlan.isCurrent
  );

  if (!displaySubscriptionExpirationModal) {
    return null;
  }

  return (
    <AlertModal
      title={<h3 className="mb-2">{customerAgreement.modalHeaderTextV2}</h3>}
      isOpen={isOpen}
      isBlocking
      footerNode={(
        <ActionRow>
          <Button href={customerAgreement.urlForButtonInModalV2}>
            {customerAgreement.buttonLabelInModalV2}
          </Button>
        </ActionRow>
      )}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(
          customerAgreement.expiredSubscriptionModalMessagingV2,
          { USE_PROFILES: { html: true } },
        ),
      }}
      />
    </AlertModal>
  );
};

export default ExpiredSubscriptionModal;
