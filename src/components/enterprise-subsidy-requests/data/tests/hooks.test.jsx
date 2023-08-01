import { renderHook } from '@testing-library/react-hooks';
import * as logger from '@edx/frontend-platform/logging';
import { SUBSIDY_TYPE, SUBSIDY_REQUEST_STATE } from '../../constants';
import {
  useCatalogsForSubsidyRequests,
  useSubsidyRequestConfiguration,
  useSubsidyRequests,
} from '../hooks';
import * as service from '../service';

const mockEmail = 'edx@example.com';
const mockEnterpriseUUID = 'enterprise-uuid';

jest.mock('../service');
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ email: mockEmail }),
}));
jest.mock('../../../enterprise-user-subsidy/coupons/data/service');

describe('useSubsidyRequestConfiguration', () => {
  afterEach(() => jest.clearAllMocks());

  it('should fetch subsidy request configuration for the given enterprise', async () => {
    service.fetchSubsidyRequestConfiguration.mockResolvedValue({
      data: {
        subsidy_requests_enabled: true,
        subsidy_type: SUBSIDY_TYPE.COUPON,
      },
    });
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration(mockEnterpriseUUID));
    await waitForNextUpdate();
    expect(result.current.subsidyRequestConfiguration).toEqual({
      subsidyRequestsEnabled: true,
      subsidyType: SUBSIDY_TYPE.COUPON,
    });
  });

  it('sets subsidyRequestConfiguration to null if customer configuration does not exist', async () => {
    const error = new Error('Something went wrong.');
    error.customAttributes = {
      httpErrorStatus: 404,
    };
    service.fetchSubsidyRequestConfiguration.mockRejectedValue(error);
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration(mockEnterpriseUUID));
    await waitForNextUpdate();
    expect(result.current.subsidyRequestConfiguration).toEqual(null);
  });

  it('handles any errors', async () => {
    const error = new Error('Something went wrong.');
    service.fetchSubsidyRequestConfiguration.mockRejectedValue(error);
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration(mockEnterpriseUUID));
    await waitForNextUpdate();
    expect(result.current.subsidyRequestConfiguration).toEqual(undefined);
    expect(logger.logError).toHaveBeenCalledWith(error);
  });
});

describe('useSubsidyRequests', () => {
  afterEach(() => jest.clearAllMocks());

  it.each([null, {
    subsidyRequestsEnabled: false,
  }, {
    subsidyRequestsEnabled: true,
    subsidyType: undefined,
  }])('should not do anything if subsidy requests are disabled', async (subsidyRequestsConfiguration) => {
    renderHook(() => useSubsidyRequests(subsidyRequestsConfiguration));
    expect(service.fetchCouponCodeRequests).not.toHaveBeenCalled();
    expect(service.fetchLicenseRequests).not.toHaveBeenCalled();
  });

  it('should fetch coupon code requests', async () => {
    service.fetchCouponCodeRequests.mockResolvedValue({
      data: {
        results: [
          {
            lms_user_id: 1,
            enterprise_customer_uuid: mockEnterpriseUUID,
          },
        ],
      },
    });

    const args = {
      subsidyRequestsEnabled: true,
      subsidyType: SUBSIDY_TYPE.COUPON,
      enterpriseCustomerUuid: mockEnterpriseUUID,
    };
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequests(args));
    await waitForNextUpdate();
    expect(service.fetchCouponCodeRequests).toHaveBeenCalledWith({
      enterpriseUUID: mockEnterpriseUUID,
      userEmail: mockEmail,
      state: SUBSIDY_REQUEST_STATE.REQUESTED,
    });
    expect(service.fetchLicenseRequests).not.toHaveBeenCalled();

    expect(result.current.couponCodeRequests).toEqual(
      [
        {
          lmsUserId: 1,
          enterpriseCustomerUuid: mockEnterpriseUUID,
        },
      ],
    );
  });

  it('should fetch coupon code requests', async () => {
    service.fetchCouponCodeRequests.mockResolvedValue({
      data: {
        results: [
          {
            lms_user_id: 1,
            enterprise_customer_uuid: mockEnterpriseUUID,
          },
        ],
      },
    });

    const args = {
      subsidyRequestsEnabled: true,
      subsidyType: SUBSIDY_TYPE.COUPON,
      enterpriseCustomerUuid: mockEnterpriseUUID,
    };
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequests(args));
    await waitForNextUpdate();

    expect(service.fetchCouponCodeRequests).toHaveBeenCalledWith({
      enterpriseUUID: mockEnterpriseUUID,
      userEmail: mockEmail,
      state: SUBSIDY_REQUEST_STATE.REQUESTED,
    });
    expect(service.fetchLicenseRequests).not.toHaveBeenCalled();

    expect(result.current.couponCodeRequests).toEqual(
      [
        {
          lmsUserId: 1,
          enterpriseCustomerUuid: mockEnterpriseUUID,
        },
      ],
    );

    expect(result.current.licenseRequests).toEqual([]);
  });

  it('should fetch license requests', async () => {
    service.fetchLicenseRequests.mockResolvedValue({
      data: {
        results: [
          {
            lms_user_id: 1,
            enterprise_customer_uuid: mockEnterpriseUUID,
          },
        ],
      },
    });

    const args = {
      subsidyRequestsEnabled: true,
      subsidyType: SUBSIDY_TYPE.LICENSE,
      enterpriseCustomerUuid: mockEnterpriseUUID,
    };
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequests(args));
    await waitForNextUpdate();

    expect(service.fetchCouponCodeRequests).not.toHaveBeenCalled();
    expect(service.fetchLicenseRequests).toHaveBeenCalledWith({
      enterpriseUUID: mockEnterpriseUUID,
      userEmail: mockEmail,
      state: SUBSIDY_REQUEST_STATE.REQUESTED,
    });

    expect(result.current.licenseRequests).toEqual(
      [
        {
          lmsUserId: 1,
          enterpriseCustomerUuid: mockEnterpriseUUID,
        },
      ],
    );

    expect(result.current.couponCodeRequests).toEqual([]);
  });
});

