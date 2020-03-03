import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import camelcaseKeys from 'camelcase-keys';
import { logError } from '@edx/frontend-platform/logging';

import { fetchEntepriseCustomerConfig } from './service';

// eslint-disable-next-line import/prefer-default-export
export function useEnterpriseCustomerConfig() {
  const initialConfig = {
    name: undefined,
    slug: undefined,
    uuid: undefined,
    contactEmail: undefined,
    branding: {
      logoUrl: undefined,
      banner: {
        borderColor: undefined,
        backgroundColor: undefined,
      },
    },
  };
  const { enterpriseSlug } = useParams();
  const [enterpriseConfig, setEnterpriseConfig] = useState(initialConfig);

  if (!enterpriseSlug) {
    throw Error('Missing enterprise slug in the URL');
  }

  useEffect(() => {
    fetchEntepriseCustomerConfig(enterpriseSlug)
      .then((response) => {
        const { results } = camelcaseKeys(response.data, { deep: true });
        const config = results.pop();
        if (config) {
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
                borderColor: bannerBorderColor,
                backgroundColor: bannerBackgroundColor,
              },
            },
          });
        }
      })
      .catch((error) => {
        logError(new Error(error));
      });
  }, [enterpriseSlug]);

  return enterpriseConfig;
}
