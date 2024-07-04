import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchCanRedeem } from '../services';
import { useCanUpgradeWithLearnerCredit } from './index';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchCanRedeem: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockCourseRunKey = 'course-v1:edX+DemoX+T2024';
const mockCanRedeemData = [{
  contentKey: mockCourseRunKey,
  listPrice: {
    usd: 1,
    usdCents: 100,
  },
  redemptions: [],
  hasSuccessfulRedemption: false,
  redeemableSubsidyAccessPolicy: {
    uuid: 'test-access-policy-uuid',
    policyRedemptionUrl: 'https://enterprise-access.stage.edx.org/api/v1/policy-redemption/8c4a92c7-3578-407d-9ba1-9127c4e4cc0b/redeem/',
    isLateRedemptionAllowed: false,
    policyType: 'PerLearnerSpendCreditAccessPolicy',
    enterpriseCustomerUuid: mockEnterpriseCustomer.uuid,
    displayName: 'Learner driven plan --- Open Courses',
    description: 'Initial Policy Display Name: Learner driven plan --- Open Courses, Initial Policy Value: $10,000, Initial Subsidy Value: $260,000',
    active: true,
    retired: false,
    catalogUuid: 'test-catalog-uuid',
    subsidyUuid: 'test-subsidy-uuid',
    accessMethod: 'direct',
    spendLimit: 1000000,
    lateRedemptionAllowedUntil: null,
    perLearnerEnrollmentLimit: null,
    perLearnerSpendLimit: null,
    assignmentConfiguration: null,
  },
  canRedeem: true,
  reasons: [],
}];

describe('useCanUpgradeWithLearnerCredit', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchCanRedeem.mockResolvedValue(mockCanRedeemData);
  });
  it('should handle resolved value correctly', async () => {
    const {
      result,
      waitForNextUpdate,
    } = renderHook(() => useCanUpgradeWithLearnerCredit(mockCourseRunKey), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: {
          applicableSubsidyAccessPolicy: {
            ...mockCanRedeemData[0],
            listPrice: mockCanRedeemData[0].listPrice.usd,
            isPolicyRedemptionEnabled: true,
          },
        },
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
