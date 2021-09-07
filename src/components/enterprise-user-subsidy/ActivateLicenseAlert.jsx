import React, { useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Container } from '@edx/paragon';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { UserSubsidyContext } from './UserSubsidy';

/**
 * An alert to inform the learner they have an assigned license that is not yet
 * activated. Provides a CTA button that links to the license activation route.
 */
const ActivateLicenseAlert = () => {
  const { enterpriseSlug } = useParams();
  const { subscriptionLicense } = useContext(UserSubsidyContext);
  if (!subscriptionLicense || ['activated', 'revoked'].includes(subscriptionLicense.status)) {
    return null;
  }
  const { activationKey } = subscriptionLicense;
  return (
    <Container size="lg" className="mt-3">
      <Alert variant="warning">
        <div className="d-flex align-items-center justify-content-between">
          <span>
            Your subscription license is not activated. To enroll in courses without
            payment, you must activate your license.
          </span>
          <Button
            as={Link}
            variant="primary"
            size="sm"
            to={`/${enterpriseSlug}/licenses/${activationKey}/activate`}
            onClick={() => {
              sendTrackEvent('edx.ui.enterprise.learner_portal.activate_license_alert.activate_cta.clicked');
            }}
            data-testid="activateCta"
          >
            Activate now
          </Button>
        </div>
      </Alert>
    </Container>
  );
};

export default ActivateLicenseAlert;
