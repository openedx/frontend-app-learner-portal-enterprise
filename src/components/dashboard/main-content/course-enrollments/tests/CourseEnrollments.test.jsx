import { screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, renderWithRouter } from '../../../../../utils/tests';
import { createCourseEnrollmentWithStatus } from './enrollment-testutils';

import { COURSE_SECTION_TITLES } from '../../../data';
import CourseEnrollments from '../CourseEnrollments';
import { updateCourseCompleteStatusRequest } from '../course-cards/mark-complete-modal/data/service';
import {
  ASSIGNMENT_TYPES,
  COURSE_MODES_MAP,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseFeatures,
  useIsBFFEnabled,
} from '../../../../app/data';
import {
  sortAssignmentsByAssignmentStatus,
  useContentAssignments,
  useCourseEnrollmentsBySection,
  useCourseUpgradeData,
  useGroupAssociationsAlert,
} from '../data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../../app/data/services/data/__factories__';
import { COURSE_STATUSES } from '../../../../../constants';
import CourseEnrollmentsContext from '../CourseEnrollmentsContext';

jest.mock('@edx/frontend-enterprise-utils');

jest.mock('../course-cards/mark-complete-modal/data/service');

jest.mock('../../../data/utils', () => ({
  __esModule: true,
  default: jest.fn(),
  getHasUnacknowledgedCanceledAssignments: jest.fn(),
}));

jest.mock('../data/service');

jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useCourseUpgradeData: jest.fn(),
  useContentAssignments: jest.fn(),
  useCourseEnrollmentsBySection: jest.fn(),
  useGroupAssociationsAlert: jest.fn(),
}));
jest.mock('../../../../../config', () => ({
  features: {
    FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT: true,
  },
}));
jest.mock('../../../../app/data', () => ({
  ...jest.requireActual('../../../../app/data'),
  useEnterpriseCourseEnrollments: jest.fn(),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseFeatures: jest.fn(),
  useIsBFFEnabled: jest.fn(),
}));

const inProgCourseRun = createCourseEnrollmentWithStatus({ status: COURSE_STATUSES.inProgress });
const upcomingCourseRun = createCourseEnrollmentWithStatus({ status: COURSE_STATUSES.upcoming });
const completedCourseRun = createCourseEnrollmentWithStatus({ status: COURSE_STATUSES.completed });
const savedForLaterCourseRun = createCourseEnrollmentWithStatus(
  {
    status: COURSE_STATUSES.savedForLater,
    start: dayjs().subtract(1, 'day').toISOString(),
    end: dayjs().add(1, 'day').toISOString(),
  },
);
const cancelledAssignedCourseRun = createCourseEnrollmentWithStatus({
  status: COURSE_STATUSES.assigned,
  isCancelledAssignment: true,
});

const MARK_SAVED_FOR_LATER_DEFAULT_LABEL = 'Save course for later';
const MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL = 'Move course to "In Progress"';

const transformedLicenseRequest = {
  created: '2017-02-05T05:00:00Z',
  courseRunId: 'edx+101',
  title: 'requested course',
  courseRunStatus: COURSE_STATUSES.requested,
  linkToCourse: 'https://edx.org',
  notifications: [],
};

const assignmentData = {
  contentKey: 'test-contentKey',
  contentTitle: 'test-title',
  contentMetadata: {
    endDate: '2024-08-18T05:00:00Z',
    startDate: '2017-02-05T05:00:00Z',
    courseType: 'test-course-type',
    enrollByDate: '2017-02-05T05:00:00Z',
    partners: [{ name: 'test-partner' }],
  },
  state: 'cancelled',
};

const defaultCourseEnrollmentContextValue = {
  courseEnrollmentStatusChanges: [],
  addCourseEnrollmentStatusChangeAlert: jest.fn(),
};

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();

const CourseEnrollmentsWrapper = ({
  appContextProps = {},
  courseEnrollmentContextValue = defaultCourseEnrollmentContextValue,
}) => (
  <QueryClientProvider client={queryClient()}>
    <IntlProvider locale="en">
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser, ...appContextProps }}>
        <CourseEnrollmentsContext.Provider value={courseEnrollmentContextValue}>
          <CourseEnrollments />
        </CourseEnrollmentsContext.Provider>
      </AppContext.Provider>
    </IntlProvider>
  </QueryClientProvider>
);

jest.mock('../data/utils', () => ({
  ...jest.requireActual('../data/utils'),
  sortAssignmentsByAssignmentStatus: jest.fn(),
}));

const mockAcknowledgeAssignments = jest.fn();
const mockDismissGroupAssociationAlert = jest.fn();
const mockHandleAcknowledgeExpiringAssignments = jest.fn();

