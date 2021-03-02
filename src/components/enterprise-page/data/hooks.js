import { useState, useEffect } from 'react';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import colors from '../../../colors.scss';
import { fetchEnterpriseCustomerConfigForSlug } from './service';

export const defaultPrimaryColor = colors?.primary;
export const defaultSecondaryColor = colors?.info100;
export const defaultTertiaryColor = colors?.info500;

const defaultBrandingConfig = {
  logo: null,
  primaryColor: defaultPrimaryColor,
  secondaryColor: defaultSecondaryColor,
  tertiaryColor: defaultTertiaryColor,
};

/**
 * @param {string} [enterpriseSlug] enterprise slug.
 * @param {boolean} [useCache] indicates whether cache should be used
 * @returns {object} EnterpriseConfig
 */
export function useEnterpriseCustomerConfig(enterpriseSlug, useCache = true) {
  const [enterpriseConfig, setEnterpriseConfig] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    fetchEnterpriseCustomerConfigForSlug(enterpriseSlug, useCache)
      .then((response) => {
        const { results } = camelCaseObject(response.data);
        const config = results.pop();
        if (config?.enableLearnerPortal) {
          const brandingConfiguration = config.brandingConfiguration || defaultBrandingConfig;
          const disableSearch = !!(!config?.enableIntegratedCustomerLearnerPortalSearch && config?.identityProvider);
          const showIntegrationWarning = !!(!disableSearch && config?.identityProvider);
          const {
            logo,
            primaryColor,
            secondaryColor,
            tertiaryColor,
          } = brandingConfiguration;
          const {
            name,
            uuid,
            slug,
            contactEmail,
            hideCourseOriginalPrice,
          } = config;
          setEnterpriseConfig({
            name,
            uuid,
            slug,
            contactEmail,
            hideCourseOriginalPrice,
            disableSearch,
            showIntegrationWarning,
            branding: {
              logo,
              colors: {
                primary: primaryColor || defaultPrimaryColor,
                secondary: secondaryColor || defaultSecondaryColor,
                tertiary: tertiaryColor || defaultTertiaryColor,
              },
            },
          });
        } else {
          if (!config) {
            logInfo(`No Enterprise Config was found for Enterprise: ${enterpriseSlug}`);
          } else {
            logInfo(`Error: learner portal is not enabled for Enterprise: ${enterpriseSlug}`);
          }
          setEnterpriseConfig(null);
        }
      })
      .catch((error) => {
        logError(new Error(`Error occurred while fetching the Enterprise Config: ${error}`));
        setFetchError(error);
      });
  }, [enterpriseSlug]);

  return [enterpriseConfig, fetchError];
}
