import React, { useContext } from 'react';
import { Alert, Container } from '@edx/paragon';

import { UserSubsidyContext } from './UserSubsidy';

/**
 * An alert to inform the learner they have an assigned license
 * that is not yet activated.
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
        payment, you must activate your license by clicking the activation link
        sent to your email.
      </Alert>
    </Container>
  );
};

export default ActivateLicenseAlert;
