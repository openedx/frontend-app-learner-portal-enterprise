import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/extend-expect';

import { COURSE_STATUSES } from '../../../../../../constants';
import { unenrollFromCourse } from './data';
import UnenrollModal from './UnenrollModal';
import { ToastsContext } from '../../../../../Toasts';
import { queryEnterpriseCourseEnrollments, useEnterpriseCustomer } from '../../../../../app/data';
import { queryClient } from '../../../../../../utils/tests';
import { enterpriseCourseEnrollmentFactory, enterpriseCustomerFactory } from '../../../../../app/data/services/data/__factories__';

jest.mock('./data', () => ({
  unenrollFromCourse: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCourseEnrollment = enterpriseCourseEnrollmentFactory();

const mockOnClose = jest.fn();
const mockOnSuccess = jest.fn();
const baseUnenrollModalProps = {
  courseRunId: mockEnterpriseCourseEnrollment.courseRunId,
  courseRunTitle: mockEnterpriseCourseEnrollment.displayName,
  enrollmentType: COURSE_STATUSES.inProgress,
  isOpen: false,
  onClose: mockOnClose,
  onSuccess: mockOnSuccess,
};

const mockAddToast = jest.fn();

let mockQueryClient;
const UnenrollModalWrapper = ({ ...props }) => {
  mockQueryClient = queryClient();
  mockQueryClient.setQueryData(
    queryEnterpriseCourseEnrollments(mockEnterpriseCustomer.uuid).queryKey,
    [mockEnterpriseCourseEnrollment],
  );
  return (
    <QueryClientProvider client={mockQueryClient}>
      <ToastsContext.Provider value={{ addToast: mockAddToast }}>
        <UnenrollModal {...props} />
      </ToastsContext.Provider>
    </QueryClientProvider>
  );
};

describe('<UnenrollModal />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
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

    expect(screen.getByText('Unenroll from course?')).toBeInTheDocument();
    expect(screen.getByText('Keep learning')).toBeInTheDocument();
    expect(screen.getByText('Unenroll')).toBeInTheDocument();
  });

  test('should handle cancel click', async () => {
    const props = {
      ...baseUnenrollModalProps,
      isOpen: true,
    };
    render(<UnenrollModalWrapper {...props} />);
    userEvent.click(screen.getByText('Keep learning'));
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
      const updatedEnrollments = mockQueryClient.getQueryData(
        queryEnterpriseCourseEnrollments(mockEnterpriseCustomer.uuid).queryKey,
      );
      expect(updatedEnrollments).toEqual([]);
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockAddToast).toHaveBeenCalledTimes(1);
      expect(mockAddToast).toHaveBeenCalledWith('You have been unenrolled from the course.');
    });
  });
});
