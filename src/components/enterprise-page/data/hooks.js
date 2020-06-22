import { useState, useEffect } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { fetchEnterpriseCustomerConfig } from './service';

export const defaultPrimaryColor = '#1a337b';
export const defaultSecondaryColor = '#d7e3fc';
export const defaultTertiaryColor = '#007d88';

const defaultBrandingConfig = {
  logo: null,
  primaryColor: defaultPrimaryColor,
  secondaryColor: defaultSecondaryColor,
  tertiaryColor: defaultTertiaryColor,
};

/**
 * @param {string} [enterpriseSlug] enterprise slug.
 * @returns {object} EnterpriseConfig
 */
// eslint-disable-next-line import/prefer-default-export
export function useEnterpriseCustomerConfig(enterpriseSlug) {
  const [enterpriseConfig, setEnterpriseConfig] = useState();

  useEffect(() => {
    fetchEnterpriseCustomerConfig(enterpriseSlug)
      .then((response) => {
        const { results } = camelCaseObject(response.data);
        const config = results.pop();
        if (config && config.enableLearnerPortal) {
          const brandingConfiguration = config.brandingConfiguration || defaultBrandingConfig;
          // TODO: bannerBackgroundColor and bannerBorderColor will be replaced by
          // secondaryColor and tertiaryColor, respectively.
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
              colors: {
                // TODO: this will eventually change to `primaryColor || defaultPrimaryColor`
                primary: defaultPrimaryColor,
                // TODO: this will eventually change to `secondaryColor || defaultSecondaryColor`
                secondary: bannerBackgroundColor || defaultSecondaryColor,
                // TODO: this will eventually change to `tertiaryColor || defaultTertiaryColor`
                tertiary: bannerBorderColor || defaultTertiaryColor,
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
