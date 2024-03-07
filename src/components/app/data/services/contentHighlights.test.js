import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { fetchEnterpriseCuration } from './contentHighlights';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockEnterpriseId = 'test-enterprise-uuid';
const APP_CONFIG = {
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
};
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => APP_CONFIG),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

describe('fetchEnterpriseCuration', () => {
  const queryParams = new URLSearchParams({
    enterprise_customer: mockEnterpriseId,
  });
  const HIGHLIGHTS_CONFIG_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-curations/?${queryParams.toString()}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      enterpriseCuration: null,
    },
    {
      enterpriseCuration: { uuid: 'test-highlights-curation-uuid' },
    },
  ])('returns content highlights configuration (%s)', async ({ enterpriseCuration }) => {
    const mockResponse = enterpriseCuration ? { results: [enterpriseCuration] } : { results: [] };
    axiosMock.onGet(HIGHLIGHTS_CONFIG_URL).reply(200, mockResponse);
    const result = await fetchEnterpriseCuration(mockEnterpriseId);
    if (enterpriseCuration) {
      expect(result).toEqual(enterpriseCuration);
    } else {
      expect(result).toEqual(null);
    }
  });

  it('catches 404 error and returns null', async () => {
    axiosMock.onGet(HIGHLIGHTS_CONFIG_URL).reply(404);
    const result = await fetchEnterpriseCuration(mockEnterpriseId);
    expect(result).toBeNull();
  });
});
