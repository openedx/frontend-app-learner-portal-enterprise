import React from 'react';

import {
  render, screen, fireEvent, act, waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import moment from 'moment';
import {
  createCourseEnrollmentWithStatus,
} from './enrollment-testutils';
import CourseEnrollments, { COURSE_SECTION_TITLES } from '../CourseEnrollments';
import { MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL } from '../course-cards/move-to-in-progress-modal/MoveToInProgressModal';
import { MARK_SAVED_FOR_LATER_DEFAULT_LABEL } from '../course-cards/mark-complete-modal/MarkCompleteModal';
import { updateCourseCompleteStatusRequest } from '../course-cards/mark-complete-modal/data/service';
import { COURSE_STATUSES } from '../data/constants';
import CourseEnrollmentsContextProvider from '../CourseEnrollmentsContextProvider';
import * as hooks from '../data/hooks';

jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-enterprise-utils');
getAuthenticatedUser.mockReturnValue({ username: 'test-username' });

jest.mock('../course-cards/mark-complete-modal/data/service');

jest.mock('../data/service');
jest.mock('../data/hooks');

const enterpriseConfig = {
  uuid: 'test-enterprise-uuid',
};
const inProgCourseRun = createCourseEnrollmentWithStatus(COURSE_STATUSES.inProgress);
const upcomingCourseRun = createCourseEnrollmentWithStatus(COURSE_STATUSES.upcoming);
const completedCourseRun = createCourseEnrollmentWithStatus(COURSE_STATUSES.completed);
const savedForLaterCourseRun = createCourseEnrollmentWithStatus(COURSE_STATUSES.savedForLater);
const requestedCourseRun = createCourseEnrollmentWithStatus(COURSE_STATUSES.requested);

hooks.useCourseEnrollments.mockReturnValue({
  courseEnrollmentsByStatus: {
    inProgress: [inProgCourseRun],
    upcoming: [upcomingCourseRun],
    completed: [completedCourseRun],
    savedForLater: [savedForLaterCourseRun],
    requested: [requestedCourseRun],
  },
  updateCourseEnrollmentStatus: jest.fn(),
});

const renderEnrollmentsComponent = () => render(
  <AppContext.Provider value={{ enterpriseConfig }}>
    <CourseEnrollmentsContextProvider>
      <CourseEnrollments />
    </CourseEnrollmentsContextProvider>
  </AppContext.Provider>,
);

// todo: [DP-100] fix test
describe.skip('Course enrollments', () => {
  beforeEach(() => {
    updateCourseCompleteStatusRequest.mockImplementation(() => ({ data: {} }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders course sections', () => {
    renderEnrollmentsComponent();
    expect(screen.getByText(COURSE_SECTION_TITLES.current));
    expect(screen.getByText(COURSE_SECTION_TITLES.completed));
    expect(screen.getByText(COURSE_SECTION_TITLES.savedForLater));
    expect(screen.getAllByText(inProgCourseRun.title).length).toBeGreaterThanOrEqual(1);
  });

  it('generates course status update on move to in progress action', async () => {
    const { getByText } = renderEnrollmentsComponent();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL }));
    });

    // TODO This test only validates 'half way', we ideally want to update it to
    // validate the UI results. Skipping at the time of writing since need to
    // figure out the right markup for testability. This give a base level of confidence
    // that move to in progress is not failing, that's all.
    expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(getByText('Your course was moved to In Progress.')));
  });

  it('generates course status update on move to saved for later action', async () => {
    const { getByText } = renderEnrollmentsComponent();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: MARK_SAVED_FOR_LATER_DEFAULT_LABEL }));
    });

    expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(getByText('Your course was saved for later.')));
  });

  it('renders in progress, upcoming, and requested course enrollments in the same section', async () => {
    renderEnrollmentsComponent();
    const currentCourses = screen.getByText(COURSE_SECTION_TITLES.current).closest('.course-section');
    expect(within(currentCourses).getByText(inProgCourseRun.title));
    expect(within(currentCourses).getByText(upcomingCourseRun.title));
    expect(within(currentCourses).getByText(requestedCourseRun.title));
  });

  it('renders courses enrollments within sections by created timestamp', async () => {
    const now = moment();
    hooks.useCourseEnrollments.mockReturnValueOnce({
      courseEnrollmentsByStatus: {
        inProgress: [{
          ...inProgCourseRun,
          title: 'second enrollment',
          created: now.toISOString(),
        }],
        upcoming: [{
          ...upcomingCourseRun,
          courseRunId: 'third enrollment',
          title: 'third enrollment',
          created: now.add(1, 's').toISOString(),
        },
        {
          ...upcomingCourseRun,
          courseRunId: 'first enrollment',
          title: 'first enrollment',
          created: now.subtract(100, 's').toISOString(),
        }],
        completed: [],
        savedForLater: [],
        requested: [],
      },
    });

    renderEnrollmentsComponent();

    const currentCourses = screen.getByText(COURSE_SECTION_TITLES.current).closest('.course-section');
    const courseTitles = currentCourses.querySelectorAll('.course-title');
    expect(courseTitles.length).toBe(3);
    expect([...courseTitles].map(title => title.textContent)).toEqual(
      ['first enrollment', 'second enrollment', 'third enrollment'],
    );
  });
});
