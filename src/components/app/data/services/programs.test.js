import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { fetchLearnerProgramProgressDetail } from './programs';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
const APP_CONFIG = {
  LMS_BASE_URL: 'http://localhost:18000',
};

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => APP_CONFIG),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

const mockCourseData = {
  completed: [],
  notStarted: [],
  inProgress: [],
};
const mockProgramData = {
  uuid: 'test-uuid',
  title: 'Test Program Title',
  type: 'MicroMasters',
  bannerImage: {
    large: {
      url: 'www.example.com/large',
      height: 123,
      width: 455,
    },
    medium: {
      url: 'www.example.com/medium',
      height: 123,
      width: 455,
    },
    small: {
      url: 'www.example.com/small',
      height: 123,
      width: 455,
    },
    xSmall: {
      url: 'www.example.com/xSmall',
      height: 123,
      width: 455,
    },
  },
  authoringOrganizations: [
    {
      key: 'test-key',
      logoImageUrl: '/media/organization/logos/shield.png',
    },
  ],
  progress: {
    inProgress: 1,
    completed: 2,
    notStarted: 3,
  },
};
const mockResponse = {
  results: {
    programData: mockProgramData,
    courseData: mockCourseData,
    urls: {
      programListingUrl: '/dashboard/programs/',
    },
  },
};
const mockEmptyResponse = {
  certificateData: [],
  courseData: null,
  creditPathways: [],
  industryPathways: [],
  programData: null,
  urls: null,
};

describe('fetchLearnerProgramProgressDetail', () => {
  const mockProgramUUID = 'test-program-uuid';
  const PROGRAM_PROGRESS_DETAIL_URL = `${APP_CONFIG.LMS_BASE_URL}/api/dashboard/v0/programs/${mockProgramUUID}/progress_details/`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('returns the api call with a 200', async () => {
    axiosMock.onGet(PROGRAM_PROGRESS_DETAIL_URL).reply(200, mockResponse);

    const result = await fetchLearnerProgramProgressDetail(mockProgramUUID);
    expect(result).toEqual(mockResponse);
  });
  it('returns the api call with a 404 and logs an error', async () => {
    axiosMock.onGet(PROGRAM_PROGRESS_DETAIL_URL).reply(404, mockResponse);

    const result = await fetchLearnerProgramProgressDetail(mockProgramUUID);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(new Error('Request failed with status code 404'));
    expect(result).toEqual(mockEmptyResponse);
  });
});
