/* eslint-disable react/prop-types */
import { renderHook } from '@testing-library/react-hooks';
import * as logger from '@edx/frontend-platform/logging';
import { SUBSIDY_TYPE, SUBSIDY_REQUEST_STATE } from '../../constants';
import {
  useCatalogsForSubsidyRequests,
  useSubsidyRequestConfiguration,
  useSubsidyRequests,
  useUserHasSubsidyRequestForCourse,
} from '../hooks';
import { SubsidyRequestsContext } from '../../SubsidyRequestsContextProvider';
import * as service from '../service';
import * as offersService from '../../../enterprise-user-subsidy/offers/data/service';

const mockEmail = 'edx@example.com';
const mockEnterpriseUUID = 'enterprise-uuid';

jest.mock('../service');
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedUser: () => ({ email: mockEmail }),
}));
jest.mock('../../../enterprise-user-subsidy/offers/data/service');

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

    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequests({
      subsidyRequestsEnabled: true,
      subsidyType: SUBSIDY_TYPE.COUPON,
      enterpriseCustomerUuid: mockEnterpriseUUID,
    }));
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

    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequests({
      subsidyRequestsEnabled: true,
      subsidyType: SUBSIDY_TYPE.COUPON,
      enterpriseCustomerUuid: mockEnterpriseUUID,
    }));
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

    const { result, waitForNextUpdate } = renderHook(() => useSubsidyRequests({
      subsidyRequestsEnabled: true,
      subsidyType: SUBSIDY_TYPE.LICENSE,
      enterpriseCustomerUuid: mockEnterpriseUUID,
    }));
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
    const { result } = renderHook(() => useCatalogsForSubsidyRequests({
      subsidyRequestConfiguration: null,
      isLoadingSubsidyRequestConfiguration: false,
      customerAgreementConfig: null,
    }));

    expect(result.current.isLoading).toBe(false);
  });

  it('fetches coupons overview and sets catalogs correctly if configured subsidy type is coupons', async () => {
    const mockCatalogUUIDs = ['uuid1', 'uuid2'];
    offersService.fetchCouponsOverview.mockResolvedValue({
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
    expect(offersService.fetchCouponsOverview).not.toHaveBeenCalled();
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

describe('useUserHasSubsidyRequestForCourse', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns false when `subsidyRequestConfiguration` are not set', () => {
    const context = {
      subsidyRequestConfiguration: null,
    };
    const wrapper = ({ children }) => (
      <SubsidyRequestsContext.Provider value={context}>
        {children}
      </SubsidyRequestsContext.Provider>
    );
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse(), { wrapper });
    expect(result.current).toBe(false);
  });

  it('returns false when `subsidyType` is undefined', () => {
    const context = {
      subsidyRequestConfiguration: { subsidyType: undefined },
      requestsBySubsidyType: {
        [SUBSIDY_TYPE.LICENSE]: [],
        [SUBSIDY_TYPE.COUPON]: [],
      },
    };
    const wrapper = ({ children }) => (
      <SubsidyRequestsContext.Provider value={context}>{children}</SubsidyRequestsContext.Provider>
    );
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse(), { wrapper });
    expect(result.current).toBe(false);
  });

  it('returns true when `subsidyType` is LICENSE && 1 license request is found', () => {
    const context = {
      subsidyRequestConfiguration: {
        subsidyRequestsEnabled: true,
        subsidyType: SUBSIDY_TYPE.LICENSE,
      },
      requestsBySubsidyType: {
        [SUBSIDY_TYPE.LICENSE]: [{ state: SUBSIDY_REQUEST_STATE.REQUESTED }],
        [SUBSIDY_TYPE.COUPON]: [],
      },
    };
    const wrapper = ({ children }) => (
      <SubsidyRequestsContext.Provider value={context}>{children}</SubsidyRequestsContext.Provider>
    );
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse(), { wrapper });
    expect(result.current).toBe(true);
  });

  it('returns true when `subsidyType` is COUPON && 1 coupon request is found', () => {
    const courseId = '123';
    const context = {
      subsidyRequestConfiguration: {
        subsidyRequestsEnabled: true,
        subsidyType: SUBSIDY_TYPE.COUPON,
      },
      requestsBySubsidyType: {
        [SUBSIDY_TYPE.LICENSE]: [],
        [SUBSIDY_TYPE.COUPON]: [{ state: SUBSIDY_REQUEST_STATE.REQUESTED, courseId }],
      },
    };
    const wrapper = ({ children }) => (
      <SubsidyRequestsContext.Provider value={context}>{children}</SubsidyRequestsContext.Provider>
    );
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse(courseId), { wrapper });
    expect(result.current).toBe(true);
  });

  it('returns false when `subsidyType` is COUPON && no matching courseId', () => {
    const context = {
      subsidyRequestConfiguration: {
        subsidyRequestsEnabled: true,
        subsidyType: SUBSIDY_TYPE.COUPON,
      },
      requestsBySubsidyType: {
        [SUBSIDY_TYPE.LICENSE]: [],
        [SUBSIDY_TYPE.COUPON]: [{ state: SUBSIDY_REQUEST_STATE.REQUESTED, courseId: 'lorem' }],
      },
    };
    const wrapper = ({ children }) => (
      <SubsidyRequestsContext.Provider value={context}>{children}</SubsidyRequestsContext.Provider>
    );
    const { result } = renderHook(() => useUserHasSubsidyRequestForCourse('ipsum'), { wrapper });
    expect(result.current).toBe(false);
  });
});
