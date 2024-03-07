import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { fetchEnterpriseCourseEnrollments, fetchEnterpriseLearnerData, updateUserActiveEnterprise } from './enterpriseCustomerUser';

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
  getAuthenticatedHttpClient: jest.fn(),
}));

describe('updateUserActiveEnterprise', () => {
  const updateUserActiveEnterpriseUrl = `${APP_CONFIG.LMS_BASE_URL}/enterprise/select/active/`;

  beforeEach(() => {
    jest.clearAllMocks();
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
  });

  it.each([
    {
      enableLearnerPortal: true,
    },
    {
      enableLearnerPortal: false,
    },
  ])('returns enterprise learner data', async ({ enableLearnerPortal }) => {
    const username = 'test-username';
    const enterpriseLearnerUrl = `${APP_CONFIG.LMS_BASE_URL}/enterprise/api/v1/enterprise-learner/`;
    const queryParams = new URLSearchParams({
      username,
      page: 1,
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
    const url = `${enterpriseLearnerUrl}?${queryParams.toString()}`;
    const enterpriseCustomersUsers = [{
      id: 6,
      active: true,
      enterpriseCustomer: mockEnterpriseCustomer,
      roleAssignments: ['enterprise_learner'],
    }];
    axiosMock.onGet(url).reply(200, { results: enterpriseCustomersUsers, enterpriseFeatures: { featureA: true } });
    const response = await fetchEnterpriseLearnerData(username, mockEnterpriseSlug);
    const expectedTransformedEnterpriseCustomer = {
      ...mockEnterpriseCustomer,
      disableSearch: false,
      showIntegrationWarning: false,
    };
    const expectedEnterpriseCustomer = enableLearnerPortal ? expectedTransformedEnterpriseCustomer : null;
    expect(response).toEqual({
      enterpriseFeatures: { featureA: true },
      enterpriseCustomer: expectedEnterpriseCustomer,
      enterpriseCustomerUserRoleAssignments: ['enterprise_learner'],
      activeEnterpriseCustomer: expectedEnterpriseCustomer,
      activeEnterpriseCustomerUserRoleAssignments: ['enterprise_learner'],
      allLinkedEnterpriseCustomerUsers: enterpriseCustomersUsers.map((ecu) => ({
        ...ecu,
        enterpriseCustomer: expectedEnterpriseCustomer,
      })),
    });
  });
});

describe('fetchEnterpriseCourseEnrollments', () => {
  const COURSE_ENROLLMENTS_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?enterprise_id=${mockEnterpriseId}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns course enrollments', async () => {
    const courseEnrollments = [{ key: 'edX+DemoX' }];
    axiosMock.onGet(COURSE_ENROLLMENTS_ENDPOINT).reply(200, { results: courseEnrollments });
    const response = await fetchEnterpriseCourseEnrollments(mockEnterpriseId);
    expect(response).toEqual({
      results: courseEnrollments,
    });
  });
});
