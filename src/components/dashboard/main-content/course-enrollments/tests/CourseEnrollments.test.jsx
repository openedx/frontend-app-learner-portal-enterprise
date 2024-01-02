import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';

import { renderWithRouter } from '../../../../../utils/tests';
import { createCourseEnrollmentWithStatus } from './enrollment-testutils';
import CourseEnrollments, { COURSE_SECTION_TITLES } from '../CourseEnrollments';
import { MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL } from '../course-cards/move-to-in-progress-modal/MoveToInProgressModal';
import { MARK_SAVED_FOR_LATER_DEFAULT_LABEL } from '../course-cards/mark-complete-modal/MarkCompleteModal';
import { updateCourseCompleteStatusRequest } from '../course-cards/mark-complete-modal/data/service';
import { COURSE_STATUSES } from '../data/constants';
import CourseEnrollmentsContextProvider from '../CourseEnrollmentsContextProvider';
import * as hooks from '../data/hooks';
import { SubsidyRequestsContext } from '../../../../enterprise-subsidy-requests';
import { UserSubsidyContext } from '../../../../enterprise-user-subsidy';
import { sortAssignmentsByAssignmentStatus } from '../data/utils';
import { ASSIGNMENT_TYPES } from '../../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { emptyRedeemableLearnerCreditPolicies } from '../../../../enterprise-user-subsidy/data/constants';

jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-enterprise-utils');
getAuthenticatedUser.mockReturnValue({ username: 'test-username' });

jest.mock('../course-cards/mark-complete-modal/data/service');

jest.mock('../../../data/utils', () => ({
  __esModule: true,
  default: jest.fn(),
  getHasUnacknowledgedCanceledAssignments: jest.fn(),
}));

jest.mock('../data/service');
jest.mock('../data/hooks');
jest.mock('../../../../../config', () => ({
  features: {
    FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT: true,
  },
}));

const enterpriseConfig = {
  uuid: 'test-enterprise-uuid',
  adminUsers: [{ email: 'edx@example.com' }],
};
const inProgCourseRun = createCourseEnrollmentWithStatus({ status: COURSE_STATUSES.inProgress });
const upcomingCourseRun = createCourseEnrollmentWithStatus({ status: COURSE_STATUSES.upcoming });
const completedCourseRun = createCourseEnrollmentWithStatus({ status: COURSE_STATUSES.completed });
const savedForLaterCourseRun = createCourseEnrollmentWithStatus({ status: COURSE_STATUSES.savedForLater });
const cancelledAssignedCourseRun = createCourseEnrollmentWithStatus({
  status: COURSE_STATUSES.assigned,
  isCancelledAssignment: true,
});

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
    endDate: '2018-08-18T05:00:00Z',
    startDate: '2017-02-05T05:00:00Z',
    courseType: 'test-course-type',
    enrollByDate: '2017-02-05T05:00:00Z',
    partners: [{ name: 'test-partner' }],
  },
  state: 'cancelled',
};

hooks.useCourseEnrollments.mockReturnValue({
  courseEnrollmentsByStatus: {
    inProgress: [inProgCourseRun],
    upcoming: [upcomingCourseRun],
    completed: [completedCourseRun],
    assigned: [cancelledAssignedCourseRun],
    savedForLater: [savedForLaterCourseRun],
    requested: [transformedLicenseRequest],
  },
  updateCourseEnrollmentStatus: jest.fn(),
});

hooks.useContentAssignments.mockReturnValue({
  assignments: [],
  showCanceledAssignmentsAlert: false,
  showExpiredAssignmentsAlert: false,
  handleOnCloseCancelAlert: jest.fn(),
  handleOnCloseExpiredAlert: jest.fn(),
});

hooks.useCourseEnrollmentsBySection.mockReturnValue({
  hasCourseEnrollments: true,
  currentCourseEnrollments: [inProgCourseRun],
  completedCourseEnrollments: [completedCourseRun],
  savedForLaterCourseEnrollments: [savedForLaterCourseRun],
});

const initialUserSubsidyState = {
  redeemableLearnerCreditPolicies: emptyRedeemableLearnerCreditPolicies,
};

const CourseEnrollmentsWrapper = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={{ enterpriseConfig }}>
      <UserSubsidyContext.Provider value={initialUserSubsidyState}>
        <SubsidyRequestsContext.Provider value={{ isLoading: false }}>
          <CourseEnrollmentsContextProvider>
            <CourseEnrollments />
          </CourseEnrollmentsContextProvider>
        </SubsidyRequestsContext.Provider>
      </UserSubsidyContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

