import { getSearchFacetFilters, hasActivatedAndCurrentSubscription } from '../utils';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';

jest.mock('../../../config', () => ({
  features: { PROGRAM_TYPE_FACET: true },
}));

describe('getSearchFacetFilters', () => {
  // Mock intl object to return `defaultMessage` of the argument.
  const intl = {
    formatMessage: message => message.defaultMessage,
  };
  it('should update search filters correctly', () => {
    const result = getSearchFacetFilters(intl);
    expect(result.find(item => item.attribute === 'program_type')).toBeDefined();
  });
});

describe('hasActivatedAndCurrentSubscription', () => {
  it('should return true when the subscription is activated and current', () => {
    const subscriptionLicense = {
      status: LICENSE_STATUS.ACTIVATED,
      subscriptionPlan: {
        isCurrent: true,
      },
    };

    const result = hasActivatedAndCurrentSubscription(subscriptionLicense);
    expect(result).toBe(true);
  });

  it('should return false when the subscription is not activated and not current', () => {
    const subscriptionLicense = {
      status: LICENSE_STATUS.REVOKED,
      subscriptionPlan: {
        isCurrent: false,
      },
    };

    const result = hasActivatedAndCurrentSubscription(subscriptionLicense);
    expect(result).toBe(false);
  });

  it('should return false when subscriptionLicense is undefined', () => {
    const result = hasActivatedAndCurrentSubscription(undefined);
    expect(result).toBe(false);
  });
});
