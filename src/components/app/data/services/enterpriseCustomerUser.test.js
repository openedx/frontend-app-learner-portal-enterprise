import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';

import {
  fetchEnterpriseCourseEnrollments,
  fetchEnterpriseLearnerData,
  fetchInProgressPathways,
  fetchLearnerProgramsList,
  postLinkEnterpriseLearner,
  postUnlinkUserFromEnterprise,
  updateUserActiveEnterprise,
  updateUserCsodParams,
} from './enterpriseCustomerUser';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockEnterpriseId = 'test-enterprise-uuid';
const mockEnterpriseSlug = 'test-enterprise-slug';
const APP_CONFIG = {
  LMS_BASE_URL: 'http://localhost:18000',
};
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => APP_CONFIG),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: jest.fn(),
  getAuthenticatedHttpClient: jest.fn(),
}));
const mockAuthenticatedUser = {
  userId: 3,
  username: 'test-username',
  administrator: false,
};
const mockStaffAuthenticatedUser = {
  ...mockAuthenticatedUser,
  administrator: true,
};
getAuthenticatedUser.mockReturnValue(mockAuthenticatedUser);

describe('updateUserActiveEnterprise', () => {
  const updateUserActiveEnterpriseUrl = `${APP_CONFIG.LMS_BASE_URL}/enterprise/select/active/`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('passes correct POST body', async () => {
    const enterpriseCustomer = { uuid: 'uuid' };
    const formData = new FormData();
    formData.append('enterprise', enterpriseCustomer.uuid);
    axiosMock.onPost(updateUserActiveEnterpriseUrl).reply(200, {});
    await updateUserActiveEnterprise({ enterpriseCustomer });
    expect(axiosMock.history.post[0].data).toEqual(formData);
  });
});

describe('fetchEnterpriseLearnerData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it.each([
    {
      enableLearnerPortal: true,
      isLinkedToEnterpriseCustomer: true,
      isStaffUser: false,
    },
    {
      enableLearnerPortal: false,
      isLinkedToEnterpriseCustomer: true,
      isStaffUser: false,
    },
    {
      enableLearnerPortal: true,
      isLinkedToEnterpriseCustomer: false,
      isStaffUser: false,
    },
    {
      enableLearnerPortal: true,
      isLinkedToEnterpriseCustomer: false,
      isStaffUser: true,
    },
    {
      enableLearnerPortal: false,
      isLinkedToEnterpriseCustomer: false,
      isStaffUser: true,
    },
  ])('returns enterprise learner data (%s)', async ({
    enableLearnerPortal,
    isLinkedToEnterpriseCustomer,
    isStaffUser,
  }) => {
    const username = 'test-username';
    const baseEnterpriseLearnerUrl = `${APP_CONFIG.LMS_BASE_URL}/enterprise/api/v1/enterprise-learner/`;
    const baseEnterpriseCustomerUrl = `${APP_CONFIG.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/`;
    const enterpriseLearnerQueryParams = new URLSearchParams({
      username,
      page: 1,
    });
    const enterpriseCustomerQueryParams = new URLSearchParams({
      slug: mockEnterpriseSlug,
    });
    const mockEnterpriseCustomer = {
      uuid: mockEnterpriseId,
      enableLearnerPortal,
      slug: mockEnterpriseSlug,
      brandingConfiguration: {
        logo: 'https://logo.url',
        primaryColor: 'red',
        secondaryColor: 'white',
        tertiaryColor: 'blue',
      },
    };
    const enterpriseLearnerUrl = `${baseEnterpriseLearnerUrl}?${enterpriseLearnerQueryParams.toString()}`;
    const enterpriseCustomerUrl = `${baseEnterpriseCustomerUrl}?${enterpriseCustomerQueryParams.toString()}`;
    const enterpriseCustomersUsers = isLinkedToEnterpriseCustomer ? [{
      id: 6,
      active: true,
      enterpriseCustomer: mockEnterpriseCustomer,
    }] : [];
    axiosMock.onGet(enterpriseLearnerUrl).reply(200, {
      results: enterpriseCustomersUsers,
      enterpriseFeatures: { featureA: true },
    });
    if (isStaffUser) {
      getAuthenticatedUser.mockReturnValue(mockStaffAuthenticatedUser);
      axiosMock.onGet(enterpriseCustomerUrl).reply(200, {
        results: [mockEnterpriseCustomer],
      });
    }
    const response = await fetchEnterpriseLearnerData(username, mockEnterpriseSlug);
    const expectedTransformedEnterpriseCustomer = {
      ...mockEnterpriseCustomer,
      disableSearch: false,
      showIntegrationWarning: false,
    };
    const getExpectedEnterpriseCustomer = () => {
      if (enableLearnerPortal && (isStaffUser || isLinkedToEnterpriseCustomer)) {
        return expectedTransformedEnterpriseCustomer;
      }
      return null;
    };

    const getExpectedActiveEnterpriseCustomer = () => (
      isLinkedToEnterpriseCustomer && enableLearnerPortal ? expectedTransformedEnterpriseCustomer : null
    );

    const expectedEnterpriseCustomer = getExpectedEnterpriseCustomer();
    const expectedActiveEnterpriseCustomer = getExpectedActiveEnterpriseCustomer();
    expect(response).toEqual({
      enterpriseFeatures: { featureA: true },
      enterpriseCustomer: expectedEnterpriseCustomer,
      activeEnterpriseCustomer: expectedActiveEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: enterpriseCustomersUsers
        .filter((ecu) => !!ecu.enterpriseCustomer.enableLearnerPortal)
        .map((ecu) => ({
          ...ecu,
          enterpriseCustomer: expectedEnterpriseCustomer,
        })),
      staffEnterpriseCustomer: isStaffUser ? expectedEnterpriseCustomer : undefined,
      shouldUpdateActiveEnterpriseCustomerUser: false,
    });
  });

  it('catches API error', async () => {
    const username = 'test-username';
    const enterpriseLearnerQueryParams = new URLSearchParams({
      username,
      page: 1,
    });
    const enterpriseLearnerUrl = `${APP_CONFIG.LMS_BASE_URL}/enterprise/api/v1/enterprise-learner/?${enterpriseLearnerQueryParams.toString()}`;
    axiosMock.onGet(enterpriseLearnerUrl).reply(500);
    const response = await fetchEnterpriseLearnerData(username, mockEnterpriseSlug);
    expect(response).toEqual({
      enterpriseFeatures: {},
      enterpriseCustomer: null,
      activeEnterpriseCustomer: null,
      allLinkedEnterpriseCustomerUsers: [],
      staffEnterpriseCustomer: null,
      shouldUpdateActiveEnterpriseCustomerUser: false,
    });
  });
});

