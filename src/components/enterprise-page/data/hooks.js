import { useState, useEffect, useCallback } from 'react';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import colors from '../../../colors.scss';
import { fetchEnterpriseCustomerConfigForSlug, updateUserActiveEnterprise } from './service';
import { loginRefresh } from '../../../utils/common';

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
        setEnterpriseConfig(null);
      });
  }, [enterpriseSlug, useCache]);

  return [enterpriseConfig, fetchError];
};

/**
 * @param {string} [enterpriseId] enterprise UUID
 * @param {object} [user] user object containing JWT roles
 *
 * Sets the user's active enterprise and forces login_refresh to re-order the roles inside the user's JWT.
 */
export const useUpdateActiveEnterpriseForUser = ({
  enterpriseId,
  user,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const updateActiveEnterpriseAndRefreshJWT = useCallback(async () => {
    setIsLoading(true);

    try {
      await updateUserActiveEnterprise(enterpriseId);
      await loginRefresh();
    } catch (error) {
      logError(error);
    } finally {
      setIsLoading(false);
    }
  }, [enterpriseId]);

  useEffect(() => {
    if (!(enterpriseId && user)) {
      return;
    }

    const { roles } = user;
    // The first learner role corresponds to the currently active enterprise for the user
    const activeLearnerRole = roles.find(role => role.split(':')[0] === 'enterprise_learner');

    if (activeLearnerRole) {
      const currentActiveEnterpriseId = activeLearnerRole.split(':')[1];
      if (currentActiveEnterpriseId !== '*' && currentActiveEnterpriseId !== enterpriseId) {
        updateActiveEnterpriseAndRefreshJWT();
      }
    }
  }, [enterpriseId, user, updateActiveEnterpriseAndRefreshJWT]);

  return {
    isLoading,
  };
};
