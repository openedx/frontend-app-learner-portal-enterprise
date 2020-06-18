import React from 'react';

import { render, screen } from '@testing-library/react';
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

// TODO: mock auth, we should consider using a authprovider in the test
jest.mock('@edx/frontend-platform/auth');
getAuthenticatedUser.mockReturnValue({ username: 'test-username' });


const genericMockFn = () => jest.fn();
const store = createMockStore(configureMockStore);

const enterpriseConfig = {
  uuid: 'test-enterprise-uuid',
};
const completedCourseRun = createCompletedCourseRun();
const inProgCourseRun = { ...completedCourseRun, courseRunStatus: 'in_progress' };

const defaultInitialProps = defaultInitialEnrollmentProps({ genericMockFn });

// TODO not sure why and if we need the sidebarComponent here
const initialProps = {
  ...defaultInitialProps,
  courseRuns: {
    in_progress: [inProgCourseRun],
    upcoming: [],
    completed: [completedCourseRun],
  },
  sidebarComponent: <div className="sidebar-example" />,
};

test('loads enrollments component', async () => {

  render(
    <Provider store={store}>
      <AppContext.Provider value={{ enterpriseConfig }}>
        <CourseEnrollments {...initialProps} />
      </AppContext.Provider>
    </Provider>,
  );
  expect(screen.getByText('My courses in progress')).toBeInTheDocument();
  expect(screen.getAllByText('edX Demonstration Course').length).toBeGreaterThanOrEqual(1);
});
