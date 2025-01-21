import {
  ActionRow, AlertModal, StatefulButton, useToggle,
} from '@openedx/paragon';
import DOMPurify from 'dompurify';
import { useState } from 'react';
import { postUnlinkUserFromEnterprise, useEnterpriseCustomer, useSubscriptions } from '../app/data';

const CustomSubscriptionExpirationModal = () => {
  const [buttonState, setButtonState] = useState('default');
  const { data: { customerAgreement, subscriptionLicense, subscriptionPlan } } = useSubscriptions();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  const [isOpen] = useToggle(true);
  const displaySubscriptionExpirationModal = (
    customerAgreement?.hasCustomLicenseExpirationMessagingV2
    && subscriptionLicense && !subscriptionPlan.isCurrent
  );

  if (!displaySubscriptionExpirationModal) {
    return null;
  }

  const onClickHandler = async (e) => {
    e.preventDefault();
    setButtonState('pending');

    await postUnlinkUserFromEnterprise(enterpriseCustomer.uuid);

    // Redirect immediately
    window.location.href = customerAgreement.urlForButtonInModalV2;
    setButtonState('default');
  };
  const props = {
    labels: {
      default: customerAgreement.buttonLabelInModalV2,
    },
    variant: 'primary',
  };
  return (
    <AlertModal
      title={<h3 className="mb-2">{customerAgreement.modalHeaderTextV2}</h3>}
      isOpen={isOpen}
      isBlocking
      footerNode={(
        <ActionRow>
          <StatefulButton
            state={buttonState}
            onClick={onClickHandler}
            {...props}
          />
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

export default CustomSubscriptionExpirationModal;
