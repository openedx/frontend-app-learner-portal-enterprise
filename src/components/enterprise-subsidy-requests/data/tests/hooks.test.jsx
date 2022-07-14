/* eslint-disable react/prop-types */
import { renderHook } from '@testing-library/react-hooks';
import * as logger from '@edx/frontend-platform/logging';
import { SUBSIDY_TYPE, SUBSIDY_REQUEST_STATE } from '../../constants';
import {
  useCatalogsForSubsidyRequests,
  useSubsidyRequestConfiguration,
  useSubsidyRequests,
} from '../hooks';
import * as service from '../service';
import * as couponsService from '../../../enterprise-user-subsidy/coupons/data/service';

const mockEmail = 'edx@example.com';
const mockenterpriseId = 'enterprise-uuid';

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
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration(mockenterpriseId));
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
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration(mockenterpriseId));
    await waitForNextUpdate();
    expect(result.current.subsidyRequestConfiguration).toEqual(null);
  });

  it('handles any errors', async () => {
    const error = new Error('Something went wrong.');
    service.fetchSubsidyRequestConfiguration.mockRejectedValue(error);
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration(mockenterpriseId));
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
            enterprise_customer_uuid: mockenterpriseId,
          },
        ],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequests({
      subsidyRequestsEnabled: true,
      subsidyType: SUBSIDY_TYPE.COUPON,
      enterpriseCustomerUuid: mockenterpriseId,
    }));
    await waitForNextUpdate();
    expect(service.fetchCouponCodeRequests).toHaveBeenCalledWith({
      enterpriseId: mockenterpriseId,
      userEmail: mockEmail,
      state: SUBSIDY_REQUEST_STATE.REQUESTED,
    });
    expect(service.fetchLicenseRequests).not.toHaveBeenCalled();

    expect(result.current.couponCodeRequests).toEqual(
      [
        {
          lmsUserId: 1,
          enterpriseCustomerUuid: mockenterpriseId,
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
            enterprise_customer_uuid: mockenterpriseId,
          },
        ],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequests({
      subsidyRequestsEnabled: true,
      subsidyType: SUBSIDY_TYPE.COUPON,
      enterpriseCustomerUuid: mockenterpriseId,
    }));
    await waitForNextUpdate();

    expect(service.fetchCouponCodeRequests).toHaveBeenCalledWith({
      enterpriseId: mockenterpriseId,
      userEmail: mockEmail,
      state: SUBSIDY_REQUEST_STATE.REQUESTED,
    });
    expect(service.fetchLicenseRequests).not.toHaveBeenCalled();

    expect(result.current.couponCodeRequests).toEqual(
      [
        {
          lmsUserId: 1,
          enterpriseCustomerUuid: mockenterpriseId,
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
            enterprise_customer_uuid: mockenterpriseId,
          },
        ],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequests({
      subsidyRequestsEnabled: true,
      subsidyType: SUBSIDY_TYPE.LICENSE,
      enterpriseCustomerUuid: mockenterpriseId,
    }));
    await waitForNextUpdate();

    expect(service.fetchCouponCodeRequests).not.toHaveBeenCalled();
    expect(service.fetchLicenseRequests).toHaveBeenCalledWith({
      enterpriseId: mockenterpriseId,
      userEmail: mockEmail,
      state: SUBSIDY_REQUEST_STATE.REQUESTED,
    });

    expect(result.current.licenseRequests).toEqual(
      [
        {
          lmsUserId: 1,
          enterpriseCustomerUuid: mockenterpriseId,
        },
      ],
    );

    expect(result.current.couponCodeRequests).toEqual([]);
  });
});

describe('useCatalogsForSubsidyRequests', () => {
  afterEach(() => jest.clearAllMocks());

  it('sets isLoading to false if there is no subsidy request configuration', () => {
    const { result } = renderHook(() => useCatalogsForSubsidyRequests({
      subsidyRequestConfiguration: null,
      isLoadingSubsidyRequestConfiguration: false,
      customerAgreementConfig: null,
    }));

    expect(result.current.isLoading).toBe(false);
  });

  it('fetches coupons overview and sets catalogs correctly if configured subsidy type is coupons', async () => {
    const mockCatalogUUIDs = ['uuid1', 'uuid2'];
    couponsService.fetchCouponsOverview.mockResolvedValue({
      data: {
        results: mockCatalogUUIDs.map(uuid => ({
          enterprise_catalog_uuid: uuid,
        })),
      },
    });
    const subsidyRequestConfiguration = {
      subsidyType: SUBSIDY_TYPE.COUPON,
      subsidyRequestsEnabled: true,
    };
    const { result, waitForNextUpdate } = renderHook(() => useCatalogsForSubsidyRequests({
      subsidyRequestConfiguration,
      isLoadingSubsidyRequestConfiguration: false,
      customerAgreementConfig: null,
    }));

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect([...result.current.catalogs]).toEqual(mockCatalogUUIDs);
  });

  it('does nothing if subsidy requests are not enabled', async () => {
    const { result } = renderHook(() => useCatalogsForSubsidyRequests({
      subsidyRequestConfiguration: {
        subsidyType: SUBSIDY_TYPE.COUPON,
        subsidyRequestsEnabled: false,
      },
      isLoadingSubsidyRequestConfiguration: false,
      customerAgreementConfig: null,
    }));

    expect(result.current.isLoading).toBe(false);
    expect(couponsService.fetchCouponsOverview).not.toHaveBeenCalled();
  });

  it('sets catalogs from subscription plans correctly if configured subsidy type is licenses', async () => {
    const mockCatalogUUIDs = ['uuid1', 'uuid2'];
    const subsidyRequestConfiguration = {
      subsidyType: SUBSIDY_TYPE.LICENSE,
      subsidyRequestsEnabled: true,
    };
    const { result } = renderHook(() => useCatalogsForSubsidyRequests({
      subsidyRequestConfiguration,
      isLoadingSubsidyRequestConfiguration: false,
      customerAgreementConfig: {
        subscriptions: mockCatalogUUIDs.map(uuid => ({
          enterpriseCatalogUuid: uuid,
        })),
      },
    }));

    expect(result.current.isLoading).toBe(false);
    expect([...result.current.catalogs]).toEqual(mockCatalogUUIDs);
  });
});