describe('fetchEnterpriseCourseEnrollments', () => {
  const courseEnrollmentsQueryParams = new URLSearchParams({
    enterprise_id: mockEnterpriseId,
    is_active: true,
  });
  const COURSE_ENROLLMENTS_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?${courseEnrollmentsQueryParams.toString()}`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('returns course enrollments', async () => {
    const courseEnrollments = [{ key: 'edX+DemoX' }];
    axiosMock.onGet(COURSE_ENROLLMENTS_ENDPOINT).reply(200, courseEnrollments);
    const response = await fetchEnterpriseCourseEnrollments(mockEnterpriseId);
    expect(response).toEqual(courseEnrollments);
  });

  it.each([404, 500])('returns empty array when 404 error occurs', async (httpStatusCode) => {
    axiosMock.onGet(COURSE_ENROLLMENTS_ENDPOINT).reply(httpStatusCode);
    const response = await fetchEnterpriseCourseEnrollments(mockEnterpriseId);
    expect(response).toEqual([]);
  });
});

describe('postLinkEnterpriseLearner', () => {
  const mockEnterpriseCustomerInviteKey = 'test-enterprise-customer-invite-key';
  const ENTERPRISE_LINK_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer-invite-key/${mockEnterpriseCustomerInviteKey}/link-user/`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('passes correct POST body', async () => {
    const enterpriseCustomerInviteKey = 'test-enterprise-customer-invite-key';
    axiosMock.onPost(ENTERPRISE_LINK_ENDPOINT).reply(200, {
      enterprise_customer_slug: mockEnterpriseSlug,
    });
    const result = await postLinkEnterpriseLearner(enterpriseCustomerInviteKey);
    expect(result).toEqual(
      expect.objectContaining({
        enterpriseCustomerSlug: mockEnterpriseSlug,
      }),
    );
  });
});

describe('fetchLearnerProgramsList', () => {
  const PROGRAMS_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL}/api/dashboard/v0/programs/${mockEnterpriseId}/`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('returns programs list', async () => {
    const programsList = [{ key: 'edX+DemoX' }];
    axiosMock.onGet(PROGRAMS_ENDPOINT).reply(200, programsList);
    const response = await fetchLearnerProgramsList(mockEnterpriseId);
    expect(response).toEqual(programsList);
  });

  it('returns empty array when 404 error occurs', async () => {
    axiosMock.onGet(PROGRAMS_ENDPOINT).reply(500);
    const response = await fetchLearnerProgramsList(mockEnterpriseId);
    expect(response).toEqual([]);
  });
});

describe('fetchInProgressPathways', () => {
  const mockPathways = [
    { id: 1 },
    { id: 2 },
  ];
  const mockPathwaysResponse = {
    results: mockPathways,
  };

  const PATHWAYS_PROGRESS_URL = `${APP_CONFIG.LMS_BASE_URL}/api/learner-pathway-progress/v1/progress/`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('returns in-progress pathways', async () => {
    axiosMock.onGet(PATHWAYS_PROGRESS_URL).reply(200, mockPathwaysResponse);
    const response = await fetchInProgressPathways();
    expect(response).toEqual(mockPathways);
  });

  it('returns empty array when 500 error occurs', async () => {
    axiosMock.onGet(PATHWAYS_PROGRESS_URL).reply(500);
    const response = await fetchInProgressPathways();
    expect(response).toEqual([]);
  });

  it('pass learner csod params', async () => {
    const SAVE_CSOD_LEARNER_PARAMS_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL}/integrated_channels/api/v1/cornerstone/save-learner-information`;
    const data = {
      userGuid: '11115def-de43-40b7-a831-213d1128c215',
      sessionToken: 'kpp7t4d',
      callbackUrl: 'csod-callback',
      subdomain: 'contentsandbox',
      enterpriseUUID: mockEnterpriseId,
      courseKey: 'edx+DemoX',
    };
    axiosMock.onPost(SAVE_CSOD_LEARNER_PARAMS_ENDPOINT).reply(200);
    const response = await updateUserCsodParams(data);
    expect(response.status).toEqual(200);
  });
});
describe('postUnlinkUserFromEnterprise', () => {
  const mockEnterpriseCustomerUserUUID = 'test-enterprise-customer-user-uuid';
  const UNLINK_USER_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/${mockEnterpriseCustomerUserUUID}/unlink_self/`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('passes correct POST body', async () => {
    axiosMock.onPost(UNLINK_USER_ENDPOINT).reply(200);
    await postUnlinkUserFromEnterprise(mockEnterpriseCustomerUserUUID);
    expect(axiosMock.history.post[0].data).toEqual(undefined);
  });
});
