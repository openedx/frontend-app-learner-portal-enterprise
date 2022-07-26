import { renderHook, act } from '@testing-library/react-hooks';
import * as logger from '@edx/frontend-platform/logging';
import { useCourseEnrollments, useCourseUpgradeData } from '../hooks';
import * as service from '../service';
import { COURSE_STATUSES } from '../constants';
import { transformCourseEnrollment } from '../utils';
import { createRawCourseEnrollment } from '../../tests/enrollment-testutils';
import { createEnrollWithLicenseUrl } from '../../../../../course/data/utils';

jest.mock('../service');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const mockCourseService = {
  fetchUserLicenseSubsidy: jest.fn(),
  fetchEnterpriseCustomerContainsContent: jest.fn(),
};

jest.mock('../../../../../course/data/service', () => ({
  __esModule: true,
  default: () => mockCourseService,
}));

const mockRawCourseEnrollment = createRawCourseEnrollment();
const mockTransformedMockCourseEnrollment = transformCourseEnrollment(mockRawCourseEnrollment);

describe('useCourseEnrollments', () => {
  it('should fetch and set course enrollments', async () => {
    service.fetchEnterpriseCourseEnrollments.mockResolvedValue({ data: [mockRawCourseEnrollment] });
    const args = {
      enterpriseUUID: 'uuid',
      requestedCourseEnrollments: [],
    };
    const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(args));
    await waitForNextUpdate();
    expect(service.fetchEnterpriseCourseEnrollments).toHaveBeenCalled();
    expect(result.current.courseEnrollmentsByStatus).toEqual({
      inProgress: [mockTransformedMockCourseEnrollment], upcoming: [], completed: [], savedForLater: [], requested: [],
    });
    expect(result.current.fetchError).toBeUndefined();
  });

  it('should set fetchError if an error occurs', async () => {
    const error = Error('something went wrong');
    service.fetchEnterpriseCourseEnrollments.mockRejectedValue(error);
    const args = {
      enterpriseUUID: 'uuid',
      requestedCourseEnrollments: [],
    };
    const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(args));
    await waitForNextUpdate();
    expect(result.current.fetchError).toBe(error);
  });

  describe('updateCourseEnrollmentStatus', () => {
    it('should move a course enrollment to the correct status group', async () => {
      service.fetchEnterpriseCourseEnrollments.mockResolvedValue({ data: [mockRawCourseEnrollment] });
      const args = {
        enterpriseUUID: 'uuid',
        requestedCourseEnrollments: [],
      };
      const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(args));
      await waitForNextUpdate();

      act(() => result.current.updateCourseEnrollmentStatus({
        courseRunId: mockRawCourseEnrollment.courseRunId,
        originalStatus: COURSE_STATUSES.inProgress,
        newStatus: COURSE_STATUSES.savedForLater,
        savedForLater: true,
      }));

      expect(result.current.courseEnrollmentsByStatus).toEqual(
        {
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

  describe('useCourseUpgradeData', () => {
    const courseRunKey = 'course-run-key';
    const enterpriseId = 'uuid';
    const subscriptionLicense = { uuid: 'license-uuid' };
    const location = { search: '' };
    const args = {
      courseRunKey,
      enterpriseId,
      subscriptionLicense,
      location,
    };

    afterEach(() => jest.clearAllMocks());

    it('should return an upgrade url if the course can be upgraded using a license', async () => {
      mockCourseService.fetchEnterpriseCustomerContainsContent.mockResolvedValueOnce(
        { data: { contains_content_items: true } },
      );
      mockCourseService.fetchUserLicenseSubsidy.mockResolvedValueOnce({
        data: {
          subsidy_id: 'subsidy-id',
        },
      });

      const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(args));

      expect(result.current.isLoading).toEqual(true);

      await waitForNextUpdate();

      expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
      expect(mockCourseService.fetchUserLicenseSubsidy).toHaveBeenCalledWith(courseRunKey);

      expect(result.current.upgradeUrl).toEqual(createEnrollWithLicenseUrl({
        courseRunKey,
        enterpriseId,
        licenseUUID: subscriptionLicense.uuid,
        location,
      }));
      expect(result.current.isLoading).toEqual(false);
    });

    it('should return undefined for upgrade url if the course is not part of the enterprise catalog', async () => {
      mockCourseService.fetchEnterpriseCustomerContainsContent.mockResolvedValueOnce(
        { data: { contains_content_items: false } },
      );

      const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(args));

      expect(result.current.isLoading).toEqual(true);

      await waitForNextUpdate();

      expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
      expect(mockCourseService.fetchUserLicenseSubsidy).not.toHaveBeenCalled();

      expect(result.current.upgradeUrl).toBeUndefined();
      expect(result.current.isLoading).toEqual(false);
    });

    it('should return undefined for upgrade url if fetchUserLicenseSubsidy returned undefined', async () => {
      mockCourseService.fetchEnterpriseCustomerContainsContent.mockResolvedValueOnce(
        { data: { contains_content_items: true } },
      );
      mockCourseService.fetchUserLicenseSubsidy.mockResolvedValueOnce({
        data: undefined,
      });

      const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(args));

      expect(result.current.isLoading).toEqual(true);

      await waitForNextUpdate();

      expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
      expect(mockCourseService.fetchUserLicenseSubsidy).toHaveBeenCalledWith(courseRunKey);

      expect(result.current.upgradeUrl).toBeUndefined();
      expect(result.current.isLoading).toEqual(false);
    });

    it('should handle errors', async () => {
      const error = Error('Uh oh');
      mockCourseService.fetchEnterpriseCustomerContainsContent.mockRejectedValueOnce(error);

      const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(args));

      expect(result.current.isLoading).toEqual(true);

      await waitForNextUpdate();

      expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
      expect(mockCourseService.fetchUserLicenseSubsidy).not.toHaveBeenCalled();
      expect();

      expect(result.current.upgradeUrl).toBeUndefined();
      expect(result.current.isLoading).toEqual(false);
      expect(logger.logError).toHaveBeenCalledWith(error);
    });
  });
});
