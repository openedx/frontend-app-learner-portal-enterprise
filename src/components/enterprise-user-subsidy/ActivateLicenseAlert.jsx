import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Alert, Button, Container } from '@edx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { UserSubsidyContext } from './UserSubsidy';

/**
 * An alert to inform the learner they have an assigned license
 * that is not yet activated.
 */
const ActivateLicenseAlert = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionLicense } = useContext(UserSubsidyContext);
  if (!subscriptionLicense?.activationKey || ['activated', 'revoked'].includes(subscriptionLicense?.status)) {
    return null;
  }

  const activationLink = `/${enterpriseConfig.slug}/licenses/${subscriptionLicense.activationKey}/activate`;

  return (
    <Container size="lg" className="mt-3">
      <Alert
        variant="warning"
        actions={[
          <Button
            as={Link}
            to={activationLink}
            onClick={() => sendEnterpriseTrackEvent(
              enterpriseConfig.uuid,
              'edx.ui.enterprise.learner_portal.license_activation_alert.activate_btn.clicked',
            )}
          >
            Activate now
          </Button>,
        ]}
      >
        Your subscription license is not activated. To enroll in courses without
        payment, you must activate your license.
      </Alert>
    </Container>
  );
};

export default ActivateLicenseAlert;
