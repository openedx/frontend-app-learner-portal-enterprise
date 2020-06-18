import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

// requirements
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

// component to test
import { CourseEnrollments } from '../CourseEnrollments';

jest.mock('@edx/frontend-platform/auth');
getAuthenticatedUser.mockReturnValue({ username: 'test-username' });

const mockStore = configureMockStore([thunk]);

const genericMockFn = () => jest.fn();

const completedCourseRun = {
  courseRunId: 'course-v1:edX+DemoX+Demo_Course',
  courseRunStatus: 'completed',
  linkToCourse: 'https://edx.org/',
  title: 'edX Demonstration Course',
  notifications: [],
  startDate: '2017-02-05T05:00:00Z',
  endDate: '2018-08-18T05:00:00Z',
  hasEmailsEnabled: true,
  markedDone: false,
};

const inProgCourseRun = { ...completedCourseRun, courseRunStatus: 'in_progress' };
const store = mockStore({
  emailSettings: {
    loading: false,
    error: null,
    data: null,
  },
});

const initialProps = {
  courseRuns: {
    in_progress: [inProgCourseRun],
    upcoming: [],
    completed: [completedCourseRun],
  },
  isLoading: false,
  error: null,
  sidebarComponent: <div className="sidebar-example" />,
  fetchCourseEnrollments: genericMockFn(),
  clearCourseEnrollments: genericMockFn(),
  isMarkCourseCompleteSuccess: false,
  modifyIsMarkCourseCompleteSuccess: genericMockFn(),
  isUnarchiveCourseSuccess: false,
  modifyIsUnarchiveCourseSuccess: genericMockFn(),
};

test('loads enrollments component', async () => {
  const enterpriseConfig = {
    uuid: 'test-enterprise-uuid',
  };

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
