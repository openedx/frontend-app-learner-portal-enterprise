import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getAcademies, getAcademyMetadata } from '../service';

// config
const APP_CONFIG = {
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
};

// test data
const ACADEMY_UUID = 'b48ff396-03b4-467f-a4cc-da4327156984';
const ENTERPRISE_UUID = '12345678-9000-0000-0000-123456789101';
const ACADEMY_MOCK_DATA = {
  uuid: ACADEMY_UUID,
  title: 'Awesome Academy',
  short_description: 'show description of awesome academy.',
  long_description: 'I am an awesome academy.',
  image: 'example.com/academies/images/awesome-academy.png',
  tags: [
    {
      id: 111,
      title: 'wowwww',
      description: 'description 111',
    },
    {
      id: 222,
      title: 'boooo',
      description: 'description 222',
    },
  ],
};

// endpoints
const ACADEMY_API_ENDPOINT = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies/${ACADEMY_UUID}/`;
const ACADEMIES_LIST_API_ENDPOINT = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies?enterprise_customer=${ENTERPRISE_UUID}`;

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onGet(ACADEMY_API_ENDPOINT).reply(200, ACADEMY_MOCK_DATA);
axiosMock.onGet(ACADEMIES_LIST_API_ENDPOINT).reply(200, { count: 1, results: [ACADEMY_MOCK_DATA] });

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => APP_CONFIG),
}));

describe('getAcademyMetadata', () => {
  beforeEach(() => {
    axiosMock.resetHistory();
    jest.clearAllMocks();
  });

  it('fetches academy metadata', async () => {
    const response = await getAcademyMetadata(ACADEMY_UUID);
    expect(axiosMock.history.get[0].url).toBe(ACADEMY_API_ENDPOINT);
    expect(response).toEqual(camelCaseObject(ACADEMY_MOCK_DATA));
  });

  it('fetches academies list', async () => {
    const response = await getAcademies(ENTERPRISE_UUID);
    expect(axiosMock.history.get[0].url).toBe(ACADEMIES_LIST_API_ENDPOINT);
    expect(response).toEqual(camelCaseObject([ACADEMY_MOCK_DATA]));
  });
});
