import { useState, useEffect } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { fetchEnterpriseCustomerConfig } from './service';

export const defaultBorderColor = '#007D88';
export const defaultBackgroundColor = '#D7E3FC';
export const defaultSearchBackgroundColor = '#1a337b';

const defaultBrandingConfig = {
  logo: null,
  bannerBackgroundColor: defaultBackgroundColor,
  bannerBorderColor: defaultBorderColor,
  searchBackgroundColor: defaultSearchBackgroundColor,
};

/**
 * @param {string} [enterpriseSlug] enterprise slug.
 * @returns {object} EnterpriseConfig
 */
// eslint-disable-next-line import/prefer-default-export
export function useEnterpriseCustomerConfig(enterpriseSlug) {
  const [enterpriseConfig, setEnterpriseConfig] = useState(undefined);

  useEffect(() => {
    fetchEnterpriseCustomerConfig(enterpriseSlug)
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
                backgroundColor: bannerBackgroundColor || defaultBackgroundColor,
                borderColor: bannerBorderColor || defaultBorderColor,
              },
              search: {
                backgroundColor: defaultSearchBackgroundColor,
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

  return enterpriseConfig;
}
