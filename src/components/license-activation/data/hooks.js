import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';

import { activateLicense } from './service';

// eslint-disable-next-line import/prefer-default-export
export function useLicenseActivation(activationKey) {
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [activationError, setActivationError] = useState(false);

  useEffect(() => {
    activateLicense(activationKey)
      .then(() => {
        setActivationSuccess(true);
        setActivationError(false);
      })
      .catch((error) => {
        logError(new Error(error));
        setActivationError(true);
        setActivationSuccess(false);
      });
  }, [activationKey]);

  return [activationSuccess, activationError];
}
