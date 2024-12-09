import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/extend-expect';
import { logInfo } from '@edx/frontend-platform/logging';
import { COURSE_STATUSES } from '../../../../../../constants';
import { unenrollFromCourse } from './data';
import UnenrollModal from './UnenrollModal';
import { ToastsContext } from '../../../../../Toasts';
import {
  fetchEnterpriseLearnerDashboard,
  isBFFEnabledForEnterpriseCustomer,
  learnerDashboardBFFResponse,
  queryEnterpriseCourseEnrollments,
  queryEnterpriseLearnerDashboardBFF,
  useEnterpriseCustomer,
} from '../../../../../app/data';
import { queryClient } from '../../../../../../utils/tests';
import {
  enterpriseCourseEnrollmentFactory,
  enterpriseCustomerFactory,
} from '../../../../../app/data/services/data/__factories__';

jest.mock('./data', () => ({
  unenrollFromCourse: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  isBFFEnabledForEnterpriseCustomer: jest.fn(),
  fetchEnterpriseLearnerDashboard: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ enterpriseSlug: 'test-enterprise-slug' }),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logInfo: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCourseEnrollment = enterpriseCourseEnrollmentFactory();
const mockBFFEnterpriseCourseEnrollments = {
  ...learnerDashboardBFFResponse,
  enterpriseCourseEnrollments: [mockEnterpriseCourseEnrollment],
};

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
const UnenrollModalWrapper = ({
  enterpriseCourseEnrollmentsData = mockEnterpriseCourseEnrollment,
  bffEnterpriseCourseEnrollmentsData = mockBFFEnterpriseCourseEnrollments,
  ...props
}) => {
  mockQueryClient = queryClient();
  if (enterpriseCourseEnrollmentsData) {
    mockQueryClient.setQueryData(
      queryEnterpriseCourseEnrollments(mockEnterpriseCustomer.uuid).queryKey,
      [enterpriseCourseEnrollmentsData],
    );
  }
  if (bffEnterpriseCourseEnrollmentsData) {
    mockQueryClient.setQueryData(
      queryEnterpriseLearnerDashboardBFF({ enterpriseSlug: 'test-enterprise-slug' }).queryKey,
      bffEnterpriseCourseEnrollmentsData,
    );
  }
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
    isBFFEnabledForEnterpriseCustomer.mockReturnValue(false);
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

  test('should handle unenroll click, non-BFF', async () => {
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

  test('should handle unenroll click, BFF', async () => {
    fetchEnterpriseLearnerDashboard.mockResolvedValueOnce(learnerDashboardBFFResponse);
    isBFFEnabledForEnterpriseCustomer.mockReturnValue(true);
    const props = {
      ...baseUnenrollModalProps,
      isOpen: true,
    };
    render(<UnenrollModalWrapper {...props} />);
    userEvent.click(screen.getByText('Unenroll'));

    await waitFor(() => {
      const updatedEnrollments = mockQueryClient.getQueryData(
        queryEnterpriseLearnerDashboardBFF({ enterpriseSlug: 'test-enterprise-slug' }).queryKey,
      );
      expect(updatedEnrollments).toEqual(learnerDashboardBFFResponse);
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockAddToast).toHaveBeenCalledTimes(1);
      expect(mockAddToast).toHaveBeenCalledWith('You have been unenrolled from the course.');
    });
  });

  test.each([
    // BFF enabled
    {
      bffEnterpriseCourseEnrollmentsData: mockBFFEnterpriseCourseEnrollments,
      enterpriseCourseEnrollmentsData: mockEnterpriseCourseEnrollment,
      isBFFEnabled: true,
    },
    {
      bffEnterpriseCourseEnrollmentsData: mockBFFEnterpriseCourseEnrollments,
      enterpriseCourseEnrollmentsData: null,
      isBFFEnabled: true,
    },
    {
      bffEnterpriseCourseEnrollmentsData: null,
      enterpriseCourseEnrollmentsData: mockEnterpriseCourseEnrollment,
      isBFFEnabled: true,
    },
    {
      bffEnterpriseCourseEnrollmentsData: null,
      enterpriseCourseEnrollmentsData: null,
      isBFFEnabled: true,
    },
    // BFF disabled
    {
      bffEnterpriseCourseEnrollmentsData: mockBFFEnterpriseCourseEnrollments,
      enterpriseCourseEnrollmentsData: mockEnterpriseCourseEnrollment,
      isBFFEnabled: false,
    },
    {
      bffEnterpriseCourseEnrollmentsData: mockBFFEnterpriseCourseEnrollments,
      enterpriseCourseEnrollmentsData: null,
      isBFFEnabled: false,
    },
    {
      bffEnterpriseCourseEnrollmentsData: null,
      enterpriseCourseEnrollmentsData: mockEnterpriseCourseEnrollment,
      isBFFEnabled: false,
    },
    {
      bffEnterpriseCourseEnrollmentsData: null,
      enterpriseCourseEnrollmentsData: null,
      isBFFEnabled: false,
    },
  ])('should handle unenroll click, with empty dataset (%s)', async ({
    bffEnterpriseCourseEnrollmentsData,
    enterpriseCourseEnrollmentsData,
    isBFFEnabled,
  }) => {
    fetchEnterpriseLearnerDashboard.mockResolvedValueOnce(learnerDashboardBFFResponse);
    unenrollFromCourse.mockResolvedValueOnce();
    isBFFEnabledForEnterpriseCustomer.mockReturnValue(isBFFEnabled);
    const props = {
      ...baseUnenrollModalProps,
      isOpen: true,
      bffEnterpriseCourseEnrollmentsData,
      enterpriseCourseEnrollmentsData,
    };
    render(<UnenrollModalWrapper {...props} />);
    userEvent.click(screen.getByText('Unenroll'));

    await waitFor(() => {
      let updatedEnrollments;
      if (isBFFEnabled) {
        updatedEnrollments = mockQueryClient.getQueryData(
          queryEnterpriseLearnerDashboardBFF({ enterpriseSlug: 'test-enterprise-slug' }).queryKey,
        );
        if (bffEnterpriseCourseEnrollmentsData) {
          expect(updatedEnrollments).toEqual(learnerDashboardBFFResponse);
          expect(logInfo).toHaveBeenCalledTimes(0);
        } else {
          expect(updatedEnrollments).toEqual(undefined);
          expect(logInfo).toHaveBeenCalledTimes(1);
        }
      }
      if (!isBFFEnabled) {
        updatedEnrollments = mockQueryClient.getQueryData(
          queryEnterpriseCourseEnrollments(mockEnterpriseCustomer.uuid).queryKey,
        );
        if (enterpriseCourseEnrollmentsData) {
          expect(updatedEnrollments).toEqual([]);
          expect(logInfo).toHaveBeenCalledTimes(0);
        } else {
          expect(updatedEnrollments).toEqual(undefined);
          expect(logInfo).toHaveBeenCalledTimes(1);
        }
      }
    });
  });
});
