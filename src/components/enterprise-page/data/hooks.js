import { useState, useEffect } from 'react';
import {
  useMutation, useQuery,
} from '@tanstack/react-query';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import colors from '../../../colors.scss';
import {
  fetchEnterpriseCustomerConfigForSlug,
  updateUserActiveEnterprise,
  fetchEnterpriseLearnerData,
} from './service';

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

/**
 * @param {string} [enterpriseId] enterprise UUID
 * @param {object} [user] user object containing JWT roles
 *
 * Sets the user's active enterprise.
 */
export const useUpdateActiveEnterpriseForUser = ({
  enterpriseId,
  user,
}) => {
  // Sets up POST call to update active enterprise.
  const { mutate, isLoading: isUpdatingActiveEnterprise } = useMutation({
    mutationFn: () => updateUserActiveEnterprise(enterpriseId),
    onError: () => {
      logError("Failed to update user's active enterprise");
    },
  });
  const { username } = user;
  const {
    data,
    isLoading: isLoadingActiveEnterprise,
  } = useQuery({
    queryKey: ['activeLinkedEnterpriseCustomer', username],
    queryFn: () => fetchEnterpriseLearnerData({ username }),
    meta: {
      errorMessage: "Failed to fetch user's active enterprise",
    },
  });

  useEffect(() => {
    if (!data || !enterpriseId) { return; }
    // Ensure that the current enterprise is linked and can be activated for the user
    if (!data.find(enterprise => enterprise.enterpriseCustomer.uuid === enterpriseId)) {
      return;
    }
    const activeLinkedEnterprise = data.find(enterprise => enterprise.active);
    if (!activeLinkedEnterprise) { return; }
    if (activeLinkedEnterprise.enterpriseCustomer.uuid !== enterpriseId) {
      mutate(enterpriseId);
    }
  }, [data, enterpriseId, mutate]);

  return {
    isLoading: isLoadingActiveEnterprise || isUpdatingActiveEnterprise,
  };
};
