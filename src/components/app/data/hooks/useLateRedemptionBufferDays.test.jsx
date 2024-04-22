import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AppContext } from '@edx/frontend-platform/react';
import { queryClient } from '../../../../utils/tests';
import { fetchRedeemablePolicies } from '../services';
import useLateRedemptionBufferDays from './useLateRedemptionBufferDays';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { LATE_ENROLLMENTS_BUFFER_DAYS } from '../../../../config/constants';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchRedeemablePolicies: jest.fn().mockResolvedValue(null),
}));
const mockSubsidyExpirationDate = dayjs().add(1, 'year').toISOString();
const mockContentAssignment = {
  uuid: 'test-assignment-uuid',
  state: 'allocated',
};
const redeemablePolicies = [
  {
    id: 123,
    subsidyExpirationDate: mockSubsidyExpirationDate,
  },
  {
    id: 456,
    subsidyExpirationDate: mockSubsidyExpirationDate,
    learnerContentAssignments: [mockContentAssignment],
    isLateRedemptionEnabled: true,
  },
];
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
const mockRedeemablePolicies = {
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
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();
describe('useLateRedemptionBufferDays', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchRedeemablePolicies.mockResolvedValue(mockRedeemablePolicies);
  });
  it('should handle resolved value correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLateRedemptionBufferDays(), { wrapper: Wrapper });
    await waitForNextUpdate();
    expect(result.current).toEqual(LATE_ENROLLMENTS_BUFFER_DAYS);
  });
  it('should return undefined if no late redemption is enabled', async () => {
    const updatedRedeemablePolicies = [
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
    const updatedExpectedTransformedPolicies = updatedRedeemablePolicies.map((policy) => ({
      ...policy,
      learnerContentAssignments: policy.learnerContentAssignments?.map((assignment) => ({
        ...assignment,
        subsidyExpirationDate: policy.subsidyExpirationDate,
      })),
    }));
    const updatedMockRedeemablePolicies = {
      ...mockContentAssignment,
      redeemablePolicies: updatedExpectedTransformedPolicies,
    };
    fetchRedeemablePolicies.mockResolvedValue(updatedMockRedeemablePolicies);

    const { result, waitForNextUpdate } = renderHook(() => useLateRedemptionBufferDays(), { wrapper: Wrapper });
    await waitForNextUpdate();
    expect(result.current).toEqual(undefined);
  });
});
