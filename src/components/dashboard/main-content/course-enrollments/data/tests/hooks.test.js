import { renderHook, act } from '@testing-library/react-hooks';
import * as logger from '@edx/frontend-platform/logging';
import camelCase from 'lodash.camelcase';
import dayjs from 'dayjs';

import { useCourseEnrollments, useCourseUpgradeData } from '../hooks';
import * as service from '../service';
import { COURSE_STATUSES } from '../constants';
import { transformCourseEnrollment } from '../utils';
import { createRawCourseEnrollment } from '../../tests/enrollment-testutils';
import { createEnrollWithLicenseUrl, createEnrollWithCouponCodeUrl } from '../../../../../course/data/utils';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(() => ({
    state: {
      course: {
        entitlements: {
          mode: 'paid-executive-education',
          price: '820.00',
          currency: 'USD',
          sku: '821D85D',
          expires: null,
        },
      },
    },
  })),
}));

jest.mock('../service');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const mockCourseService = {
  fetchUserLicenseSubsidy: jest.fn(),
  fetchEnterpriseCustomerContainsContent: jest.fn(),
  fetchCourseRun: jest.fn(),
};

jest.mock('../../../../../course/data/service', () => ({
  __esModule: true,
  default: jest.fn(() => mockCourseService),
}));

const mockRawCourseEnrollment = createRawCourseEnrollment();
const mockTransformedMockCourseEnrollment = transformCourseEnrollment(mockRawCourseEnrollment);

