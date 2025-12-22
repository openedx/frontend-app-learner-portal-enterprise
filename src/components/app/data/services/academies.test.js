import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform';
import { getLocale } from '@edx/frontend-platform/i18n';
import { fetchAcademies, fetchAcademiesDetail } from './academies';
import { fetchPaginatedData } from './utils';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
const APP_CONFIG = {
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
};

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => APP_CONFIG),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: jest.fn(),
}));

jest.mock('./utils');

const mockEnterpriseId = 'test-enterprise-uuid';
const mockAcademyUUID = 'test-academy-uuid';
const mockAcademyDetailResponse = {
  data: {
    uuid: 'test-academy-uuid',
    title: 'Test Academy 1',
    short_description: 'All enterprise - All catalogs',
    long_description: 'All enterprise - All catalogs',
    image: 'http://google.com',
    tags: [
      {
        id: 1,
        title: 'Test tag1',
        description: 'Test tag1',
      },
    ],
  },
};
const mockAcademyListResponse = {
  results: [
    {
      uuid: 'test-uuid-1',
      title: 'Test Academy 1',
      short_description: 'All enterprise - All catalogs',
      long_description: 'All enterprise - All catalogs',
      image: 'http://google.com',
      tags: [
        {
          id: 1,
          title: 'Test tag1',
          description: 'Test tag1',
        },
      ],
    },
    {
      uuid: 'test-uuid-2',
      title: 'Test Academy3',
      short_description: 'Test Academy3',
      long_description: 'Test Academy3',
      image: 'https://picsum.photos/400/200',
      tags: [
        {
          id: 2,
          title: 'test tag 2',
          description: 'test tag 2',
        },
      ],
    },
  ],
};

describe('fetchAcademiesDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
    getLocale.mockReturnValue('en');
  });

  it('returns the api call with a 200 and includes lang parameter', async () => {
    const queryParams = new URLSearchParams({
      enterprise_customer: mockEnterpriseId,
      lang: 'en',
    });
    const ACADEMIES_DETAIL_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies/${mockAcademyUUID}/?${queryParams.toString()}`;

    axiosMock.onGet(ACADEMIES_DETAIL_URL).reply(200, mockAcademyDetailResponse);
    const result = await fetchAcademiesDetail(mockAcademyUUID, mockEnterpriseId);
    expect(result).toEqual(camelCaseObject(mockAcademyDetailResponse));
    expect(getLocale).toHaveBeenCalled();
  });

  it('uses Spanish locale when getLocale returns es', async () => {
    getLocale.mockReturnValue('es');
    const queryParams = new URLSearchParams({
      enterprise_customer: mockEnterpriseId,
      lang: 'es',
    });
    const ACADEMIES_DETAIL_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies/${mockAcademyUUID}/?${queryParams.toString()}`;

    axiosMock.onGet(ACADEMIES_DETAIL_URL).reply(200, mockAcademyDetailResponse);
    const result = await fetchAcademiesDetail(mockAcademyUUID, mockEnterpriseId);
    expect(result).toEqual(camelCaseObject(mockAcademyDetailResponse));
    expect(getLocale).toHaveBeenCalled();
  });

  it('falls back to English for unsupported locale', async () => {
    getLocale.mockReturnValue('fr'); // French not supported
    const queryParams = new URLSearchParams({
      enterprise_customer: mockEnterpriseId,
      lang: 'en', // Should fall back to 'en'
    });
    const ACADEMIES_DETAIL_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies/${mockAcademyUUID}/?${queryParams.toString()}`;

    axiosMock.onGet(ACADEMIES_DETAIL_URL).reply(200, mockAcademyDetailResponse);
    const result = await fetchAcademiesDetail(mockAcademyUUID, mockEnterpriseId);
    expect(result).toEqual(camelCaseObject(mockAcademyDetailResponse));
    expect(getLocale).toHaveBeenCalled();
  });

  it('extracts base locale from locale with region code', async () => {
    getLocale.mockReturnValue('es-419'); // Spanish (Latin America)
    const queryParams = new URLSearchParams({
      enterprise_customer: mockEnterpriseId,
      lang: 'es', // Should extract 'es' from 'es-419'
    });
    const ACADEMIES_DETAIL_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies/${mockAcademyUUID}/?${queryParams.toString()}`;

    axiosMock.onGet(ACADEMIES_DETAIL_URL).reply(200, mockAcademyDetailResponse);
    const result = await fetchAcademiesDetail(mockAcademyUUID, mockEnterpriseId);
    expect(result).toEqual(camelCaseObject(mockAcademyDetailResponse));
    expect(getLocale).toHaveBeenCalled();
  });
});

describe('fetchAcademies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getLocale.mockReturnValue('en');
    fetchPaginatedData.mockReturnValue(
      {
        results: camelCaseObject([...mockAcademyListResponse.results]),
        response: camelCaseObject(mockAcademyListResponse),
      },
    );
    axiosMock.reset();
  });

  it('returns the api call with a 200 and includes lang parameter', async () => {
    const queryParams = new URLSearchParams({
      enterprise_customer: mockEnterpriseId,
      lang: 'en',
    });
    const ACADEMIES_LIST_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies?${queryParams.toString()}`;

    axiosMock.onGet(ACADEMIES_LIST_URL).reply(200, mockAcademyListResponse);
    const result = await fetchAcademies(mockEnterpriseId);
    expect(result).toEqual(camelCaseObject(mockAcademyListResponse.results));
    expect(getLocale).toHaveBeenCalled();
  });

  it('uses Spanish locale when getLocale returns es', async () => {
    getLocale.mockReturnValue('es');
    const queryParams = new URLSearchParams({
      enterprise_customer: mockEnterpriseId,
      lang: 'es',
    });
    const ACADEMIES_LIST_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies?${queryParams.toString()}`;

    axiosMock.onGet(ACADEMIES_LIST_URL).reply(200, mockAcademyListResponse);
    const result = await fetchAcademies(mockEnterpriseId);
    expect(result).toEqual(camelCaseObject(mockAcademyListResponse.results));
    expect(getLocale).toHaveBeenCalled();
  });

  it('falls back to English for unsupported locale', async () => {
    getLocale.mockReturnValue('de'); // German not supported
    const queryParams = new URLSearchParams({
      enterprise_customer: mockEnterpriseId,
      lang: 'en', // Should fall back to 'en'
    });
    const ACADEMIES_LIST_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies?${queryParams.toString()}`;

    axiosMock.onGet(ACADEMIES_LIST_URL).reply(200, mockAcademyListResponse);
    const result = await fetchAcademies(mockEnterpriseId);
    expect(result).toEqual(camelCaseObject(mockAcademyListResponse.results));
    expect(getLocale).toHaveBeenCalled();
  });

  it('extracts base locale from locale with region code', async () => {
    getLocale.mockReturnValue('en-GB'); // English (UK)
    const queryParams = new URLSearchParams({
      enterprise_customer: mockEnterpriseId,
      lang: 'en', // Should extract 'en' from 'en-GB'
    });
    const ACADEMIES_LIST_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies?${queryParams.toString()}`;

    axiosMock.onGet(ACADEMIES_LIST_URL).reply(200, mockAcademyListResponse);
    const result = await fetchAcademies(mockEnterpriseId);
    expect(result).toEqual(camelCaseObject(mockAcademyListResponse.results));
    expect(getLocale).toHaveBeenCalled();
  });
});
