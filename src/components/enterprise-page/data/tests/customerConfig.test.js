import { renderHook } from '@testing-library/react-hooks';

import { useEnterpriseCustomerConfig } from '../hooks';
import { fetchEnterpriseCustomerConfig } from '../service';

const TEST_ENTERPRISE_SLUG = 'test-enterprise';

jest.mock('../service');

// somehow jest does not seems to recognize/load the logging module
// need to sort this out and ideally remove this
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: () => {},
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
        slug: TEST_ENTERPRISE_SLUG,
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
    fetchEnterpriseCustomerConfig.mockResolvedValue(responseWithNullBrandingConfig);

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCustomerConfig(TEST_ENTERPRISE_SLUG));

    // since there is an async fetch in the hook
    await waitForNextUpdate();

    expect(result.error).not.toBeDefined();
    expect(result.current).not.toBeNull();
  });

  test('null values for fields in branding_config uses defaults and does not fail', async () => {
    fetchEnterpriseCustomerConfig.mockResolvedValue(responseWithBrandingConfigNullValues);

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCustomerConfig(TEST_ENTERPRISE_SLUG));

    // since there is an async fetch in the hook
    await waitForNextUpdate();

    expect(result.error).not.toBeDefined();
    expect(result.current).not.toBeNull();
  });

  test('valid branding_config results in correct values for logo and other branding settings', async () => {
    fetchEnterpriseCustomerConfig.mockResolvedValue(responseWithBrandingConfig);

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCustomerConfig(TEST_ENTERPRISE_SLUG));

    await waitForNextUpdate();

    expect(result.error).not.toBeDefined();
    expect(result.current).not.toBeNull();
  });
});
