import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { fetchLearnerProgramProgressDetail, fetchProgramDetails } from './programs';
import { fetchEnterpriseCustomerContainsContent } from './content';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
const APP_CONFIG = {
  LMS_BASE_URL: 'http://localhost:18000',
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
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

jest.mock('./content', () => ({
  ...jest.requireActual('./content'),
  fetchEnterpriseCustomerContainsContent: jest.fn(),
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
const mockProgramProgressResponse = {
  results: {
    programData: mockProgramData,
    courseData: mockCourseData,
    urls: {
      programListingUrl: '/dashboard/programs/',
    },
  },
};
const mockEmptyProgressResponse = {
  certificateData: [],
  courseData: null,
  creditPathways: [],
  industryPathways: [],
  programData: null,
  urls: null,
};

const mockProgramUUID = 'test-program-uuid';

describe('fetchLearnerProgramProgressDetail', () => {
  const PROGRAM_PROGRESS_DETAIL_URL = `${APP_CONFIG.LMS_BASE_URL}/api/dashboard/v0/programs/${mockProgramUUID}/progress_details/`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('returns the api call with a 200', async () => {
    axiosMock.onGet(PROGRAM_PROGRESS_DETAIL_URL).reply(200, mockProgramProgressResponse);

    const result = await fetchLearnerProgramProgressDetail(mockProgramUUID);
    expect(result).toEqual(mockProgramProgressResponse);
  });
  it('returns the api call with a 404 and logs an error', async () => {
    axiosMock.onGet(PROGRAM_PROGRESS_DETAIL_URL).reply(404, mockProgramProgressResponse);

    const result = await fetchLearnerProgramProgressDetail(mockProgramUUID);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(new Error('Request failed with status code 404'));
    expect(result).toEqual(mockEmptyProgressResponse);
  });
});

describe('fetchProgramDetails', () => {
  const ENTERPRISE_UUID = '12345678-9000-0000-0000-123456789101';
  const PROGRAM_UUID = '12345678-9000-1111-1111-123456789101';
  const PROGRAM_API_ENDPOINT = `${APP_CONFIG.DISCOVERY_API_BASE_URL}/api/v1/programs/${PROGRAM_UUID}/`;
  const COURSE_KEY = 'edX+DemoX';
  const COURSE_KEY2 = 'edX+WowX';
  const PROGRAM_DATA = {
    courses: [
      {
        key: COURSE_KEY,
        uuid: '12345678-be4c-4e1d-0000-2d60323db911',
        title: 'Introduction to Cloud Computing',
        activeCourseRun: undefined,
        course_runs: [
          {
            key: 'course-v1:edX+DemoX+2T2020',
            uuid: '12345678-be4c-4e1d-0000-2d60323db911',
            title: 'Introduction to Cloud Computing',
            short_description: 'course run description',
            start: '2020-07-21T16:00:00Z',
          },
        ],
        short_description: 'course description',
      },
      {
        key: COURSE_KEY2,
        uuid: '12345678-be4c-4e1d-0000-2d60323db911',
        title: 'Introduction to Cloud Computing',
        activeCourseRun: undefined,
        course_runs: [
          {
            key: 'course-v1:edX+DemoX+2T2020',
            uuid: '12345678-be4c-4e1d-0000-2d60323db911',
            title: 'Introduction to Cloud Computing',
            short_description: 'course run description',
            start: '2020-07-21T16:00:00Z',
          },
        ],
        short_description: 'course description',
      },
    ],
    catalogContainsProgram: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.resetHistory();
  });

  global.structuredClone = val => JSON.parse(JSON.stringify(val));
  it('fetches program data with program uuid belongs to enterprise', async () => {
    fetchEnterpriseCustomerContainsContent.mockReturnValue({ containsContentItems: true, catalogList: [] });
    axiosMock.onGet(PROGRAM_API_ENDPOINT).reply(200, PROGRAM_DATA);

    const data = await fetchProgramDetails(ENTERPRISE_UUID, PROGRAM_UUID);
    const expectedResponse = camelCaseObject(PROGRAM_DATA);
    expectedResponse.courses[0].enterpriseHasCourse = true;
    expectedResponse.courses[1].enterpriseHasCourse = true;
    expect(data).toEqual(expectedResponse);
  });

  it('fetches program data with partial program uuid does not belongs to enterprise', async () => {
    fetchEnterpriseCustomerContainsContent.mockReturnValue({ containsContentItems: false, catalogList: [] });
    const UPDATED_PROGRAM_DATA = {
      ...PROGRAM_DATA,
      catalogContainsProgram: false,
    };
    axiosMock.onGet(PROGRAM_API_ENDPOINT).reply(200, UPDATED_PROGRAM_DATA);

    const data = await fetchProgramDetails(ENTERPRISE_UUID, PROGRAM_UUID);
    const expectedResponse = camelCaseObject(UPDATED_PROGRAM_DATA);
    expectedResponse.courses[0].enterpriseHasCourse = false;
    expectedResponse.courses[1].enterpriseHasCourse = false;
    expect(data).toEqual(expectedResponse);
  });

  it('fetches program data with empty return', async () => {
    fetchEnterpriseCustomerContainsContent.mockReturnValue({ containsContentItems: false, catalogList: [] });

    axiosMock.onGet(PROGRAM_API_ENDPOINT).reply(200, {});

    const data = await fetchProgramDetails(ENTERPRISE_UUID, PROGRAM_UUID);
    expect(data).toEqual(null);
  });

  it('returns the api call with a 404 and logs an error', async () => {
    fetchEnterpriseCustomerContainsContent.mockReturnValue({ containsContentItems: false, catalogList: [] });

    axiosMock.onGet(PROGRAM_API_ENDPOINT).reply(404, {});

    const data = await fetchProgramDetails(ENTERPRISE_UUID, PROGRAM_UUID);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(new Error('Request failed with status code 404'));
    expect(data).toEqual(null);
  });
});
