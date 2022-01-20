import { renderHook, act } from '@testing-library/react-hooks';
import { useCourseEnrollments } from '../hooks';
import * as service from '../service';
import { COURSE_STATUSES } from '../constants';
import { transformCourseEnrollment } from '../utils';
import { createRawCourseEnrollment } from '../../tests/enrollment-testutils';

jest.mock('../service');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const mockRawCourseEnrollment = createRawCourseEnrollment();
const mockTransformedMockCourseEnrollment = transformCourseEnrollment(mockRawCourseEnrollment);

describe('useCourseEnrollments', () => {
  it('should fetch and set course enrollments', async () => {
    service.fetchEnterpriseCourseEnrollments.mockResolvedValue({ data: [mockRawCourseEnrollment] });

    const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments('uuid'));
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

    const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments('uuid'));
    await waitForNextUpdate();
    expect(result.current.fetchError).toBe(error);
  });

  describe('updateCourseEnrollmentStatus', () => {
    it('should move a course enrollment to the correct status group', async () => {
      service.fetchEnterpriseCourseEnrollments.mockResolvedValue({ data: [mockRawCourseEnrollment] });
      const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments('uuid'));
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
});
