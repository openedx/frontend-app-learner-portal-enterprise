import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
        const { results } = response.data;
        const config = results.pop();
        if (config) {
          const {
            name,
            uuid,
            slug,
            contact_email: contactEmail,
            branding_configuration: {
              logo,
              banner_background_color: bannerBackgroundColor,
              banner_border_color: bannerBorderColor,
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
