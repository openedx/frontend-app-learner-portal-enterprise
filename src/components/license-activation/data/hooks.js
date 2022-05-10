import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { activateLicense } from './service';

export function useLicenseActivation({ enterpriseUUID, activationKey, autoActivated }) {
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [activationError, setActivationError] = useState(false);

  useEffect(() => {
    activateLicense(activationKey)
      .then(() => {
        setActivationSuccess(true);
        setActivationError(false);
        sendEnterpriseTrackEvent(
          enterpriseUUID,
          'edx.ui.enterprise.license-activation.license-activated',
          {
            autoActivated,
          },
        );
      })
      .catch((error) => {
        logError(error);
        setActivationError(true);
        setActivationSuccess(false);
      });
  }, [activationKey]);

  return [activationSuccess, activationError];
}
