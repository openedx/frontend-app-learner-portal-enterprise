import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { fetchContentHighlights, fetchEnterpriseCuration } from './contentHighlights';
import { MAX_HIGHLIGHT_SETS } from '../constants';

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

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'es-419',
}));

describe('fetchEnterpriseCuration', () => {
  const queryParams = new URLSearchParams({
    enterprise_customer: mockEnterpriseId,
  });
  const HIGHLIGHTS_CONFIG_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-curations/?${queryParams.toString()}`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
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
      expect(result).toBeNull();
    }
  });
});

describe('fetchContentHighlights', () => {
  const queryParams = new URLSearchParams({
    enterprise_customer: mockEnterpriseId,
    page_size: MAX_HIGHLIGHT_SETS,
    lang: 'es',
  });
  const HIGHLIGHT_SETS_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/highlight-sets/?${queryParams.toString()}`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('returns content highlights', async () => {
    const mockResponse = {
      results: [
        { uuid: 'test-highlight-set-uuid-1' },
        { uuid: 'test-highlight-set-uuid-2' },
      ],
    };
    axiosMock.onGet(HIGHLIGHT_SETS_URL).reply(200, mockResponse);
    const result = await fetchContentHighlights(mockEnterpriseId);
    expect(result).toEqual(mockResponse.results);
  });
});
