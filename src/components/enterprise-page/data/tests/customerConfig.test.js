import { renderHook } from '@testing-library/react-hooks';

import { useEnterpriseCustomerConfig } from '../hooks';
import { fetchEntepriseCustomerConfig } from '../service';

jest.mock('../service');

// for now let's mock router dom to mock useParams, but perhaps we can
// pass a default valued arg into the hook to avoid this?
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ enterpriseSlug: 'test-enterprise' }),
}));

const responseWithNullBrandingConfig = {
  data: {
    results: [
      {
        branding_configuration: null,
        name: 'Test Enterprise',
        enable_learner_portal: true,
        replace_sensitive_sso_username: false,
        site: { domain: 'example.com', name: 'example.com' },
        slug: 'test-enterprise',
        uuid: 'aa672add-2554-4a5e-9576-618ba63c5325',
      },
    ],
  },
};

describe('customer config with various states of branding_configuration', () => {
  xtest('null branding_configuration uses default values and does not fail', () => {
    fetchEntepriseCustomerConfig.mockResolvedValue(responseWithNullBrandingConfig);

    const { result } = renderHook(() => useEnterpriseCustomerConfig());

    expect(result.current).toBeDefined();
  });

  xtest('null values for fields in branding_config uses defaults and does not fail', () => {
  });

  xtest('valid branding_config results in correct values for logo and other branding settings', () => {

  });
});