describe('useCourseEnrollments', () => {
  it('should fetch and set course enrollments', async () => {
    service.fetchEnterpriseCourseEnrollments.mockResolvedValue({ data: [mockRawCourseEnrollment] });
    const basicArgs = {
      enterpriseUUID: 'uuid',
      requestedCourseEnrollments: [],
    };
    const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(basicArgs));
    await waitForNextUpdate();
    expect(service.fetchEnterpriseCourseEnrollments).toHaveBeenCalled();
    expect(result.current.courseEnrollmentsByStatus).toEqual({
      inProgress: [mockTransformedMockCourseEnrollment],
      upcoming: [],
      completed: [],
      savedForLater: [],
      requested: [],
      assigned: [],
    });
    expect(result.current.fetchError).toBeUndefined();
  });

  it('should set fetchError if an error occurs', async () => {
    const error = Error('something went wrong');
    service.fetchEnterpriseCourseEnrollments.mockRejectedValue(error);
    const basicArgs = {
      enterpriseUUID: 'uuid',
      requestedCourseEnrollments: [],
    };
    const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(basicArgs));
    await waitForNextUpdate();
    expect(result.current.fetchError).toBe(error);
  });

  describe('updateCourseEnrollmentStatus', () => {
    it('should move a course enrollment to the correct status group', async () => {
      service.fetchEnterpriseCourseEnrollments.mockResolvedValue({ data: [mockRawCourseEnrollment] });
      const basicArgs = {
        enterpriseUUID: 'uuid',
        requestedCourseEnrollments: [],
      };
      const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(basicArgs));
      await waitForNextUpdate();

      act(() => result.current.updateCourseEnrollmentStatus({
        courseRunId: mockRawCourseEnrollment.courseRunId,
        originalStatus: COURSE_STATUSES.inProgress,
        newStatus: COURSE_STATUSES.savedForLater,
        savedForLater: true,
      }));

      expect(result.current.courseEnrollmentsByStatus).toEqual(
        {
          assigned: [],
          inProgress: [],
          upcoming: [],
          completed: [],
          savedForLater: [{
            ...mockTransformedMockCourseEnrollment,
            courseRunStatus: COURSE_STATUSES.savedForLater,
            savedForLater: true,
          }],
          requested: [],
        },
      );
    });
  });

  describe('removeCourseEnrollment', () => {
    it('should remove a course enrollment', async () => {
      service.fetchEnterpriseCourseEnrollments.mockResolvedValue({ data: [mockRawCourseEnrollment] });
      const basicArgs = {
        enterpriseUUID: 'uuid',
        requestedCourseEnrollments: [],
      };
      const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(basicArgs));
      await waitForNextUpdate();

      expect(result.current.courseEnrollmentsByStatus.inProgress).toHaveLength(1);

      act(() => result.current.removeCourseEnrollment({
        courseRunId: mockRawCourseEnrollment.courseRunId,
        enrollmentType: camelCase(mockRawCourseEnrollment.courseRunStatus),
      }));

      expect(result.current.courseEnrollmentsByStatus).toEqual(
        {
          assigned: [],
          inProgress: [],
          upcoming: [],
          completed: [],
          savedForLater: [],
          requested: [],
        },
      );
    });
  });

  describe('useCourseUpgradeData', () => {
    const courseRunKey = 'course-run-key';
    const enterpriseId = 'uuid';
    const subscriptionLicense = { uuid: 'license-uuid' };
    const location = { search: '' };
    const basicArgs = {
      courseRunKey,
      enterpriseId,
      subscriptionLicense,
      couponCodes: [],
      location,
    };

    afterEach(() => jest.clearAllMocks());

    it('should return undefined for upgrade urls if the course is not part of the enterprise catalog', async () => {
      mockCourseService.fetchEnterpriseCustomerContainsContent.mockResolvedValueOnce(
        { data: { contains_content_items: false } },
      );

      const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(basicArgs));

      expect(result.current.isLoading).toEqual(true);

      await waitForNextUpdate();

      expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
      expect(mockCourseService.fetchUserLicenseSubsidy).not.toHaveBeenCalled();

      expect(result.current.licenseUpgradeUrl).toBeUndefined();
      expect(result.current.couponUpgradeUrl).toBeUndefined();
      expect(result.current.courseRunPrice).toBeUndefined();
      expect(result.current.isLoading).toEqual(false);
    });

    describe('upgradeable via license', () => {
      it('should return a license upgrade url', async () => {
        mockCourseService.fetchEnterpriseCustomerContainsContent.mockResolvedValueOnce(
          { data: { contains_content_items: true } },
        );
        mockCourseService.fetchUserLicenseSubsidy.mockResolvedValueOnce({
          data: {
            subsidy_id: 'subsidy-id',
          },
        });

        const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(basicArgs));

        expect(result.current.isLoading).toEqual(true);

        await waitForNextUpdate();

        expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
        expect(mockCourseService.fetchUserLicenseSubsidy).toHaveBeenCalledWith(courseRunKey);

        expect(result.current.licenseUpgradeUrl).toEqual(createEnrollWithLicenseUrl({
          courseRunKey,
          enterpriseId,
          licenseUUID: subscriptionLicense.uuid,
          location,
        }));
        expect(result.current.couponUpgradeUrl).toBeUndefined();
        expect(result.current.courseRunPrice).toBeUndefined();
        expect(result.current.isLoading).toEqual(false);
      });

      it('should return undefined for licenseUpgradeUrl upgrade url if fetchUserLicenseSubsidy returned undefined', async () => {
        mockCourseService.fetchEnterpriseCustomerContainsContent.mockResolvedValueOnce(
          { data: { contains_content_items: true } },
        );
        mockCourseService.fetchUserLicenseSubsidy.mockResolvedValueOnce({
          data: undefined,
        });

        const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(basicArgs));

        expect(result.current.isLoading).toEqual(true);

        await waitForNextUpdate();

        expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
        expect(mockCourseService.fetchUserLicenseSubsidy).toHaveBeenCalledWith(courseRunKey);

        expect(result.current.upgradeUrl).toBeUndefined();
        expect(result.current.couponUpgradeUrl).toBeUndefined();
        expect(result.current.courseRunPrice).toBeUndefined();
        expect(result.current.isLoading).toEqual(false);
      });
    });

    describe('upgradeable via coupon', () => {
      const mockCouponCode = {
        code: 'coupon-code',
        catalog: 'catalog-1',
        couponStartDate: dayjs().subtract(1, 'w').toISOString(),
        couponEndDate: dayjs().add(8, 'w').toISOString(),
      };

      it('should return a coupon upgrade url', async () => {
        mockCourseService.fetchEnterpriseCustomerContainsContent.mockResolvedValueOnce(
          { data: { contains_content_items: true, catalog_list: [mockCouponCode.catalog] } },
        );
        const sku = 'ABCDEF';
        const coursePrice = '149.00';

        mockCourseService.fetchCourseRun.mockResolvedValueOnce(
          {
            data: {
              firstEnrollablePaidSeatPrice: coursePrice,
              seats: [
                {
                  type: 'verified',
                  price: coursePrice,
                  sku,
                },
                {
                  type: 'audit',
                  price: '0.00',
                  sku: 'abcdef',
                },
              ],
            },
          },
        );

        const args = {
          ...basicArgs,
          subscriptionLicense: undefined,
          couponCodes: [mockCouponCode],
        };

        const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(args));

        expect(result.current.isLoading).toEqual(true);

        await waitForNextUpdate();

        expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
        expect(mockCourseService.fetchUserLicenseSubsidy).not.toHaveBeenCalled();
        expect(mockCourseService.fetchCourseRun).toHaveBeenCalledWith(courseRunKey);
        expect(result.current.licenseUpgradeUrl).toBeUndefined();
        expect(result.current.couponUpgradeUrl).toEqual(createEnrollWithCouponCodeUrl({
          courseRunKey,
          sku,
          code: mockCouponCode.code,
          location,
        }));
        expect(result.current.courseRunPrice).toEqual(coursePrice);
        expect(result.current.isLoading).toEqual(false);
      });
    });

    it('should handle errors', async () => {
      const error = Error('Uh oh');
      mockCourseService.fetchEnterpriseCustomerContainsContent.mockRejectedValueOnce(error);

      const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(basicArgs));

      expect(result.current.isLoading).toEqual(true);

      await waitForNextUpdate();

      expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
      expect(mockCourseService.fetchUserLicenseSubsidy).not.toHaveBeenCalled();

      expect(result.current.upgradeUrl).toBeUndefined();
      expect(result.current.isLoading).toEqual(false);
      expect(logger.logError).toHaveBeenCalledWith(error);
    });
  });
});
