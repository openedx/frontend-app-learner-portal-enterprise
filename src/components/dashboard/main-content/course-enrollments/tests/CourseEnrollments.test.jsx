import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
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
import { CourseEnrollments } from '../CourseEnrollments';

import { updateCourseCompleteStatusRequest } from '../course-cards/mark-complete-modal/data/service';

// TODO: Need to confirm if this is the best way to mock auth.
jest.mock('@edx/frontend-platform/auth');
getAuthenticatedUser.mockReturnValue({ username: 'test-username' });

jest.mock('../course-cards/mark-complete-modal/data/service');

const genericMockFn = () => jest.fn();
const store = createMockStore(configureMockStore);

const enterpriseConfig = {
  uuid: 'test-enterprise-uuid',
};
const completedCourseRun = createCompletedCourseRun();
const inProgCourseRun = { ...completedCourseRun, courseRunStatus: 'in_progress' };
const savedForLaterCourseRun = { ...completedCourseRun, savedForLater: true };

const defaultInitialProps = defaultInitialEnrollmentProps({ genericMockFn });

const initProps = {
  ...defaultInitialProps,
  courseRuns: {
    in_progress: [inProgCourseRun],
    upcoming: [],
    completed: [completedCourseRun],
    savedForLater: [savedForLaterCourseRun],
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
describe('Course enrollements', () => {
  beforeEach(() => {
    updateCourseCompleteStatusRequest.mockImplementation(() => {});
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('loads enrollments component', () => {
    renderEnrollmentsComponent(initProps);
    expect(screen.getByText('My courses in progress')).toBeInTheDocument();
    expect(screen.getByText('Completed courses')).toBeInTheDocument();
    expect(screen.getByText('Courses saved for later')).toBeInTheDocument();
    expect(screen.getAllByText('edX Demonstration Course').length).toBeGreaterThanOrEqual(1);
  });

  it('generates course status update on move to in progress action', () => {
    renderEnrollmentsComponent({ ...initProps });
    expect(screen.getByRole('button', { name: 'Move course to In Progress' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Move course to In Progress' }));

    // TODO This test only validates 'half way', we ideally want to update it to
    // validate the UI results. Skipping at the time of writing since need to
    // figure out the right markup for testability. This give a base level of confidence
    // that move to in progress is not failing, that's all.
    expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
  });

  it('generates course status update on move to saved for later action', () => {
    renderEnrollmentsComponent({ ...initProps });
    const saveForLaterButton = screen.getByRole('button', { name: 'Save course for later' });
    expect(saveForLaterButton).toBeInTheDocument();
    fireEvent.click(saveForLaterButton);

    expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
  });
});