describe('useCatalogsForSubsidyRequests', () => {
  afterEach(() => jest.clearAllMocks());

  it('sets isLoading to false if there is no subsidy request configuration', () => {
    const args = {
      subsidyRequestConfiguration: null,
      isLoadingSubsidyRequestConfiguration: false,
      customerAgreementConfig: null,
    };
    const { result } = renderHook(() => useCatalogsForSubsidyRequests(args));

    expect(result.current.isLoading).toBe(false);
  });

  it('fetches coupons overview and sets catalogs correctly if configured subsidy type is coupons', () => {
    const mockCatalogUUIDs = ['uuid1', 'uuid2'];
    const subsidyRequestConfiguration = {
      subsidyType: SUBSIDY_TYPE.COUPON,
      subsidyRequestsEnabled: true,
    };
    const args = {
      subsidyRequestConfiguration,
      isLoadingSubsidyRequestConfiguration: false,
      customerAgreementConfig: null,
      couponsOverview: mockCatalogUUIDs.map(uuid => ({
        enterpriseCatalogUuid: uuid,
        available: true,
      })),
    };
    const { result } = renderHook(() => useCatalogsForSubsidyRequests(args));

    expect(result.current.isLoading).toBe(false);
    expect([...result.current.catalogs]).toEqual(mockCatalogUUIDs);
  });

  it('does nothing if subsidy requests are not enabled', async () => {
    const args = {
      subsidyRequestConfiguration: {
        subsidyType: SUBSIDY_TYPE.COUPON,
        subsidyRequestsEnabled: false,
      },
      isLoadingSubsidyRequestConfiguration: false,
      customerAgreementConfig: null,
    };
    const { result } = renderHook(() => useCatalogsForSubsidyRequests(args));

    expect(result.current.isLoading).toBe(false);
    expect([...result.current.catalogs]).toEqual([]);
  });

  it('sets catalogs from subscription plans correctly if configured subsidy type is licenses', async () => {
    const mockCatalogUUIDs = ['uuid1', 'uuid2'];
    const subsidyRequestConfiguration = {
      subsidyType: SUBSIDY_TYPE.LICENSE,
      subsidyRequestsEnabled: true,
    };
    const args = {
      subsidyRequestConfiguration,
      isLoadingSubsidyRequestConfiguration: false,
      customerAgreementConfig: {
        subscriptions: mockCatalogUUIDs.map(uuid => ({
          enterpriseCatalogUuid: uuid,
          daysUntilExpirationIncludingRenewals: 123,
        })),
      },
    };
    const { result } = renderHook(() => useCatalogsForSubsidyRequests(args));

    expect(result.current.isLoading).toBe(false);
    expect([...result.current.catalogs]).toEqual(mockCatalogUUIDs);
  });
});
