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
    const enableBrowseAndRequest = false;

    const result = hasActivatedAndCurrentSubscription(subscriptionLicense, enableBrowseAndRequest);
    expect(result).toBe(true);
  });

  it('should return false when the subscription is not activated and not current', () => {
    const subscriptionLicense = {
      status: LICENSE_STATUS.REVOKED,
      subscriptionPlan: {
        isCurrent: false,
      },
    };
    const enableBrowseAndRequest = false;

    const result = hasActivatedAndCurrentSubscription(subscriptionLicense, enableBrowseAndRequest);
    expect(result).toBe(false);
  });

  it('should return false when subscriptionLicense is undefined', () => {
    const enableBrowseAndRequest = false;
    const result = hasActivatedAndCurrentSubscription(undefined, enableBrowseAndRequest);
    expect(result).toBe(false);
  });
  it('should return true when enableBrowseAndRequest is true', () => {
    const enableBrowseAndRequest = true;
    const result = hasActivatedAndCurrentSubscription(undefined, enableBrowseAndRequest);
    expect(result).toBe(true);
  });
});