describe('Course enrollments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useIsBFFEnabled.mockReturnValue(false);
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useEnterpriseCourseEnrollments.mockReturnValue({
      data: {
        allEnrollmentsByStatus: {
          inProgress: [inProgCourseRun],
          upcoming: [upcomingCourseRun],
          completed: [completedCourseRun],
          assigned: [cancelledAssignedCourseRun],
          savedForLater: [savedForLaterCourseRun],
          requested: [transformedLicenseRequest],
        },
      },
    });

    updateCourseCompleteStatusRequest.mockImplementation(() => ({ data: {} }));
    sortAssignmentsByAssignmentStatus.mockReturnValue([assignmentData]);
    useEnterpriseFeatures.mockReturnValue({ data: { enterpriseGroupsV1: false } });
    useGroupAssociationsAlert.mockReturnValue({
      showNewGroupAssociationAlert: true,
      dismissGroupAssociationAlert: mockDismissGroupAssociationAlert,
      enterpriseCustomer: {
        name: 'test-enterprise-customer',
      },
    });
    useCourseEnrollmentsBySection.mockReturnValue({
      hasCourseEnrollments: true,
      currentCourseEnrollments: [inProgCourseRun],
      completedCourseEnrollments: [completedCourseRun],
      savedForLaterCourseEnrollments: [savedForLaterCourseRun],
    });

    useContentAssignments.mockReturnValue({
      assignments: [],
      showCanceledAssignmentsAlert: false,
      showExpiredAssignmentsAlert: false,
      handleOnCloseCancelAlert: jest.fn(),
      handleOnCloseExpiredAlert: jest.fn(),
    });
    useCourseUpgradeData.mockReturnValue({
      licenseUpgradeUrl: undefined,
      couponUpgradeUrl: undefined,
      learnerCreditUpgradeUrl: undefined,
      subsidyForCourse: undefined,
      courseRunPrice: undefined,
    });
  });

  it('renders course sections', () => {
    renderWithRouter(<CourseEnrollmentsWrapper />);
    expect(screen.getByText(COURSE_SECTION_TITLES.current));
    expect(screen.getByText(COURSE_SECTION_TITLES.completed));
    expect(screen.getByText(COURSE_SECTION_TITLES.savedForLater));
    expect(screen.getAllByText(inProgCourseRun.title).length).toBeGreaterThanOrEqual(1);
  });

  it('renders alert for canceled assignments and renders canceled assignment cards with dismiss behavior', async () => {
    const user = userEvent.setup();
    const mockCourseKey = 'test-courseKey';
    const mockAssignment = {
      state: ASSIGNMENT_TYPES.CANCELED,
      courseRunId: mockCourseKey,
      courseRunStatus: COURSE_STATUSES.assigned,
      title: 'test-title',
      linkToCourse: `/test-enterprise/course/${mockCourseKey}`,
      notifications: [],
      isCanceledAssignment: true,
      isExpiredAssignment: false,
      isExpiringAssignment: false,
      endDate: dayjs().add(1, 'day').toISOString(),
      startDate: dayjs().subtract(1, 'day').toISOString(),
      mode: COURSE_MODES_MAP.VERIFIED,
    };
    useContentAssignments.mockReturnValue({
      assignments: [mockAssignment],
      showCanceledAssignmentsAlert: true,
      showExpiredAssignmentsAlert: false,
      handleAcknowledgeAssignments: mockAcknowledgeAssignments,
    });
    renderWithRouter(<CourseEnrollmentsWrapper />);
    // Verify canceled assignment card is visible initially
    expect(screen.getByText(mockAssignment.title)).toBeInTheDocument();
    expect(screen.getByText('Your learning administrator canceled this assignment')).toBeInTheDocument();
    // Verify cancelation alert is visible initially
    expect(screen.getByText('Course assignment canceled')).toBeInTheDocument();
    // Handles dismiss behavior
    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    await user.click(dismissButton);
    expect(mockAcknowledgeAssignments).toHaveBeenCalledTimes(1);
    expect(mockAcknowledgeAssignments).toHaveBeenCalledWith({ assignmentState: ASSIGNMENT_TYPES.CANCELED });
  });

  it('renders alert for expired assignments and renders expired assignment cards with dismiss behavior', async () => {
    const user = userEvent.setup();
    const mockCourseKey = 'test-courseKey';
    const mockAssignment = {
      state: ASSIGNMENT_TYPES.ALLOCATED,
      courseRunId: mockCourseKey,
      courseRunStatus: COURSE_STATUSES.assigned,
      title: 'test-title',
      linkToCourse: `/test-enterprise/course/${mockCourseKey}`,
      notifications: [],
      isCanceledAssignment: false,
      isExpiredAssignment: true,
      isExpiringAssignment: false,
      endDate: dayjs().subtract(1, 'day').toISOString(),
      startDate: dayjs().subtract(30, 'day').toISOString(),
      mode: COURSE_MODES_MAP.VERIFIED,
    };
    useContentAssignments.mockReturnValue({
      assignments: [mockAssignment],
      showCanceledAssignmentsAlert: false,
      showExpiredAssignmentsAlert: true,
      handleAcknowledgeAssignments: mockAcknowledgeAssignments,
    });
    renderWithRouter(<CourseEnrollmentsWrapper />);
    // Verify canceled assignment card is visible initially
    expect(screen.getByText(mockAssignment.title)).toBeInTheDocument();
    expect(screen.getByText('Deadline to enroll in this course has passed')).toBeInTheDocument();
    // Verify cancelation alert is visible initially
    expect(screen.getByText('Deadline passed')).toBeInTheDocument();
    // Handles dismiss behavior
    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    await user.click(dismissButton);
    expect(mockAcknowledgeAssignments).toHaveBeenCalledTimes(1);
    expect(mockAcknowledgeAssignments).toHaveBeenCalledWith({ assignmentState: ASSIGNMENT_TYPES.EXPIRED });
  });

  it('renders NewGroupAssignmentAlert when showNewGroupAssociationAlert is true', async () => {
    const user = userEvent.setup();
    useEnterpriseFeatures.mockReturnValue({ data: { enterpriseGroupsV1: true } });
    useGroupAssociationsAlert.mockReturnValue({
      showNewGroupAssociationAlert: true,
      dismissGroupAssociationAlert: mockDismissGroupAssociationAlert,
      enterpriseCustomer: {
        name: 'test-enterprise-customer',
      },
    });
    renderWithRouter(<CourseEnrollmentsWrapper />);
    const dismissButton = screen.getAllByRole('button', { name: 'Dismiss' })[0];
    await user.click(dismissButton);
    expect(await screen.findByText('You have new courses to browse')).toBeInTheDocument();
    expect(mockDismissGroupAssociationAlert).toHaveBeenCalledTimes(1);
  });

  it('does not render NewGroupAssignmentAlert when showNewGroupAssociationAlert is false', async () => {
    useGroupAssociationsAlert.mockReturnValue({
      showNewGroupAssociationAlert: false,
      dismissGroupAssociationAlert: mockDismissGroupAssociationAlert,
      enterpriseCustomer: {
        name: 'test-enterprise-customer',
      },
    });
    renderWithRouter(<CourseEnrollmentsWrapper />);
    expect(screen.queryByText('You have new courses to browse')).not.toBeInTheDocument();
    expect(mockDismissGroupAssociationAlert).not.toHaveBeenCalled();
  });

  it('renders dismissible alert for expiring assignments and renders expiring assignment cards', async () => {
    const user = userEvent.setup();
    const mockCourseKey = 'test-courseKey';
    const mockAssignment = {
      state: ASSIGNMENT_TYPES.ALLOCATED,
      courseRunId: mockCourseKey,
      courseRunStatus: COURSE_STATUSES.assigned,
      title: 'test-title',
      linkToCourse: `/test-enterprise/course/${mockCourseKey}`,
      notifications: [],
      isCanceledAssignment: false,
      isExpiredAssignment: false,
      isExpiringAssignment: true,
      endDate: dayjs().subtract(1, 'day').toISOString(),
      startDate: dayjs().subtract(30, 'day').toISOString(),
      mode: 'verified',
    };
    useContentAssignments.mockReturnValue({
      assignments: [mockAssignment],
      showCanceledAssignmentsAlert: false,
      showExpiredAssignmentsAlert: false,
      showExpiringAssignmentsAlert: true,
      handleAcknowledgeExpiringAssignments: mockHandleAcknowledgeExpiringAssignments,
    });
    renderWithRouter(<CourseEnrollmentsWrapper />);
    // Verify expiring assignment card is visible initially
    expect(screen.getByText(mockAssignment.title)).toBeInTheDocument();
    // Verify expiring alert is visible initially
    expect(screen.getByText('Enrollment deadlines approaching')).toBeInTheDocument();
    // Handles dismiss behavior
    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    await user.click(dismissButton);
    await waitFor(() => {
      expect(mockHandleAcknowledgeExpiringAssignments).toHaveBeenCalledTimes(1);
    });
  });

  it('generates course status update on move to in progress action', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CourseEnrollmentsWrapper />);
    const { title } = savedForLaterCourseRun;

    // Open the dropdown menu for the course
    await user.click(screen.getByLabelText(`course settings for ${title}`));

    // Wait for the dropdown to be visible and use getByRole with name to find the correct menuitem
    const moveToInProgressMenuItem = await screen.findByRole('menuitem', { name: /Move to "In Progress"/i });
    await user.click(moveToInProgressMenuItem);

    // Clicks the "Move course to In Progress" button, moving the course back to in progress status
    await user.click(screen.getByRole('button', { name: MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL }));

    // TODO This test only validates 'half way', we ideally want to update it to
    // validate the UI results. Skipping at the time of writing since need to
    // figure out the right markup for testability. This give a base level of confidence
    // that move to in progress is not failing, that's all.
    await waitFor(() => {
      expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('Your course was moved to "In Progress".')).toBeInTheDocument();

    await user.click(screen.getByText('Dismiss'));

    expect(await screen.queryByText('Your course was moved to "In Progress".')).not.toBeInTheDocument();
  });

  it('generates course status update on move to saved for later action', async () => {
    const user = userEvent.setup();
    const appContext = {
      courseCards: {
        'in-progress': {
          settingsMenu: {
            hasMarkComplete: true,
          },
        },
      },
    };
    renderWithRouter(<CourseEnrollmentsWrapper appContextProps={appContext} />);
    const { title } = inProgCourseRun;

    // Open the dropdown menu for the course
    await user.click(screen.getByLabelText(`course settings for ${title}`));

    // Wait for the dropdown to be visible and use getByRole with name to find the correct menuitem
    const saveForLaterMenuItem = await screen.findByRole('menuitem', { name: /Save course for later/i });
    await user.click(saveForLaterMenuItem);

    // Clicks the "Save course for later" button, identified by its role
    await user.click(screen.getByRole('button', { name: MARK_SAVED_FOR_LATER_DEFAULT_LABEL }));

    // Verify the course status update request is made
    await waitFor(() => {
      expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
    });

    // Ensure the success message is displayed
    expect(await screen.findByText('Your course was saved for later.')).toBeInTheDocument();

    await user.click(screen.getByText('Dismiss'));

    expect(await screen.queryByText('Your course was saved for later.')).not.toBeInTheDocument();
  });

  it('renders in progress, upcoming, and requested course enrollments in the same section', async () => {
    useCourseEnrollmentsBySection.mockReturnValueOnce({
      hasCourseEnrollments: true,
      currentCourseEnrollments: [inProgCourseRun, upcomingCourseRun, transformedLicenseRequest],
      completedCourseEnrollments: [completedCourseRun],
      savedForLaterCourseEnrollments: [savedForLaterCourseRun],
    });
    renderWithRouter(<CourseEnrollmentsWrapper />);
    const currentCourses = screen.getByText(COURSE_SECTION_TITLES.current).closest('.course-section');
    expect(within(currentCourses).getByText(inProgCourseRun.title));
    expect(within(currentCourses).getByText(upcomingCourseRun.title));
    expect(within(currentCourses).getByText(transformedLicenseRequest.title));
  });

  it('renders courses enrollments within sections by created timestamp', async () => {
    const now = dayjs();
    const mockFirstEnrollment = {
      ...upcomingCourseRun,
      courseRunId: 'first enrollment',
      title: 'first enrollment',
      created: now.subtract(100, 's').toISOString(),
    };
    const mockSecondEnrollment = {
      ...inProgCourseRun,
      title: 'second enrollment',
      created: now.toISOString(),
    };
    const mockThirdEnrollment = {
      ...upcomingCourseRun,
      courseRunId: 'third enrollment',
      title: 'third enrollment',
      created: now.add(1, 's').toISOString(),
    };
    useCourseEnrollmentsBySection.mockReturnValueOnce({
      hasCourseEnrollments: true,
      currentCourseEnrollments: [mockFirstEnrollment, mockSecondEnrollment, mockThirdEnrollment],
      completedCourseEnrollments: [],
      savedForLaterCourseEnrollments: [],
    });

    renderWithRouter(<CourseEnrollmentsWrapper />);

    const currentCourses = screen.getByText(COURSE_SECTION_TITLES.current).closest('.course-section');
    const courseTitles = currentCourses.querySelectorAll('.course-title');
    expect(courseTitles.length).toBe(3);
    expect([...courseTitles].map(title => title.textContent)).toEqual(
      ['first enrollment', 'second enrollment', 'third enrollment'],
    );
  });
});
