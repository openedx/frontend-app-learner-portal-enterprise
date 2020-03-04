import { createContext } from 'react';

const CourseContext = createContext({
  course: {},
  activeCourseRun: {},
  userEnrollments: [],
  userEntitlements: [],
});

export default CourseContext;
