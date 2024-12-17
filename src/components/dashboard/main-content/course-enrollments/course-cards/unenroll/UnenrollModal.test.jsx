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
  learnerDashboardBFFResponse,
  queryEnterpriseCourseEnrollments,
  queryEnterpriseLearnerDashboardBFF,
  useEnterpriseCustomer,
  useIsBFFEnabled,
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
  useIsBFFEnabled: jest.fn(),
  fetchEnterpriseLearnerDashboard: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logInfo: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCourseEnrollment = enterpriseCourseEnrollmentFactory();
const mockEnterpriseCourseEnrollments = [mockEnterpriseCourseEnrollment];
const mockBFFDashboardDataWithEnrollments = {
  ...learnerDashboardBFFResponse,
  enterpriseCourseEnrollments: mockEnterpriseCourseEnrollments,
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
  existingEnrollmentsQueryData = mockEnterpriseCourseEnrollments,
  existingBFFDashboardQueryData = mockBFFDashboardDataWithEnrollments,
  ...props
}) => {
  mockQueryClient = queryClient();
  if (existingEnrollmentsQueryData) {
    mockQueryClient.setQueryData(
      queryEnterpriseCourseEnrollments(mockEnterpriseCustomer.uuid).queryKey,
      existingEnrollmentsQueryData,
    );
  }
  if (existingBFFDashboardQueryData) {
    mockQueryClient.setQueryData(
      queryEnterpriseLearnerDashboardBFF({ enterpriseSlug: mockEnterpriseCustomer.slug }).queryKey,
      existingBFFDashboardQueryData,
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
    useIsBFFEnabled.mockReturnValue(false);
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

  test.each([
    // BFF enabled
    {
      isBFFEnabled: true,
      existingBFFDashboardQueryData: mockBFFDashboardDataWithEnrollments,
      existingEnrollmentsQueryData: mockEnterpriseCourseEnrollments,
    },
    {
      isBFFEnabled: true,
      existingBFFDashboardQueryData: mockBFFDashboardDataWithEnrollments,
      existingEnrollmentsQueryData: null,
    },
    {
      isBFFEnabled: true,
      existingBFFDashboardQueryData: null,
      existingEnrollmentsQueryData: mockEnterpriseCourseEnrollments,
    },
    {
      isBFFEnabled: true,
      existingBFFDashboardQueryData: null,
      existingEnrollmentsQueryData: null,
    },
    // BFF disabled
    {
      isBFFEnabled: false,
      existingBFFDashboardQueryData: mockBFFDashboardDataWithEnrollments,
      existingEnrollmentsQueryData: mockEnterpriseCourseEnrollments,
    },
    {
      isBFFEnabled: false,
      existingBFFDashboardQueryData: mockBFFDashboardDataWithEnrollments,
      existingEnrollmentsQueryData: null,
    },
    {
      isBFFEnabled: false,
      existingBFFDashboardQueryData: null,
      existingEnrollmentsQueryData: mockEnterpriseCourseEnrollments,
    },
    {
      isBFFEnabled: false,
      existingBFFDashboardQueryData: null,
      existingEnrollmentsQueryData: null,
    },
  ])('should handle unenroll click (%s)', async ({
    isBFFEnabled,
    existingBFFDashboardQueryData,
    existingEnrollmentsQueryData,
  }) => {
    useIsBFFEnabled.mockReturnValue(isBFFEnabled);
    unenrollFromCourse.mockResolvedValueOnce();
    const props = {
      ...baseUnenrollModalProps,
      isOpen: true,
      existingBFFDashboardQueryData,
      existingEnrollmentsQueryData,
    };
    render(<UnenrollModalWrapper {...props} />);
    userEvent.click(screen.getByText('Unenroll'));

    await waitFor(() => {
      const bffDashboardData = mockQueryClient.getQueryData(
        queryEnterpriseLearnerDashboardBFF({ enterpriseSlug: mockEnterpriseCustomer.slug }).queryKey,
      );
      let expectedLogInfoCalls = 0;
      if (isBFFEnabled) {
        // Only verify the BFF queryEnterpriseCourseEnrollments cache is updated if BFF feature is enabled.
        let expectedBFFDashboardData;
        if (existingBFFDashboardQueryData) {
          expectedBFFDashboardData = learnerDashboardBFFResponse;
        } else {
          expectedLogInfoCalls += 1;
        }
        expect(bffDashboardData).toEqual(expectedBFFDashboardData);
      } else {
        let expectedBFFDashboardData;
        if (existingBFFDashboardQueryData) {
          expectedBFFDashboardData = existingBFFDashboardQueryData;
        }
        // Without BFF feature enabled, the original query cache data should remain, if any.
        expect(bffDashboardData).toEqual(expectedBFFDashboardData);
      }

      // Always verify the legacy queryEnterpriseCourseEnrollments cache is updated.
      const legacyEnrollmentsData = mockQueryClient.getQueryData(
        queryEnterpriseCourseEnrollments(mockEnterpriseCustomer.uuid).queryKey,
      );
      let expectedLegacyEnrollmentsData;
      if (existingEnrollmentsQueryData) {
        expectedLegacyEnrollmentsData = [];
      } else {
        expectedLogInfoCalls += 1;
      }
      expect(legacyEnrollmentsData).toEqual(expectedLegacyEnrollmentsData);

      // Verify logInfo calls
      expect(logInfo).toHaveBeenCalledTimes(expectedLogInfoCalls);

      // Verify side effects
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockAddToast).toHaveBeenCalledTimes(1);
      expect(mockAddToast).toHaveBeenCalledWith('You have been unenrolled from the course.');
    });
  });
});
