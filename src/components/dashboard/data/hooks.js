import { useEffect, useState } from 'react';
import {
  getAuthenticatedUser,
  hydrateAuthenticatedUser,
} from '@edx/frontend-platform/auth';

import { fetchEntepriseCustomerConfig } from './service';

// eslint-disable-next-line import/prefer-default-export
export function useAppSetup(enterpriseSlug) {
  const [user, setUser] = useState(null);
  const [enterpriseConfig, setEnterpriseConfig] = useState(null);

  useEffect(() => {
    async function hydrateUser() {
      await hydrateAuthenticatedUser();
    }
    Promise.all([
      hydrateUser(),
      fetchEntepriseCustomerConfig(enterpriseSlug),
    ])
      .then((responses) => {
        setUser(getAuthenticatedUser());

        // enterprise config
        const { data: { results: enterpriseConfigs } } = responses[1];
        const config = enterpriseConfigs.pop();
        setEnterpriseConfig(config);
      })
      .catch((error) => {
        // TODO: better error handling
        console.log(error);
      });
  }, [enterpriseSlug]);

  return [user, enterpriseConfig];
}
