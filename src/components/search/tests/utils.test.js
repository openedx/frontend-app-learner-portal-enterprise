import { getSearchFacetFilters } from '../utils';

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
