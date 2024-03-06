import { transformEnterpriseCustomer } from '../../data';

const mockEnterpriseFeatures = {
  'example-feature': true,
};

describe('transformEnterpriseCustomer', () => {
  it('returns null with disabled learner portal', () => {
    const enterpriseCustomer = {
      enableLearnerPortal: false,
    };
    const result = transformEnterpriseCustomer(enterpriseCustomer, mockEnterpriseFeatures);
    expect(result).toEqual(null);
  });

  it.each([
    {
      identityProvider: undefined,
      enableIntegratedCustomerLearnerPortalSearch: false,
      expectedDisableSearch: false,
      expectedShowIntegrationWarning: false,
    },
    {
      identityProvider: undefined,
      enableIntegratedCustomerLearnerPortalSearch: true,
      expectedDisableSearch: false,
      expectedShowIntegrationWarning: false,
    },
    {
      identityProvider: 'example-idp',
      enableIntegratedCustomerLearnerPortalSearch: false,
      expectedDisableSearch: true,
      expectedShowIntegrationWarning: false,
    },
    {
      identityProvider: 'example-idp',
      enableIntegratedCustomerLearnerPortalSearch: true,
      expectedDisableSearch: false,
      expectedShowIntegrationWarning: true,
    },
  ])('returns transformed enterprise customer with enabled learner portal (%s)', ({
    identityProvider,
    enableIntegratedCustomerLearnerPortalSearch,
    expectedDisableSearch,
    expectedShowIntegrationWarning,
  }) => {
    const enterpriseCustomer = {
      enableLearnerPortal: true,
      enableIntegratedCustomerLearnerPortalSearch,
      identityProvider,
      brandingConfiguration: {
        primaryColor: '#123456',
        secondaryColor: '#789abc',
        tertiaryColor: '#def012',
      },
    };
    const result = transformEnterpriseCustomer(enterpriseCustomer, mockEnterpriseFeatures);
    expect(result).toEqual({
      ...enterpriseCustomer,
      brandingConfiguration: {
        ...enterpriseCustomer.brandingConfiguration,
        primaryColor: '#123456',
        secondaryColor: '#789abc',
        tertiaryColor: '#def012',
      },
      disableSearch: expectedDisableSearch,
      showIntegrationWarning: expectedShowIntegrationWarning,
      enterpriseFeatures: mockEnterpriseFeatures,
    });
  });
});
