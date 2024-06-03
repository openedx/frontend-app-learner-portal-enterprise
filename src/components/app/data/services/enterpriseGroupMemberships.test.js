import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  fetchEnterpriseAccessPolicies,
  fetchEnterpriseGroupMemberships,
} from './enterpriseGroupMemberships';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockEnterpriseId = 'test-enterprise-uuid';
const mockGroupUuid = 'test-group-uuid';
const APP_CONFIG = {
  LMS_BASE_URL: 'http://localhost:18000',
  ENTERPRISE_ACCESS_BASE_URL: 'http://localhost:18270',
};
const SUBSIDY_ACCESS_POLICY_ENDPOINT = `${APP_CONFIG.ENTERPRISE_ACCESS_BASE_URL}/api/v1/subsidy-access-policies/?enterprise_customer_uuid=${mockEnterpriseId}`;
const ENTERPRISE_GROUPS_LEARNERS_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL}/enterprise/api/v1/enterprise-group/${mockGroupUuid}/learners/`;

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => APP_CONFIG),
}));

describe('fetchEnterpriseAccessPolicies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('returns policies for the enterprise customer', async () => {
    const subsidyAccessPolicies = {
      results: [{
        uuid: 'test-policy-uuid',
        enterpriseCustomerUuid: mockEnterpriseId,
        groupAssociations: ['test-group-association'],
      }],
    };
    axiosMock.onGet(SUBSIDY_ACCESS_POLICY_ENDPOINT).reply(200, subsidyAccessPolicies);
    const results = await fetchEnterpriseAccessPolicies(mockEnterpriseId);
    expect(results).toEqual(subsidyAccessPolicies.results);
  });
});

describe('fetchEnterpriseGroupMemberships', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('returns list of transformed group memberships', async () => {
    const mockUserEmail = 'test@2u.com';
    const groupMemberships = {
      results: [{
        learner_id: 1,
        pending_learner_id: null,
        enterprise_group_membership_uuid: mockGroupUuid,
        member_details: {
          user_email: mockUserEmail,
        },
        recent_action: 'Accepted: April 15, 2024',
        status: 'accepted',
      }],
    };
    const subsidyAccessPolicies = {
      results: [{
        uuid: 'test-policy-uuid',
        enterpriseCustomerUuid: mockEnterpriseId,
        groupAssociations: ['test-group-uuid'],
      }],
    };
    axiosMock.onGet(SUBSIDY_ACCESS_POLICY_ENDPOINT).reply(200, subsidyAccessPolicies);
    axiosMock.onGet(ENTERPRISE_GROUPS_LEARNERS_ENDPOINT).reply(200, groupMemberships);

    const response = await fetchEnterpriseGroupMemberships(mockEnterpriseId, mockUserEmail);
    const mockTransformedResponse = [
      {
        enterpriseGroupMembershipUuid: 'test-group-uuid',
        groupUuid: 'test-group-uuid',
        learnerId: 1,
        memberDetails: {
          userEmail: 'test@2u.com',
        },
        pendingLearnerId: null,
        recentAction: 'Accepted: April 15, 2024',
        status: 'accepted',
      }];
    expect(response).toEqual(mockTransformedResponse);
  });
});
