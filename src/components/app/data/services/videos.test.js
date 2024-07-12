import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';
import { fetchVideoDetail } from './videos';
import { transformVideoData } from '../../../microlearning/data/utils';

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

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

const mockVideoID = 'test-video-id';
const mockVideoDetailResponse = {
  data: {
    json_metadata: {
      download_link: 'https://d2f1egay8yehza.cloudfront.net/DoaneXBUS242X-V001600_DTH.mp4',
      transcript_urls: {
        en: 'https://prod-edx-video-transcripts.edx-video.net/video-transcripts/4149c8bc684d4c01a0d82bca3acd8047.sjson',
      },
      duration: 135.98,
    },
    parent_content_metadata: {
      title: 'Needs-Driven Innovation ',
    },
    summary_transcripts: {
      listItem: 'Needs-Driven Innovation focuses on identifying...',
    },
    skills: {
      list_item: [
        {
          name: 'Planning',
          description: 'Planning is the process of thinking...',
          category: 'Physical and Inherent Abilities',
          subcategory: 'Initiative and Leadership',
        },
      ],
    },
  },
};

describe('fetchVideoDetail', () => {
  const VIDEO_DETAIL_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/videos/${mockVideoID}`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('returns the api call with a 200', async () => {
    axiosMock.onGet(VIDEO_DETAIL_URL).reply(200, mockVideoDetailResponse);

    const result = await fetchVideoDetail(mockVideoID);

    expect(result).toEqual(camelCaseObject(transformVideoData(result?.data || {})));
  });

  it('returns the api call with a 404 and logs an error', async () => {
    axiosMock.onGet(VIDEO_DETAIL_URL).reply(404, {});

    const result = await fetchVideoDetail(mockVideoID);

    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(new Error('Request failed with status code 404'));
    expect(result).toEqual(null);
  });
});
