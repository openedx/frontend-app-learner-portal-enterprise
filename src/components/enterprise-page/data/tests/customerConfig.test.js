import { renderHook } from '@testing-library/react-hooks';

import useEnterpriseCustomerConfig from '../hooks';

describe('branding configuraton use cases', () => {
  xtest('null branding_configuration uses default values and does not fail', () => {
    const enterpriseConfig = renderHook(() => useEnterpriseCustomerConfig());
    expect(enterpriseConfig).toBeDefined();
  });

  xtest('null values for fields in branding_config uses defaults and does not fail', () => {
  });

  xtest('valid branding_config results in correct values for logo and other branding settings', () => {

  });
});
