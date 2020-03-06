import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { fetchEntepriseCustomerConfig } from './service';

const defaultBorderColor = '#007D88';
const defaultBackgroundColor = '#D7E3FC';

// eslint-disable-next-line import/prefer-default-export
export function useEnterpriseCustomerConfig() {
  const { enterpriseSlug } = useParams();
  const [enterpriseConfig, setEnterpriseConfig] = useState(undefined);

  useEffect(() => {
    fetchEntepriseCustomerConfig(enterpriseSlug)
      .then((response) => {
        const { results } = camelCaseObject(response.data);
        const config = results.pop();
        if (config && config.enableLearnerPortal) {
          const {
            name,
            uuid,
            slug,
            contactEmail,
            brandingConfiguration: {
              logo,
              bannerBackgroundColor,
              bannerBorderColor,
            },
          } = config;
          setEnterpriseConfig({
            name,
            uuid,
            slug,
            contactEmail,
            branding: {
              logo,
              banner: {
                backgroundColor: bannerBackgroundColor || defaultBackgroundColor,
                borderColor: bannerBorderColor || defaultBorderColor,
              },
            },
          });
        } else {
          setEnterpriseConfig(null);
        }
      })
      .catch((error) => {
        logError(new Error(error));
        setEnterpriseConfig(null);
      });
  }, [enterpriseSlug]);

  return [enterpriseConfig];
}
