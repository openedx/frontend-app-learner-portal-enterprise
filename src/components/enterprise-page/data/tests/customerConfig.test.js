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

// somehow jest does not seems to recognize/load the logging module
// need to sort this out and ideally remove this
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: () => {},
}
));

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

const responseWithBrandingConfig = {
  ...responseWithNullBrandingConfig,
  data: {
    results: [
      {
        ...responseWithNullBrandingConfig.data.results[0],
        branding_configuration: {
          logo: 'testlog.png',
          bannerBackgroundColor: 'testcolor',
          bannerBorderColor: 'testcolor',
        },
      },
    ],
  },
};

const responseWithBrandingConfigNullValues = {
  ...responseWithNullBrandingConfig,
  data: {
    results: [
      {
        ...responseWithNullBrandingConfig.data.results[0],
        branding_configuration: {
          logo: null,
          bannerBackgroundColor: null,
          bannerBorderColor: null,
        },
      },
    ],
  },
};

describe('customer config with various states of branding_configuration', () => {
  test('null branding_configuration uses default values and does not fail', async () => {
    fetchEntepriseCustomerConfig.mockResolvedValue(responseWithNullBrandingConfig);

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCustomerConfig());

    // since there is an async fetch in the hook
    await waitForNextUpdate();

    expect(result.error).not.toBeDefined();
    expect(result.current).toHaveLength(1);
    expect(result.current[0]).not.toBeNull();
  });

  test('null values for fields in branding_config uses defaults and does not fail', async () => {
    fetchEntepriseCustomerConfig.mockResolvedValue(responseWithBrandingConfigNullValues);

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCustomerConfig());

    // since there is an async fetch in the hook
    await waitForNextUpdate();

    expect(result.error).not.toBeDefined();
    expect(result.current).toHaveLength(1);
    expect(result.current[0]).not.toBeNull();
  });

  test('valid branding_config results in correct values for logo and other branding settings', async () => {
    fetchEntepriseCustomerConfig.mockResolvedValue(responseWithBrandingConfig);

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCustomerConfig());

    await waitForNextUpdate();

    expect(result.error).not.toBeDefined();
    expect(result.current).toHaveLength(1);
    expect(result.current[0]).not.toBeNull();
  });
});
