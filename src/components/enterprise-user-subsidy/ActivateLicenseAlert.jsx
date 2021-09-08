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
  const { subscriptionLicense } = useContext(UserSubsidyContext);
  if (!subscriptionLicense || ['activated', 'revoked'].includes(subscriptionLicense.status)) {
    return null;
  }
  return (
    <Container size="lg" className="mt-3">
      <Alert variant="warning">
        Your subscription license is not activated. To enroll in courses without
        payment, you must activate your license from the activation link sent to
        your email.
      </Alert>
    </Container>
  );
};

export default ActivateLicenseAlert;
