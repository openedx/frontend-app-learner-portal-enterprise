import { createContext } from 'react';

const CourseContext = createContext({
  course: {},
  activeCourseRun: {},
});

export default CourseContext;
