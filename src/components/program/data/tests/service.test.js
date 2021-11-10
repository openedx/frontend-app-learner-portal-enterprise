import qs from 'query-string';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import ProgramService from '../service';

const ENTERPRISE_UUID = '12345678-9000-0000-0000-123456789101';
const PROGRAM_UUID = '12345678-9000-1111-1111-123456789101';
const APP_CONFIG = {
  USE_API_CACHE: true,
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
};
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
  isCatalogueContainsProgram: true,
};

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onGet(PROGRAM_API_ENDPOINT).reply(200, PROGRAM_DATA);
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => (APP_CONFIG),
}));

describe('course enrollments service', () => {
  beforeEach(() => {
    axiosMock.resetHistory();
  });

  it('fetches program data with program uuid belongs to enterprise', async () => {
    const options = {
      program_uuids: PROGRAM_UUID,
    };
    const CONTAINS_CONTENT_ITEMS_API_ENDPOINT = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${ENTERPRISE_UUID}/contains_content_items/?${qs.stringify(options)}`;
    axiosMock.onGet(CONTAINS_CONTENT_ITEMS_API_ENDPOINT).reply(200, { contains_content_items: true });

    const programService = new ProgramService({ enterpriseUuid: ENTERPRISE_UUID, programUuid: PROGRAM_UUID });
    const data = await programService.fetchAllProgramData();
    expect(axiosMock.history.get[0].url).toBe(PROGRAM_API_ENDPOINT);
    expect(axiosMock.history.get[1].url).toBe(CONTAINS_CONTENT_ITEMS_API_ENDPOINT);
    const expectedResponse = camelCaseObject(PROGRAM_DATA);
    expectedResponse.courses[0].enterpriseHasCourse = true;
    expectedResponse.courses[1].enterpriseHasCourse = true;
    expect(data.programDetails).toEqual(expectedResponse);
  });

  it('fetches program data with partial program uuid does not belongs to enterprise', async () => {
    // axiosMock.resetHistory();

    const optionsWithProgramUuid = {
      program_uuids: PROGRAM_UUID,
    };
    const optionsWithCourseUuid = {
      course_run_ids: COURSE_KEY,
    };
    const optionsWithCourse2Uuid = {
      course_run_ids: COURSE_KEY2,
    };
    const CONTAINS_CONTENT_ITEMS_API_ENDPOINT_1 = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${ENTERPRISE_UUID}/contains_content_items/?${qs.stringify(optionsWithProgramUuid)}`;
    axiosMock.onGet(CONTAINS_CONTENT_ITEMS_API_ENDPOINT_1).reply(200, { contains_content_items: false });

    const CONTAINS_CONTENT_ITEMS_API_ENDPOINT_2 = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${ENTERPRISE_UUID}/contains_content_items/?${qs.stringify(optionsWithCourseUuid)}`;
    axiosMock.onGet(CONTAINS_CONTENT_ITEMS_API_ENDPOINT_2).reply(200, { contains_content_items: true });

    const CONTAINS_CONTENT_ITEMS_API_ENDPOINT_3 = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${ENTERPRISE_UUID}/contains_content_items/?${qs.stringify(optionsWithCourse2Uuid)}`;
    axiosMock.onGet(CONTAINS_CONTENT_ITEMS_API_ENDPOINT_3).reply(200, { contains_content_items: false });

    const programService = new ProgramService({ enterpriseUuid: ENTERPRISE_UUID, programUuid: PROGRAM_UUID });
    const data = await programService.fetchAllProgramData();
    const expectedResponse = camelCaseObject(PROGRAM_DATA);
    expectedResponse.courses[0].enterpriseHasCourse = true;
    expectedResponse.courses[1].enterpriseHasCourse = false;
    expect(axiosMock.history.get[0].url).toBe(PROGRAM_API_ENDPOINT);
    expect(axiosMock.history.get[1].url).toBe(CONTAINS_CONTENT_ITEMS_API_ENDPOINT_1);
    expect(axiosMock.history.get[2].url).toBe(CONTAINS_CONTENT_ITEMS_API_ENDPOINT_2);
    expect(axiosMock.history.get[3].url).toBe(CONTAINS_CONTENT_ITEMS_API_ENDPOINT_3);
    expect(data.programDetails).toEqual(camelCaseObject(expectedResponse));
  });
});
