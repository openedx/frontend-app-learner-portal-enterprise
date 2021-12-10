import React from 'react';

import {
  render, screen, fireEvent, act, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

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
const completedCourseRun = createCourseEnrollmentWithStatus(COURSE_STATUSES.completed);
const inProgCourseRun = { ...completedCourseRun, courseRunStatus: COURSE_STATUSES.inProgress };
const savedForLaterCourseRun = { ...completedCourseRun, courseRunStatus: COURSE_STATUSES.savedForLater };

hooks.useCourseEnrollments.mockReturnValue({
  courseEnrollmentsByStatus: {
    inProgress: [inProgCourseRun],
    upcoming: [],
    completed: [completedCourseRun],
    savedForLater: [savedForLaterCourseRun],
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

describe('Course enrollments', () => {
  beforeEach(() => {
    updateCourseCompleteStatusRequest.mockImplementation(() => ({ data: {} }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders course sections', () => {
    renderEnrollmentsComponent();
    expect(screen.getByText(COURSE_SECTION_TITLES.inProgress)).toBeInTheDocument();
    expect(screen.getByText(COURSE_SECTION_TITLES.completed)).toBeInTheDocument();
    expect(screen.getByText(COURSE_SECTION_TITLES.savedForLater)).toBeInTheDocument();
    expect(screen.getAllByText(inProgCourseRun.title).length).toBeGreaterThanOrEqual(1);
  });

  it('generates course status update on move to in progress action', async () => {
    const { getByText } = renderEnrollmentsComponent();
    expect(screen.getByRole('button', { name: MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL })).toBeInTheDocument();
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

  it.only('generates course status update on move to saved for later action', async () => {
    const { getByText } = renderEnrollmentsComponent();
    const saveForLaterButton = screen.getByRole('button', { name: MARK_SAVED_FOR_LATER_DEFAULT_LABEL });
    expect(saveForLaterButton).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(saveForLaterButton);
    });

    expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(getByText('Your course was saved for later.')));
  });
});