jest.mock('../data/utils', () => ({
  ...jest.requireActual('../data/utils'),
  sortAssignmentsByAssignmentStatus: jest.fn(),
}));

describe('Course enrollments', () => {
  beforeEach(() => {
    updateCourseCompleteStatusRequest.mockImplementation(() => ({ data: {} }));
    sortAssignmentsByAssignmentStatus.mockReturnValue([assignmentData]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders course sections', () => {
    renderWithRouter(<CourseEnrollmentsWrapper />);
    expect(screen.getByText(COURSE_SECTION_TITLES.current));
    expect(screen.getByText(COURSE_SECTION_TITLES.completed));
    expect(screen.getByText(COURSE_SECTION_TITLES.savedForLater));
    expect(screen.getAllByText(inProgCourseRun.title).length).toBeGreaterThanOrEqual(1);
  });

  it('renders alert for canceled assignments and renders canceled assignment cards with dismiss behavior', async () => {
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
      endDate: dayjs().add(1, 'day').toISOString(),
      startDate: dayjs().subtract(1, 'day').toISOString(),
      mode: 'verified',
    };
    const mockCloseCancelAlert = jest.fn();
    hooks.useContentAssignments.mockReturnValue({
      assignments: [mockAssignment],
      showCanceledAssignmentsAlert: true,
      showExpiredAssignmentsAlert: false,
      handleOnCloseCancelAlert: mockCloseCancelAlert,
      handleOnCloseExpiredAlert: jest.fn(),
    });
    renderWithRouter(<CourseEnrollmentsWrapper />);
    // Verify canceled assignment card is visible initially
    expect(screen.getByText(mockAssignment.title)).toBeInTheDocument();
    expect(screen.getByText('Your learning administrator canceled this assignment')).toBeInTheDocument();
    // Verify cancelation alert is visible initially
    expect(screen.getByText('Course assignment canceled')).toBeInTheDocument();
    // Handles dismiss behavior
    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    userEvent.click(dismissButton);
    expect(mockCloseCancelAlert).toHaveBeenCalledTimes(1);
  });

  it('renders alert for expired assignments and renders expired assignment cards with dismiss behavior', async () => {
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
      endDate: dayjs().subtract(1, 'day').toISOString(),
      startDate: dayjs().subtract(30, 'day').toISOString(),
      mode: 'verified',
    };
    const mockCloseExpiredAlert = jest.fn();
    hooks.useContentAssignments.mockReturnValue({
      assignments: [mockAssignment],
      showCanceledAssignmentsAlert: false,
      showExpiredAssignmentsAlert: true,
      handleOnCloseCancelAlert: jest.fn(),
      handleOnCloseExpiredAlert: mockCloseExpiredAlert,
    });
    renderWithRouter(<CourseEnrollmentsWrapper />);
    // Verify canceled assignment card is visible initially
    expect(screen.getByText(mockAssignment.title)).toBeInTheDocument();
    expect(screen.getByText('Deadline to enroll in this course has passed')).toBeInTheDocument();
    // Verify cancelation alert is visible initially
    expect(screen.getByText('Deadline passed')).toBeInTheDocument();
    // Handles dismiss behavior
    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    userEvent.click(dismissButton);
    expect(mockCloseExpiredAlert).toHaveBeenCalledTimes(1);
  });

  it('generates course status update on move to in progress action', async () => {
    const { getByText } = renderWithRouter(<CourseEnrollmentsWrapper />);
    userEvent.click(screen.getByRole('button', { name: MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL }));

    // TODO This test only validates 'half way', we ideally want to update it to
    // validate the UI results. Skipping at the time of writing since need to
    // figure out the right markup for testability. This give a base level of confidence
    // that move to in progress is not failing, that's all.
    expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(getByText('Your course was moved to In Progress.')));
  });

  it('generates course status update on move to saved for later action', async () => {
    const { getByText } = renderWithRouter(<CourseEnrollmentsWrapper />);
    userEvent.click(screen.getByRole('button', { name: MARK_SAVED_FOR_LATER_DEFAULT_LABEL }));
    expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(getByText('Your course was saved for later.')));
  });

  it('renders in progress, upcoming, and requested course enrollments in the same section', async () => {
    hooks.useCourseEnrollmentsBySection.mockReturnValueOnce({
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
    hooks.useCourseEnrollments.mockReturnValueOnce({
      courseEnrollmentsByStatus: {
        inProgress: [mockSecondEnrollment],
        upcoming: [mockThirdEnrollment, mockFirstEnrollment],
        completed: [],
        savedForLater: [],
        requested: [],
      },
    });
    hooks.useCourseEnrollmentsBySection.mockReturnValueOnce({
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
