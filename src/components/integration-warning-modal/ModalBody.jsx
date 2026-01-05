import { FormattedMessage } from '@edx/frontend-platform/i18n';

const ModalBody = () => (
  <div>
    <p className="m-0">
      <FormattedMessage
        id="learner.portal.integration.warning.modal.message"
        defaultMessage="You are viewing only the edX courses that your organization has made available to you. There may be other learning resources from different sources available in your learning management system."
        description="Warning message about limited course visibility in integration context"
      />
    </p>
  </div>
);

export default ModalBody;
