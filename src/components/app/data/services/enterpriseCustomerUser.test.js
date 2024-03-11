import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';

import {
  fetchEnterpriseCourseEnrollments,
  fetchEnterpriseLearnerData,
  postLinkEnterpriseLearner,
  updateUserActiveEnterprise,
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
      roleAssignments: ['enterprise_learner'],
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
      if (!enableLearnerPortal) {
        return undefined;
      }
      const shouldHaveAccess = isLinkedToEnterpriseCustomer || isStaffUser;
      if (shouldHaveAccess) {
        return expectedTransformedEnterpriseCustomer;
      }
      return undefined;
    };
    const getExpectedActiveEnterpriseCustomer = () => {
      if (!enableLearnerPortal || !isLinkedToEnterpriseCustomer) {
        return undefined;
      }
      return expectedTransformedEnterpriseCustomer;
    };
    const expectedEnterpriseCustomer = getExpectedEnterpriseCustomer();
    const expectedActiveEnterpriseCustomer = getExpectedActiveEnterpriseCustomer();
    const expectedRoleAssignments = isLinkedToEnterpriseCustomer ? ['enterprise_learner'] : [];
    expect(response).toEqual({
      enterpriseFeatures: { featureA: true },
      enterpriseCustomer: expectedEnterpriseCustomer,
      enterpriseCustomerUserRoleAssignments: expectedRoleAssignments,
      activeEnterpriseCustomer: expectedActiveEnterpriseCustomer,
      activeEnterpriseCustomerUserRoleAssignments: expectedRoleAssignments,
      allLinkedEnterpriseCustomerUsers: enterpriseCustomersUsers.map((ecu) => ({
        ...ecu,
        enterpriseCustomer: expectedEnterpriseCustomer,
      })),
      staffEnterpriseCustomer: isStaffUser ? expectedEnterpriseCustomer : undefined,
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
    axiosMock.onGet(COURSE_ENROLLMENTS_ENDPOINT).reply(200, courseEnrollments);
    const response = await fetchEnterpriseCourseEnrollments(mockEnterpriseId);
    expect(response).toEqual(courseEnrollments);
  });

  it('returns empty array when 404 error occurs', async () => {
    axiosMock.onGet(COURSE_ENROLLMENTS_ENDPOINT).reply(404);
    const response = await fetchEnterpriseCourseEnrollments(mockEnterpriseId);
    expect(response).toEqual([]);
  });
});

describe('postLinkEnterpriseLearner', () => {
  const mockEnterpriseCustomerInviteKey = 'test-enterprise-customer-invite-key';
  const ENTERPRISE_LINK_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer-invite-key/${mockEnterpriseCustomerInviteKey}/link-user/`;

  beforeEach(() => {
    jest.clearAllMocks();
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
