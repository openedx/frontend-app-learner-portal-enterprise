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

beforeEach(() => {
  updateCourseCompleteStatusRequest.mockImplementation(() => {});
});

const genericMockFn = () => jest.fn();
const store = createMockStore(configureMockStore);

const enterpriseConfig = {
  uuid: 'test-enterprise-uuid',
};
const completedCourseRun = createCompletedCourseRun();
const inProgCourseRun = { ...completedCourseRun, courseRunStatus: 'in_progress' };

const defaultInitialProps = defaultInitialEnrollmentProps({ genericMockFn });

// TODO not sure why and if we need the sidebarComponent here
const initProps = {
  ...defaultInitialProps,
  courseRuns: {
    in_progress: [inProgCourseRun],
    upcoming: [],
    completed: [completedCourseRun],
  },
  sidebarComponent: <div className="sidebar-example" />,
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

test('loads enrollments component', () => {
  renderEnrollmentsComponent(initProps);
  expect(screen.getByText('My courses in progress')).toBeInTheDocument();
  expect(screen.getByText('Archived courses')).toBeInTheDocument();
  expect(screen.getAllByText('edX Demonstration Course').length).toBeGreaterThanOrEqual(1);
});

test('unarchive action generates course status update', () => {
  renderEnrollmentsComponent({
    ...initProps,
    courseRuns: {
      ...initProps.courseRuns,
      completed: [{ ...completedCourseRun, markedDone: true }],
    },
  });
  expect(screen.getByRole('button', { name: 'Unarchive course' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Unarchive course' }));

  // TODO This test only validates 'half way', we ideally want to update it to
  // validate the UI results. Skipping at the time of writing since need to
  // figure out the right markup for testability. This give a base level of confidence
  // that unarchive is not failing, that's all.
  expect(updateCourseCompleteStatusRequest).toHaveBeenCalledTimes(1);
});
