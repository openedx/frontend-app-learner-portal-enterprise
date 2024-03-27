import dayjs from 'dayjs';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { fetchEnterpriseOffers, fetchRedeemablePolicies } from '.';
import { ENTERPRISE_OFFER_STATUS, ENTERPRISE_OFFER_USAGE_TYPE } from '../../../../enterprise-user-subsidy/enterprise-offers/data/constants';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockEnterpriseId = 'test-enterprise-uuid';
const mockContentAssignment = {
  uuid: 'test-assignment-uuid',
  state: 'allocated',
};
const APP_CONFIG = {
  ECOMMERCE_BASE_URL: 'http://localhost:18130',
};
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => APP_CONFIG),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

describe('fetchEnterpriseOffers', () => {
  const queryParams = new URLSearchParams({
    usage_type: ENTERPRISE_OFFER_USAGE_TYPE.PERCENTAGE,
    discount_value: 100,
    status: ENTERPRISE_OFFER_STATUS.OPEN,
    page_size: 100,
  });
  const ENTERPRISE_OFFERS_URL = `${APP_CONFIG.ECOMMERCE_BASE_URL}/api/v2/enterprise/${mockEnterpriseId}/enterprise-learner-offers/?${queryParams.toString()}`;

  it('returns enterprise offers', async () => {
    const enterpriseOffers = {
      results: [{ id: 123 }],
    };
    axiosMock.onGet(ENTERPRISE_OFFERS_URL).reply(200, enterpriseOffers);
    const result = await fetchEnterpriseOffers(mockEnterpriseId);
    expect(result).toEqual(enterpriseOffers.results);
  });

  it('returns empty array on error', async () => {
    axiosMock.onGet(ENTERPRISE_OFFERS_URL).reply(500);
    const result = await fetchEnterpriseOffers(mockEnterpriseId);
    expect(result).toEqual([]);
  });
});

describe('fetchRedeemablePolicies', () => {
  it('returns redeemable policies', async () => {
    const userID = 3;
    const queryParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseId,
      lms_user_id: userID,
    });
    const POLICY_REDEMPTION_URL = `${APP_CONFIG.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/credits_available/?${queryParams.toString()}`;
    const mockSubsidyExpirationDate = dayjs().add(1, 'year').toISOString();
    const redeemablePolicies = [
      {
        id: 123,
        subsidyExpirationDate: mockSubsidyExpirationDate,
      },
      {
        id: 456,
        subsidyExpirationDate: mockSubsidyExpirationDate,
        learnerContentAssignments: [mockContentAssignment],
      },
    ];
    axiosMock.onGet(POLICY_REDEMPTION_URL).reply(200, redeemablePolicies);
    const result = await fetchRedeemablePolicies(mockEnterpriseId, userID);
    const expectedTransformedPolicies = redeemablePolicies.map((policy) => ({
      ...policy,
      learnerContentAssignments: policy.learnerContentAssignments?.map((assignment) => ({
        ...assignment,
        subsidyExpirationDate: policy.subsidyExpirationDate,
      })),
    }));
    const mockContentAssignmentWithSubsidyExpiration = {
      ...mockContentAssignment,
      subsidyExpirationDate: mockSubsidyExpirationDate,
    };
    const expectedRedeemablePolicies = {
      redeemablePolicies: expectedTransformedPolicies,
      learnerContentAssignments: {
        acceptedAssignments: [],
        allocatedAssignments: [mockContentAssignmentWithSubsidyExpiration],
        assignments: [mockContentAssignmentWithSubsidyExpiration],
        assignmentsForDisplay: [mockContentAssignmentWithSubsidyExpiration],
        canceledAssignments: [],
        erroredAssignments: [],
        expiredAssignments: [],
        hasAcceptedAssignments: false,
        hasAllocatedAssignments: true,
        hasAssignments: true,
        hasAssignmentsForDisplay: true,
        hasCanceledAssignments: false,
        hasErroredAssignments: false,
        hasExpiredAssignments: false,
      },
    };
    expect(result).toEqual(expectedRedeemablePolicies);
  });

  it('returns empty array on error', async () => {
    const userID = 3;
    const queryParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseId,
      lms_user_id: userID,
    });
    const POLICY_REDEMPTION_URL = `${APP_CONFIG.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/credits_available/?${queryParams.toString()}`;
    axiosMock.onGet(POLICY_REDEMPTION_URL).reply(500);
    const result = await fetchRedeemablePolicies(mockEnterpriseId, userID);
    expect(result).toEqual({
      redeemablePolicies: [],
      learnerContentAssignments: {
        assignments: [],
        hasAssignments: false,
        allocatedAssignments: [],
        hasAllocatedAssignments: false,
        acceptedAssignments: [],
        hasAcceptedAssignments: false,
        canceledAssignments: [],
        hasCanceledAssignments: false,
        expiredAssignments: [],
        hasExpiredAssignments: false,
        erroredAssignments: [],
        hasErroredAssignments: false,
        assignmentsForDisplay: [],
        hasAssignmentsForDisplay: false,
      },
    });
  });
});
