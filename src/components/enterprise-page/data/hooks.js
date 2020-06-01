import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { fetchEntepriseCustomerConfig } from './service';

const defaultBorderColor = '#007D88';
const defaultBackgroundColor = '#D7E3FC';

const defaultBrandingConfig = {
  logo: null,
  bannerBackgroundColor: defaultBackgroundColor,
  bannerBorderColor: defaultBorderColor,
};

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
          const brandingConfiguration = config.brandingConfiguration || defaultBrandingConfig;
          const {
            logo,
            bannerBackgroundColor,
            bannerBorderColor,
          } = brandingConfiguration;
          const {
            name,
            uuid,
            slug,
            contactEmail,
          } = config;
          setEnterpriseConfig({
            name,
            uuid,
            slug,
            contactEmail,
            branding: {
              logo,
              banner: {
                backgroundColor: bannerBackgroundColor,
                borderColor: bannerBorderColor,
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
