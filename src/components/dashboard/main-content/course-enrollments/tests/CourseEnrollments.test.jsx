import React from 'react';

import {
  render, screen, fireEvent, act,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';

// test deps
import configureMockStore from 'redux-mock-store';

// requirements
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  createMockStore,
  createCompletedCourseRun,
  defaultInitialEnrollmentProps,
} from './enrollment-testutils';

// component to test
import { CourseEnrollments, COURSE_SECTION_TITLES } from '../CourseEnrollments';
import { MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL } from '../course-cards/move-to-in-progress-modal/MoveToInProgressModal';
import { MARK_SAVED_FOR_LATER_DEFAULT_LABEL } from '../course-cards/mark-complete-modal/MarkCompleteModal';
import { updateCourseCompleteStatusRequest } from '../course-cards/mark-complete-modal/data/service';
import { COURSE_STATUSES } from '../data/constants';

jest.mock('@edx/frontend-platform/auth');
getAuthenticatedUser.mockReturnValue({ username: 'test-username' });

jest.mock('../course-cards/mark-complete-modal/data/service');

const genericMockFn = () => jest.fn();
const store = createMockStore(configureMockStore);

const enterpriseConfig = {
  uuid: 'test-enterprise-uuid',
};
const completedCourseRun = createCompletedCourseRun();
const inProgCourseRun = { ...completedCourseRun, courseRunStatus: COURSE_STATUSES.inProgress };
const savedForLaterCourseRun = { ...completedCourseRun, courseRunStatus: COURSE_STATUSES.savedForLater };

const defaultInitialProps = defaultInitialEnrollmentProps({ genericMockFn });

const initProps = {
  ...defaultInitialProps,
  courseRuns: {
    in_progress: [inProgCourseRun],
    upcoming: [],
    completed: [completedCourseRun],
    saved_for_later: [savedForLaterCourseRun],
  },
};

function renderEnrollmentsComponent(initialProps) {
  render(
    <Provider store={store}>
      <AppContext.Provider value={{ enterpriseConfig }}>
        <CourseEnrollments {...initialProps} />
      </AppContext.Provider>
    </Provider>,
  );
}
describe('Course enrollments', () => {
  beforeEach(() => {
    updateCourseCompleteStatusRequest.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('loads enrollments component', () => {
    renderEnrollmentsComponent(initProps);
    expect(screen.getByText(COURSE_SECTION_TITLES.inProgress)).toBeInTheDocument();
    expect(screen.getByText(COURSE_SECTION_TITLES.completed)).toBeInTheDocument();
    expect(screen.getByText(COURSE_SECTION_TITLES.savedForLater)).toBeInTheDocument();
    expect(screen.getAllByText(inProgCourseRun.title).length).toBeGreaterThanOrEqual(1);
  });

  it('generates course status update on move to in progress action', async () => {
    renderEnrollmentsComponent({ ...initProps });
    expect(screen.getByRole('button', { name: MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL })).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: MARK_MOVE_TO_IN_PROGRESS_DEFAULT_LABEL }));
    });

    // TODO This test only validates 'half way', we ideally want to update it to
    // validate the UI results. Skipping at the time of writing since need to
    // figure out the right markup for testability. This give a base level of confidence
    // that move to in progress is not failing, that's all.
    expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
  });

  it('generates course status update on move to saved for later action', async () => {
    renderEnrollmentsComponent({ ...initProps });
    const saveForLaterButton = screen.getByRole('button', { name: MARK_SAVED_FOR_LATER_DEFAULT_LABEL });
    expect(saveForLaterButton).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(saveForLaterButton);
    });

    expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
  });
});
