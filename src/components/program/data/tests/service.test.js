import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import ProgramService from '../service';
import { createManyMocks, factory } from '../../../../utils/tests';

const ENTERPRISE_UUID = '12345678-9000-0000-0000-123456789101';
const SUBSCRIPTION_UUID = '12345678-9000-0000-0000-123456789101';
const PROGRAM_UUID = '12345678-9000-1111-1111-123456789101';
const APP_CONFIG = {
  USE_API_CACHE: true,
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
  LMS_BASE_URL: 'http://localhost:18000',
};
const PROGRAM_API_ENDPOINT = `${APP_CONFIG.DISCOVERY_API_BASE_URL}/api/v1/programs/${PROGRAM_UUID}/`;
const ENTERPRISE_CATALOG_API_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL}/api/catalogs/${ENTERPRISE_UUID}/`;

const courseFactory = factory.object({
  key: factory.iterate(['edX+DemoX', 'edX+WowX']),
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
  enterpriseHasCourse: true,
});

const PROGRAM_DATA = {
  uuid: PROGRAM_UUID,
  courses: createManyMocks(2, courseFactory),
  catalogContainsProgram: true,
};

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const programFactory = factory.object({
  uuid: factory.iterate(
    [PROGRAM_UUID],
    factory.index((i) => `12345678-be4c-4e1d-0000-${i}`),
  ),
});

const catalogDataFactory = factory.object({
  enterprise_uuid: ENTERPRISE_UUID,
  subscription_uuid: SUBSCRIPTION_UUID,
  programs: factory.list(3, programFactory),
});

axiosMock.onGet(PROGRAM_API_ENDPOINT).reply(200, PROGRAM_DATA);
axiosMock.onGet(ENTERPRISE_CATALOG_API_ENDPOINT).reply(200, catalogDataFactory.create());

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => (APP_CONFIG),
}));

describe('course enrollments service', () => {
  beforeEach(() => {
    axiosMock.resetHistory();
  });

  it('fetches program data with program uuid belongs to enterprise', async () => {
    const programService = new ProgramService({ enterpriseUuid: ENTERPRISE_UUID, programUuid: PROGRAM_UUID });
    const { programDetails } = await programService.fetchAllProgramData();

    const havingUrl = (url) => expect.objectContaining({ url });

    const getHistory = axiosMock.history.get;
    expect(getHistory).toHaveLength(2);
    expect(getHistory).toContainEqual(havingUrl(PROGRAM_API_ENDPOINT));
    expect(getHistory).toContainEqual(havingUrl(ENTERPRISE_CATALOG_API_ENDPOINT));

    const expectedProgramDetails = camelCaseObject(PROGRAM_DATA);
    expect(programDetails).toEqual(expectedProgramDetails);
  });
});
