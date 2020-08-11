import thunk from 'redux-thunk';
import { COURSE_STATUSES } from '../data/constants';

/**
 * Creates a redux-thunk based store with default emailSettings for the app.
 * The function is an arg since otherwise we would need this file to depend on
 * a test tool (meaning we would have to move the test util from devDep to regular dep)
 *
 * To use this store, just pass it to a redux Provider such as <Provider store={store} />
 * @param {Function} configureMockStore Typically a redux thunk configure function.
 */
const createMockStore = (configureMockStore) => {
  const mockStore = configureMockStore([thunk]);
  const store = mockStore({
    emailSettings: {
      loading: false,
      error: null,
      data: null,
    },
  });
  return store;
};

/**
 * Generate a courseRun with complete status.
 * Can be used as a baseline to override and generate new courseRuns.
 */
const createCompletedCourseRun = () => {
  const completedCourseRun = {
    courseRunId: 'course-v1:edX+DemoX+Demo_Course',
    courseRunStatus: COURSE_STATUSES.completed,
    linkToCourse: 'https://edx.org/',
    title: 'edX Demonstration Course',
    notifications: [],
    startDate: '2017-02-05T05:00:00Z',
    endDate: '2018-08-18T05:00:00Z',
    hasEmailsEnabled: true,
    isRevoked: false,
  };
  return completedCourseRun;
};

const createRawCourseRun = () => ({
  displayName: 'Best course',
  micromastersTitle: 'Greatest Micromasters',
  resumeCourseRunUrl: 'http://www.resumecourserun.com',
  certificateDownloadUrl: 'http://www.certificatehere.com',
  emailsEnabled: true,
  dueDates: [],
  completed: false,
  courseRunStatus: COURSE_STATUSES.inProgress,
  isRevoked: false,
});

/**
 * Generates initial props for CourseEnrollments component with sensible defaults.
 *
 * @param {Function} genericMockFn optional arg to plug in a mock fun (such as () => jest.fn() )
 */
const defaultInitialEnrollmentProps = ({ genericMockFn = () => {} }) => ({
  courseRuns: {
    in_progress: [],
    upcoming: [],
    completed: [],
  },
  isLoading: false,
  error: null,
  sidebarComponent: null,
  fetchCourseEnrollments: genericMockFn(),
  clearCourseEnrollments: genericMockFn(),
  isMarkCourseCompleteSuccess: false,
  modifyIsMarkCourseCompleteSuccess: genericMockFn(),
  isMoveToInProgressCourseSuccess: false,
  modifyIsMoveToInProgressCourseSuccess: genericMockFn(),
});

export {
  createMockStore,
  createCompletedCourseRun,
  defaultInitialEnrollmentProps,
  createRawCourseRun,
};
