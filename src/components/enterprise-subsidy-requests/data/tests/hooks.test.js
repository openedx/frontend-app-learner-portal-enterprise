import { renderHook } from '@testing-library/react-hooks';
import * as logger from '@edx/frontend-platform/logging';
import { SUBSIDY_TYPE } from '../../constants';
import { useSubsidyRequestConfiguration, useSubsidyRequests } from '../hooks';
import * as service from '../service';

jest.mock('../service');

describe('useSubsidyRequestConfiguration', () => {
  afterEach(() => jest.clearAllMocks());

  it('should fetch subsidy request configuration for the given enterprise', async () => {
    service.fetchSubsidyRequestConfiguration.mockResolvedValue({
      data: {
        subsidy_requests_enabled: true,
        subsidy_type: SUBSIDY_TYPE.COUPON,
      },
    });
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration('uuid'));
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
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration('uuid'));
    await waitForNextUpdate();
    expect(result.current.subsidyRequestConfiguration).toEqual(null);
  });

  it('handles any errors', async () => {
    const error = new Error('Something went wrong.');
    service.fetchSubsidyRequestConfiguration.mockRejectedValue(error);
    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequestConfiguration('uuid'));
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
            enterprise_customer_uuid: 'uuid',
          },
        ],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequests({
      subsidyRequestsEnabled: true,
      subsidyType: SUBSIDY_TYPE.COUPON,
      enterpriseCustomerUuid: 'uuid',
    }));
    await waitForNextUpdate();
    expect(service.fetchCouponCodeRequests).toHaveBeenCalledWith('uuid');
    expect(service.fetchLicenseRequests).not.toHaveBeenCalled();

    expect(result.current.couponCodeRequests).toEqual(
      [
        {
          lmsUserId: 1,
          enterpriseCustomerUuid: 'uuid',
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
            enterprise_customer_uuid: 'uuid',
          },
        ],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequests({
      subsidyRequestsEnabled: true,
      subsidyType: SUBSIDY_TYPE.COUPON,
      enterpriseCustomerUuid: 'uuid',
    }));
    await waitForNextUpdate();

    expect(service.fetchCouponCodeRequests).toHaveBeenCalledWith('uuid');
    expect(service.fetchLicenseRequests).not.toHaveBeenCalled();

    expect(result.current.couponCodeRequests).toEqual(
      [
        {
          lmsUserId: 1,
          enterpriseCustomerUuid: 'uuid',
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
            enterprise_customer_uuid: 'uuid',
          },
        ],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequests({
      subsidyRequestsEnabled: true,
      subsidyType: SUBSIDY_TYPE.LICENSE,
      enterpriseCustomerUuid: 'uuid',
    }));
    await waitForNextUpdate();

    expect(service.fetchCouponCodeRequests).not.toHaveBeenCalled();
    expect(service.fetchLicenseRequests).toHaveBeenCalledWith('uuid');

    expect(result.current.licenseRequests).toEqual(
      [
        {
          lmsUserId: 1,
          enterpriseCustomerUuid: 'uuid',
        },
      ],
    );

    expect(result.current.couponCodeRequests).toEqual([]);
  });
});
