import { AppContext } from '@edx/frontend-platform/react';
import { renderHook } from '@testing-library/react-hooks';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import useSubscriptions from './useSubscriptions';
import useHasAvailableSubsidiesOrRequests from './useHasAvailableSubsidiesOrRequests';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useBrowseAndRequest from './useBrowseAndRequest';
import useCouponCodes from './useCouponCodes';
import useRedeemablePolicies from './useRedeemablePolicies';
import useEnterpriseOffers from './useEnterpriseOffers';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';

jest.mock('./useEnterpriseCustomer');
jest.mock('./useSubscriptions');
jest.mock('./useBrowseAndRequest');
jest.mock('./useCouponCodes');
jest.mock('./useRedeemablePolicies');
jest.mock('./useEnterpriseOffers');

const appContextValue = {
  authenticatedUser: authenticatedUserFactory(),
};

const wrapper = ({ children }) => (
  <AppContext.Provider value={appContextValue}>
    {children}
  </AppContext.Provider>
);

const mockEnterpriseCustomer = enterpriseCustomerFactory();

const mockEndDateTimeOneDayOff = dayjs().add(1, 'day').toISOString();
const mockEndDateTimeTwoDaysOff = dayjs().add(2, 'day').toISOString();

describe('useHasAvailableSubsidiesOrRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useSubscriptions.mockReturnValue({
      data: {
        subscriptionLicense: undefined,
        subscriptionPlan: undefined,
        shouldShowActivationSuccessMessage: false,
      },
    });
    useBrowseAndRequest.mockReturnValue({
      data: {
        requests: {
          subscriptionLicenses: [],
          couponCodes: [],
        },
      },
    });
    useRedeemablePolicies.mockReturnValue({
      data: {
        expiredPolicies: [],
        unexpiredPolicies: [],
        redeemablePolicies: [],
        learnerContentAssignments: null,
      },
    });
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [],
        couponCodeRedemptionCount: 0,
      },
    });
    useEnterpriseOffers.mockReturnValue({ data: { enterpriseOffers: [] } });
  });
  it('returns an object with false and undefined values when no data is returned', () => {
    const { result } = renderHook(() => useHasAvailableSubsidiesOrRequests(), { wrapper });
    expect(result.current).toEqual({
      hasActiveLicenseOrLicenseRequest: false,
      hasAssignedCodesOrCodeRequests: false,
      hasAvailableLearnerCreditPolicies: false,
      hasAvailableSubsidyOrRequests: undefined,
      learnerCreditSummaryCardData: undefined,
    });
  });
  it.each([
    {
      mockEnterpriseOffers: { currentEnterpriseOffers: [] },
      mockRedeemableLearnerCreditPolicies: {
        expiredPolicies: [],
        unexpiredPolicies: [],
        redeemablePolicies: [],
        learnerContentAssignments: null,
      },
      mockSubscriptions: {
        subscriptionLicense: {
          status: LICENSE_STATUS.ACTIVATED,
        },
        subscriptionPlan: undefined,
        shouldShowActivationSuccessMessage: false,
      },
      mockBrowseAndRequests: {
        requests: {
          subscriptionLicenses: [],
          couponCodes: [],
        },
      },
      mockCouponCodes: {
        couponCodeAssignments: [],
        couponCodeRedemptionCount: 0,
      },
      expectedResult: {
        hasActiveLicenseOrLicenseRequest: true,
        hasAssignedCodesOrCodeRequests: false,
        hasAvailableLearnerCreditPolicies: false,
        hasAvailableSubsidyOrRequests: true,
        learnerCreditSummaryCardData: undefined,
      },
    },
    {
      mockEnterpriseOffers: { currentEnterpriseOffers: [] },
      mockRedeemableLearnerCreditPolicies: {
        expiredPolicies: [],
        unexpiredPolicies: [],
        redeemablePolicies: [],
        learnerContentAssignments: null,
      },
      mockSubscriptions: {
        subscriptionLicense: {
          status: LICENSE_STATUS.ASSIGNED,
        },
        subscriptionPlan: undefined,
        shouldShowActivationSuccessMessage: false,
      },
      mockBrowseAndRequests: {
        requests: {
          subscriptionLicenses: [uuidv4()],
          couponCodes: [],
        },
      },
      mockCouponCodes: {
        couponCodeAssignments: [],
        couponCodeRedemptionCount: 0,
      },
      expectedResult: {
        hasActiveLicenseOrLicenseRequest: true,
        hasAssignedCodesOrCodeRequests: false,
        hasAvailableLearnerCreditPolicies: false,
        hasAvailableSubsidyOrRequests: true,
        learnerCreditSummaryCardData: undefined,
      },
    },
    {
      mockEnterpriseOffers: { currentEnterpriseOffers: [] },
      mockRedeemableLearnerCreditPolicies: {
        expiredPolicies: [],
        unexpiredPolicies: [],
        redeemablePolicies: [],
        learnerContentAssignments: null,
      },
      mockSubscriptions: {
        subscriptionLicense: undefined,
        subscriptionPlan: undefined,
        shouldShowActivationSuccessMessage: false,
      },
      mockBrowseAndRequests: {
        requests: {
          subscriptionLicenses: [],
          couponCodes: [],
        },
      },
      mockCouponCodes: {
        couponCodeAssignments: [{
          code: '23EHKQE2PDOTTHGT',
          redemptions_remaining: 3,
        }],
        couponCodeRedemptionCount: 3,
      },
      expectedResult: {
        hasActiveLicenseOrLicenseRequest: false,
        hasAssignedCodesOrCodeRequests: true,
        hasAvailableLearnerCreditPolicies: false,
        hasAvailableSubsidyOrRequests: true,
        learnerCreditSummaryCardData: undefined,
      },
    },
    {
      mockEnterpriseOffers: { currentEnterpriseOffers: [] },
      mockRedeemableLearnerCreditPolicies: {
        expiredPolicies: [],
        unexpiredPolicies: [],
        redeemablePolicies: [],
        learnerContentAssignments: null,
      },
      mockSubscriptions: {
        subscriptionLicense: undefined,
        subscriptionPlan: undefined,
        shouldShowActivationSuccessMessage: false,
      },
      mockBrowseAndRequests: {
        requests: {
          subscriptionLicenses: [],
          couponCodes: [uuidv4()],
        },
      },
      mockCouponCodes: {
        couponCodeAssignments: [],
        couponCodeRedemptionCount: 0,
      },
      expectedResult: {
        hasActiveLicenseOrLicenseRequest: false,
        hasAssignedCodesOrCodeRequests: true,
        hasAvailableLearnerCreditPolicies: false,
        hasAvailableSubsidyOrRequests: true,
        learnerCreditSummaryCardData: undefined,
      },
    },
    {
      mockEnterpriseOffers: {
        currentEnterpriseOffers: [{
          isCurrent: true,
          endDatetime: mockEndDateTimeOneDayOff,
          startDatetime: dayjs().subtract(1, 'day').toISOString(),
        },
        {
          isCurrent: true,
          endDatetime: mockEndDateTimeTwoDaysOff,
          startDatetime: dayjs().subtract(1, 'day').toISOString(),
        }],
      },
      mockRedeemableLearnerCreditPolicies: {
        expiredPolicies: [],
        unexpiredPolicies: [],
        redeemablePolicies: [],
        learnerContentAssignments: null,
      },
      mockSubscriptions: {
        subscriptionLicense: undefined,
        subscriptionPlan: undefined,
        shouldShowActivationSuccessMessage: false,
      },
      mockBrowseAndRequests: {
        requests: {
          subscriptionLicenses: [],
          couponCodes: [],
        },
      },
      mockCouponCodes: {
        couponCodeAssignments: [],
        couponCodeRedemptionCount: 0,
      },
      expectedResult: {
        hasActiveLicenseOrLicenseRequest: false,
        hasAssignedCodesOrCodeRequests: false,
        hasAvailableLearnerCreditPolicies: false,
        hasAvailableSubsidyOrRequests: {
          expirationDate: mockEndDateTimeOneDayOff,
        },
        learnerCreditSummaryCardData: {
          expirationDate: mockEndDateTimeOneDayOff,
        },
      },
    },
    {
      mockEnterpriseOffers: {
        currentEnterpriseOffers: [{
          isCurrent: true,
          endDatetime: mockEndDateTimeOneDayOff,
          startDatetime: dayjs().subtract(1, 'day').toISOString(),
        },
        {
          isCurrent: true,
          endDatetime: mockEndDateTimeTwoDaysOff,
          startDatetime: dayjs().subtract(1, 'day').toISOString(),
        }],
      },
      mockRedeemableLearnerCreditPolicies: {
        learnerContentAssignments: null,
        expiredPolicies: [],
        unexpiredPolicies: [
          {
            active: true,
            subsidyExpirationDate: mockEndDateTimeOneDayOff,
          },
          {
            active: true,
            subsidyExpirationDate: mockEndDateTimeTwoDaysOff,
          },
        ],
        redeemablePolicies: [
          {
            active: true,
            subsidyExpirationDate: mockEndDateTimeOneDayOff,
          },
          {
            active: true,
            subsidyExpirationDate: mockEndDateTimeTwoDaysOff,
          },
        ],
      },
      mockSubscriptions: {
        subscriptionLicense: undefined,
        subscriptionPlan: undefined,
        shouldShowActivationSuccessMessage: false,
      },
      mockBrowseAndRequests: {
        requests: {
          subscriptionLicenses: [],
          couponCodes: [],
        },
      },
      mockCouponCodes: {
        couponCodeAssignments: [],
        couponCodeRedemptionCount: 0,
      },
      expectedResult: {
        hasActiveLicenseOrLicenseRequest: false,
        hasAssignedCodesOrCodeRequests: false,
        hasAvailableLearnerCreditPolicies: true,
        hasAvailableSubsidyOrRequests: {
          expirationDate: mockEndDateTimeOneDayOff,
        },
        learnerCreditSummaryCardData: {
          expirationDate: mockEndDateTimeOneDayOff,
        },
      },
    },
  ])('returns true for hasAvailableSubsidyOrRequests (%s)', ({
    mockEnterpriseOffers,
    mockRedeemableLearnerCreditPolicies,
    mockSubscriptions,
    mockBrowseAndRequests,
    mockCouponCodes,
    expectedResult,
  }) => {
    useSubscriptions.mockReturnValue({ data: mockSubscriptions });
    useBrowseAndRequest.mockReturnValue({ data: mockBrowseAndRequests });
    useRedeemablePolicies.mockReturnValue({ data: mockRedeemableLearnerCreditPolicies });
    useCouponCodes.mockReturnValue({ data: mockCouponCodes });
    useEnterpriseOffers.mockReturnValue({ data: mockEnterpriseOffers });

    const { result } = renderHook(() => useHasAvailableSubsidiesOrRequests(), { wrapper });

    expect(result.current).toEqual(expectedResult);
  });
});
