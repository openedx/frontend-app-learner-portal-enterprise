import { useState, useEffect } from 'react';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import {
  fetchEnterpriseCustomerConfigForSlug,
} from './service';
import { getBrandColorsFromCSSVariables } from '../../../utils/common';

const brandColors = getBrandColorsFromCSSVariables();

export const defaultPrimaryColor = brandColors.primary;
export const defaultSecondaryColor = brandColors.info100;
export const defaultTertiaryColor = brandColors.info500;

const defaultBrandingConfig = {
  logo: null,
  primaryColor: defaultPrimaryColor,
  secondaryColor: defaultSecondaryColor,
  tertiaryColor: defaultTertiaryColor,
};

/**
 * @param {string} [enterpriseSlug] enterprise slug
 * @param {boolean} [useCache] indicates whether cache should be used
 * @returns {object} EnterpriseConfig
 */
export const useEnterpriseCustomerConfig = (enterpriseSlug, useCache = true) => {
  const [enterpriseConfig, setEnterpriseConfig] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    fetchEnterpriseCustomerConfigForSlug(enterpriseSlug, useCache)
      .then((response) => {
        const { results, enterpriseFeatures } = camelCaseObject(response.data);
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
            authOrgId,
            adminUsers,
            contactEmail,
            hideCourseOriginalPrice,
            hideLaborMarketData,
            identityProvider,
            enableLearnerPortalOffers,
            enableExecutiveEducation2UFulfillment,
            enableDataSharingConsent,
            enableCareerEngagementNetworkOnLearnerPortal,
            careerEngagementNetworkMessage,
            enablePathways,
            enablePrograms,
            enableAcademies,
          } = config;
          setEnterpriseConfig({
            name,
            uuid,
            slug,
            authOrgId,
            adminUsers,
            contactEmail,
            hideCourseOriginalPrice,
            hideLaborMarketData,
            identityProvider,
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
            enableLearnerPortalOffers,
            enableExecutiveEducation2UFulfillment,
            enableDataSharingConsent,
            enableCareerEngagementNetworkOnLearnerPortal,
            careerEngagementNetworkMessage,
            enablePathways,
            enablePrograms,
            enterpriseFeatures,
            enableAcademies,
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
  }, [enterpriseSlug, useCache]);

  return [enterpriseConfig, fetchError];
};
