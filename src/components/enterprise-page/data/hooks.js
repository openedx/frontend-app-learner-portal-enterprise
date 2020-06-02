import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { fetchEnterpriseCustomerConfig } from './service';

const defaultBorderColor = '#007D88';
const defaultBackgroundColor = '#D7E3FC';

const defaultBrandingConfig = {
  logo: null,
  bannerBackgroundColor: defaultBackgroundColor,
  bannerBorderColor: defaultBorderColor,
};

/**
 * If enterpriseSlug is passed, it will be used instead of the useParams hook output
 * @param {string} [enterpriseSlug] enterprise slug.
 * @returns {object} EnterpriseConfig
 */
// eslint-disable-next-line import/prefer-default-export
export function useEnterpriseCustomerConfig(enterpriseSlug) {
  const slugFromUseParams = () => {
    const { enterpriseSlug: slugFromParams } = useParams();
    return slugFromParams;
  };
  const enterpriseSlugFinal = enterpriseSlug || slugFromUseParams();
  const [enterpriseConfig, setEnterpriseConfig] = useState(undefined);

  useEffect(() => {
    fetchEnterpriseCustomerConfig(enterpriseSlugFinal)
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
                backgroundColor: bannerBackgroundColor || defaultBorderColor,
                borderColor: bannerBorderColor || defaultBrandingConfig,
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
  }, [enterpriseSlugFinal]);

  return enterpriseConfig;
}
