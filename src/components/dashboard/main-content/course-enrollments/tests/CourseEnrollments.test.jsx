import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';

import { renderWithRouter } from '../../../../../utils/tests';
import { createCourseEnrollmentWithStatus } from './enrollment-testutils';

import { COURSE_SECTION_TITLES } from '../../../data/constants';
import CourseEnrollments from '../CourseEnrollments';
import { MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL } from '../course-cards/move-to-in-progress-modal/MoveToInProgressModal';
import { MARK_SAVED_FOR_LATER_DEFAULT_LABEL } from '../course-cards/mark-complete-modal/MarkCompleteModal';
import { updateCourseCompleteStatusRequest } from '../course-cards/mark-complete-modal/data/service';
import { COURSE_STATUSES } from '../data/constants';
import * as hooks from '../data/hooks';
import { ASSIGNMENT_TYPES } from '../../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { useEnterpriseCourseEnrollments, useEnterpriseCustomer, useEnterpriseFeatures } from '../../../../app/data';
import { sortAssignmentsByAssignmentStatus } from '../data/utils';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-enterprise-utils');

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

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

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

jest.mock('../../../../app/data', () => ({
  ...jest.requireActual('../../../../app/data'),
  useEnterpriseCourseEnrollments: jest.fn(),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseFeatures: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();

const CourseEnrollmentsWrapper = () => (
  <IntlProvider locale="en">
    <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
      <CourseEnrollments />
    </AppContext.Provider>
  </IntlProvider>
);

jest.mock('../data/utils', () => ({
  ...jest.requireActual('../data/utils'),
  sortAssignmentsByAssignmentStatus: jest.fn(),
}));

const mockAcknowledgeAssignments = jest.fn();
const mockHandleAddNewGroupToLocalStorage = jest.fn();

describe('Course enrollments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLocation.mockReturnValue({});
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
    hooks.useGroupMembershipAssignments.mockReturnValue({
      shouldShowNewGroupMembershipAlert: true,
      handleAddNewGroupAssignmentToLocalStorage: mockHandleAddNewGroupToLocalStorage,
      enterpriseCustomer: {
        name: 'test-enterprise-customer',
        catalogCourseCount: 5,
      },
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

    hooks.useContentAssignments.mockReturnValue({
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
    userEvent.click(dismissButton);
    expect(mockAcknowledgeAssignments).toHaveBeenCalledTimes(1);
    expect(mockAcknowledgeAssignments).toHaveBeenCalledWith({ assignmentState: ASSIGNMENT_TYPES.CANCELED });
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
    hooks.useContentAssignments.mockReturnValue({
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
    userEvent.click(dismissButton);
    expect(mockAcknowledgeAssignments).toHaveBeenCalledTimes(1);
    expect(mockAcknowledgeAssignments).toHaveBeenCalledWith({ assignmentState: ASSIGNMENT_TYPES.EXPIRED });
  });

  it(
    'renders NewGroupAssignmentAlert when shouldShowNewGroupMembershipAlert is true',
    async () => {
      useEnterpriseFeatures.mockReturnValue({ data: { enterpriseGroupsV1: true } });
      hooks.useGroupMembershipAssignments.mockReturnValue({
        shouldShowNewGroupMembershipAlert: true,
        handleAddNewGroupAssignmentToLocalStorage: mockHandleAddNewGroupToLocalStorage,
        enterpriseCustomer: {
          name: 'test-enterprise-customer',
        },
        catalogCourseCount: 5,
      });
      renderWithRouter(<CourseEnrollmentsWrapper />);
      const dismissButton = screen.getAllByRole('button', { name: 'Dismiss' })[0];
      userEvent.click(dismissButton);
      expect(await screen.findByText('You have new courses to browse')).toBeInTheDocument();
      expect(mockHandleAddNewGroupToLocalStorage).toHaveBeenCalledTimes(1);
    },
  );

  it(
    'does not render NewGroupAssignmentAlert when shouldShowNewGroupMembershipAlert is false',
    async () => {
      hooks.useGroupMembershipAssignments.mockReturnValue({
        shouldShowNewGroupMembershipAlert: false,
        handleAddNewGroupAssignmentToLocalStorage: mockHandleAddNewGroupToLocalStorage,
        enterpriseCustomer: {
          name: 'test-enterprise-customer',
          catalogCourseCount: 5,
        },
      });
      renderWithRouter(<CourseEnrollmentsWrapper />);
      expect(screen.queryByText('You have new courses to browse')).not.toBeInTheDocument();
      expect(mockHandleAddNewGroupToLocalStorage).not.toHaveBeenCalled();
    },
  );

  it('generates course status update on move to in progress action', async () => {
    useLocation.mockReturnValue({
      state: {
        markedSavedForLaterSuccess: false,
        markedInProgressSuccess: true,
      },
    });
    renderWithRouter(<CourseEnrollmentsWrapper />);
    userEvent.click(screen.getByRole('button', { name: MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL }));

    // TODO This test only validates 'half way', we ideally want to update it to
    // validate the UI results. Skipping at the time of writing since need to
    // figure out the right markup for testability. This give a base level of confidence
    // that move to in progress is not failing, that's all.
    await waitFor(() => {
      expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('Your course was moved to In Progress.')).toBeInTheDocument();
  });

  it('generates course status update on move to saved for later action', async () => {
    useLocation.mockReturnValue({
      state: {
        markedSavedForLaterSuccess: true,
        markedInProgressSuccess: false,
      },
    });
    renderWithRouter(<CourseEnrollmentsWrapper />);
    userEvent.click(screen.getByRole('button', { name: MARK_SAVED_FOR_LATER_DEFAULT_LABEL }));
    await waitFor(() => {
      expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('Your course was saved for later.'));
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
