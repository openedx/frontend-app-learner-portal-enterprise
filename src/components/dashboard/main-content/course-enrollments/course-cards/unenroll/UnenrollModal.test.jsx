import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import { COURSE_STATUSES } from '../../../../../../constants';
import { unenrollFromCourse } from './data';
import { CourseEnrollmentsContext } from '../../CourseEnrollmentsContextProvider';

import UnenrollModal from './UnenrollModal';

jest.mock('./data', () => ({
  unenrollFromCourse: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const mockRemoveCourseEnrollment = jest.fn();
const defaultCourseEnrollmentsContextValue = {
  removeCourseEnrollment: mockRemoveCourseEnrollment,
};
const mockOnClose = jest.fn();
const mockOnSuccess = jest.fn();
const baseUnenrollModalProps = {
  courseRunId: 'course-v1:edX+DemoX+Demo',
  courseRunTitle: 'Demonstration Course',
  enrollmentType: COURSE_STATUSES.inProgress,
  isOpen: false,
  onClose: mockOnClose,
  onSuccess: mockOnSuccess,
};

const UnenrollModalWrapper = ({
  // eslint-disable-next-line react/prop-types
  courseEnrollmentsContextValue = defaultCourseEnrollmentsContextValue,
  ...props
}) => (
  <CourseEnrollmentsContext.Provider value={courseEnrollmentsContextValue}>
    <UnenrollModal {...props} />
  </CourseEnrollmentsContext.Provider>
);

describe('<UnenrollModal />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should remain closed when `isOpen` is false', () => {
    const props = {
      ...baseUnenrollModalProps,
    };
    const { container } = render(<UnenrollModalWrapper {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should be open when `isOpen` is true', () => {
    const props = {
      ...baseUnenrollModalProps,
      isOpen: true,
    };
    render(<UnenrollModalWrapper {...props} />);

    expect(screen.getByText('Confirm unenrollment')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Unenroll')).toBeInTheDocument();
  });

  test('should handle cancel click', async () => {
    const props = {
      ...baseUnenrollModalProps,
      isOpen: true,
    };
    render(<UnenrollModalWrapper {...props} />);
    userEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('should handle unenroll click', async () => {
    unenrollFromCourse.mockResolvedValueOnce();
    const props = {
      ...baseUnenrollModalProps,
      isOpen: true,
    };
    render(<UnenrollModalWrapper {...props} />);
    userEvent.click(screen.getByText('Unenroll'));

    await waitFor(() => {
      expect(mockRemoveCourseEnrollment).toHaveBeenCalledTimes(1);
      expect(mockRemoveCourseEnrollment).toHaveBeenCalledWith(
        expect.objectContaining({
          courseRunId: baseUnenrollModalProps.courseRunId,
          enrollmentType: baseUnenrollModalProps.enrollmentType,
        }),
      );
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
