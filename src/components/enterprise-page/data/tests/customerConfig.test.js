import { renderHook } from '@testing-library/react-hooks';

import {
  useEnterpriseCustomerConfig,
  defaultPrimaryColor,
  defaultSecondaryColor,
  defaultTertiaryColor,
} from '../hooks';
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
          logo: 'testlogo.png',
          bannerBackgroundColor: 'secondaryColor',
          bannerBorderColor: 'tertiaryColor',
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
    expect(result.current.branding.logo).toBeNull();
    expect(result.current.branding.colors.primary).toBe(defaultPrimaryColor);
    expect(result.current.branding.colors.secondary).toBe(defaultSecondaryColor);
    expect(result.current.branding.colors.tertiary).toBe(defaultTertiaryColor);
  });

  test('null values for fields in branding_config uses defaults and does not fail', async () => {
    fetchEnterpriseCustomerConfig.mockResolvedValue(responseWithBrandingConfigNullValues);

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCustomerConfig(TEST_ENTERPRISE_SLUG));

    // since there is an async fetch in the hook
    await waitForNextUpdate();

    expect(result.error).not.toBeDefined();
    expect(result.current).not.toBeNull();
    expect(result.current.branding.logo).toBeNull();
    expect(result.current.branding.colors.primary).toBe(defaultPrimaryColor);
    expect(result.current.branding.colors.secondary).toBe(defaultSecondaryColor);
    expect(result.current.branding.colors.tertiary).toBe(defaultTertiaryColor);
  });

  test('valid branding_config results in correct values for logo and other branding settings', async () => {
    fetchEnterpriseCustomerConfig.mockResolvedValue(responseWithBrandingConfig);

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCustomerConfig(TEST_ENTERPRISE_SLUG));

    await waitForNextUpdate();

    expect(result.error).not.toBeDefined();
    expect(result.current).not.toBeNull();
    expect(result.current.branding.logo).toBe('testlogo.png');
    expect(result.current.branding.colors.primary).toBe(defaultPrimaryColor);
    expect(result.current.branding.colors.secondary).toBe('secondaryColor');
    expect(result.current.branding.colors.tertiary).toBe('tertiaryColor');
  });
});
