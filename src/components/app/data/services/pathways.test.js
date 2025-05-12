import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform';
import { v4 as uuidv4 } from 'uuid';
import { fetchPathwayProgressDetails } from './pathways';

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
const mockPathwayUUID = 'test-pathway-uuid';

const mockPathwayProgressResponse = {
  learner_pathway_progress: {
    id: 9,
    uuid: mockPathwayUUID,
    title: 'Getting Started in Python for Data Science',
    status: 'active',
    steps: [
      {
        uuid: uuidv4(),
        min_requirement: 1,
        courses: [
          {
            key: 'IBM+PY0101EN',
            course_runs: [
              {
                key: 'course-v1:IBM+PY0101EN+2T2021',
              },
              {
                key: 'course-v1:IBM+PY0101EN+2T2023',
              },
            ],
            title: 'Python Basics for Data Science',
            content_type: 'course',
            status: 'COMPLETE',
          },
        ],
        programs: [],
        status: 100.0,
      },
      {
        uuid: uuidv4(),
        min_requirement: 1,
        courses: [
          {
            key: 'IBM+DA0101EN',
            course_runs: [
              {
                key: 'course-v1:IBM+DA0101EN+2T2021',
              },
            ],
            title: 'Analyzing Data with Python',
            content_type: 'course',
            status: 'NOT_STARTED',
          },
        ],
        programs: [],
        status: 0.0,
      },
      {
        uuid: uuidv4(),
        min_requirement: 1,
        courses: [
          {
            key: 'IBM+DV0101EN',
            course_runs: [
              {
                key: 'course-v1:IBM+DV0101EN+1T2021',
              },
            ],
            title: 'Visualizing Data with Python',
            content_type: 'course',
            status: 'NOT_STARTED',
          },
        ],
        programs: [],
        status: 0.0,
      },
      {
        uuid: uuidv4(),
        min_requirement: 1,
        courses: [],
        programs: [
          {
            uuid: uuidv4(),
            title: 'Text Analytics with Python',
            content_type: 'program',
            courses: [
              {
                key: 'UCx+LNG01.1ucx',
                course_runs: [
                  {
                    key: 'course-v1:UCx+LNG01.1ucx+1T2022',
                  },
                  {
                    key: 'course-v1:UCx+LNG01.1ucx+3T2022',
                  },
                ],
              },
              {
                key: 'UCx+LNG01.2ucx',
                course_runs: [
                  {
                    key: 'course-v1:UCx+LNG01.2ucx+1T2022',
                  },
                  {
                    key: 'course-v1:UCx+LNG01.2ucx+3T2022',
                  },
                ],
              },
            ],
            status: 'NOT_STARTED',
            enterprises: '[]',
          },
        ],
        status: 0.0,
      },
    ],
  },
};

describe('fetchAcademiesDetail', () => {
  const PATHWAY_PROGRESS_DETAILS_URL = `${APP_CONFIG.LMS_BASE_URL}/api/learner-pathway-progress/v1/progress/${mockPathwayUUID}/`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('returns the api call with a 200', async () => {
    axiosMock.onGet(PATHWAY_PROGRESS_DETAILS_URL).reply(200, mockPathwayProgressResponse);
    const result = await fetchPathwayProgressDetails(mockPathwayUUID);
    expect(result).toEqual(camelCaseObject(mockPathwayProgressResponse));
  });
});
