import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { CourseContextProvider } from '../CourseContextProvider';
import CourseAssociatedPrograms from '../CourseAssociatedPrograms';

// eslint-disable-next-line react/prop-types
const CourseAssociatedProgramsWithCourseContext = ({ initialState = {} }) => (
  <CourseContextProvider initialState={initialState}>
    <CourseAssociatedPrograms />
  </CourseContextProvider>
);

describe('<CourseAssociatedPrograms />', () => {
  const initialState = {
    course: {
      programs: [
        {
          uuid: '123', type: 'abc', title: 'title a', marketingUrl: 'www.example.com',
        },
        {
          uuid: '456', type: 'def', title: 'title b', marketingUrl: 'www.example.com',
        },
      ],
    },
    activeCourseRun: {},
    userEnrollments: [],
    userEntitlements: [],
    catalog: {},
  };

  test('renders programs with title', () => {
    render(<CourseAssociatedProgramsWithCourseContext initialState={initialState} />);
    initialState.course.programs.forEach((program) => {
      expect(screen.queryByText(program.title)).toBeInTheDocument();
    });
  });
});
